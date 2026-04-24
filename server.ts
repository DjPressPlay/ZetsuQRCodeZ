import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: any;
try {
  db = new Database('analytics.db');
  console.log('Database initialized successfully');
} catch (err) {
  console.error('Failed to initialize database:', err);
  // Fallback or exit
  process.exit(1);
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS qr_codes (
    id TEXT PRIMARY KEY,
    target_url TEXT NOT NULL,
    image_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id TEXT,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    FOREIGN KEY(link_id) REFERENCES qr_codes(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  INSERT OR IGNORE INTO settings (key, value) VALUES ('is_pro', 'true');
  UPDATE settings SET value = 'true' WHERE key = 'is_pro';
`);

async function startServer() {
  console.log('Starting server...', { NODE_ENV: process.env.NODE_ENV });
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // Stripe Webhook needs raw body
  app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      db.prepare("UPDATE settings SET value = 'true' WHERE key = 'is_pro'").run();
      console.log('Payment successful: Pro status unlocked');
    }

    res.json({ received: true });
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  
  app.get('/api/links', (req, res) => {
    console.log('GET /api/links hit (TOP)');
    try {
      const status = db.prepare("SELECT value FROM settings WHERE key = 'is_pro'").get() as { value: string };
      const isPro = status.value === 'true';

      const links = db.prepare(`
        SELECT l.*, COUNT(s.id) as scan_count 
        FROM qr_codes l 
        LEFT JOIN scans s ON l.id = s.link_id 
        GROUP BY l.id
        ORDER BY l.created_at DESC
      `).all();

      if (!isPro && links.length > 2) {
        res.json({
          isPro: false,
          links: links.slice(0, 2),
          totalCount: links.length,
          hiddenCount: links.length - 2
        });
      } else {
        res.json({
          isPro: true,
          links: links,
          totalCount: links.length,
          hiddenCount: 0
        });
      }
    } catch (err) {
      console.error('Database error in /api/links:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API: Get Runtime Config (to bridge secrets to the frontend safely)
  app.get('/api/config', (req, res) => {
    res.json({ 
      apiKey: process.env.GEMINI_API_KEY || '',
      appUrl: process.env.APP_URL || ''
    });
  });

  // API: Get Pro Status
  app.get('/api/pro-status', (req, res) => {
    const status = db.prepare("SELECT value FROM settings WHERE key = 'is_pro'").get() as { value: string };
    res.json({ isPro: status.value === 'true' });
  });

  // API: Create Stripe Checkout Session
  app.post('/api/checkout', async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AI QR CodeZ Pro Unlock',
              description: 'One-time payment to unlock all your QR codes and analytics history.',
            },
            unit_amount: 500, // $5.00
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment=success`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/?payment=cancel`,
      });
      res.json({ url: session.url });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Increment likes
  app.post('/api/links/:id/like', (req, res) => {
    const { id } = req.params;
    const result = db.prepare('UPDATE qr_codes SET likes = likes + 1 WHERE id = ?').run(id);
    if (result.changes > 0) {
      const updated = db.prepare('SELECT likes FROM qr_codes WHERE id = ?').get(id) as { likes: number };
      res.json({ success: true, likes: updated.likes });
    } else {
      res.status(404).json({ error: 'Link not found' });
    }
  });

  // API: Increment downloads
  app.post('/api/links/:id/download', (req, res) => {
    const { id } = req.params;
    const result = db.prepare('UPDATE qr_codes SET downloads = downloads + 1 WHERE id = ?').run(id);
    if (result.changes > 0) {
      const updated = db.prepare('SELECT downloads FROM qr_codes WHERE id = ?').get(id) as { downloads: number };
      res.json({ success: true, downloads: updated.downloads });
    } else {
      res.status(404).json({ error: 'Link not found' });
    }
  });

  // API: Create a short link
  app.post('/api/links', async (req, res) => {
    const { targetUrl, imageData } = req.body;
    if (!targetUrl) return res.status(400).json({ error: 'Target URL is required' });

    // Check Pro Status and Limit
    const status = db.prepare("SELECT value FROM settings WHERE key = 'is_pro'").get() as { value: string };
    const isPro = status.value === 'true';
    
    if (!isPro) {
      const countToday = db.prepare("SELECT COUNT(*) as count FROM qr_codes WHERE date(created_at) = date('now')").get() as { count: number };
      if (countToday.count >= 2) {
        return res.status(403).json({ 
          error: 'Daily limit reached', 
          message: 'Free users can create 2 QR codes per day. Upgrade to Pro for unlimited daily creations.' 
        });
      }
    }

    const id = Math.random().toString(36).substring(2, 10);
    const stmt = db.prepare('INSERT INTO qr_codes (id, target_url, image_data) VALUES (?, ?, ?)');
    stmt.run(id, targetUrl, imageData || null);

    res.json({ id, shortUrl: `${process.env.APP_URL || 'http://localhost:3000'}/s/${id}` });
  });

  // API: Update a link (e.g. save the generated image)
  app.patch('/api/links/:id', (req, res) => {
    const { id } = req.params;
    const { imageData } = req.body;
    
    try {
      const result = db.prepare('UPDATE qr_codes SET image_data = ? WHERE id = ?').run(imageData, id);
      if (result.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Link not found' });
      }
    } catch (err) {
      console.error('Update link error:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // API: Get Global Recent Links
  app.get('/api/global-links', (req, res) => {
    try {
      const links = db.prepare(`
        SELECT l.*, COUNT(s.id) as scan_count 
        FROM qr_codes l 
        LEFT JOIN scans s ON l.id = s.link_id 
        WHERE l.image_data IS NOT NULL
        GROUP BY l.id
        ORDER BY l.created_at DESC
        LIMIT 20
      `).all();
      res.json(links);
    } catch (err) {
      console.error('Database error in /api/global-links:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // API: Delete a link
  app.delete('/api/links/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM scans WHERE link_id = ?').run(id);
    const result = db.prepare('DELETE FROM qr_codes WHERE id = ?').run(id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Link not found' });
    }
  });

  // API: Get Analytics for a link
  app.get('/api/analytics/:id', (req, res) => {
    const { id } = req.params;
    
    const link = db.prepare('SELECT * FROM qr_codes WHERE id = ?').get(id);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    const scans = db.prepare('SELECT * FROM scans WHERE link_id = ? ORDER BY scanned_at DESC').all(id);
    
    // Group scans by date for charts
    const chartData = db.prepare(`
      SELECT date(scanned_at) as date, COUNT(*) as count 
      FROM scans 
      WHERE link_id = ? 
      GROUP BY date(scanned_at)
      ORDER BY date ASC
    `).all(id);

    res.json({ link, scans, chartData });
  });

  // REDIRECT: Handle short link scans
  app.get('/s/:id', async (req, res) => {
    const { id } = req.params;
    
    // Check Supabase first if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { data, error } = await supabase
          .from('qr_codes')
          .select('target_url')
          .eq('id', id)
          .single();
        
        if (!error && data) {
          // Log scan to SQLite (local analytics) or Supabase
          const userAgent = req.headers['user-agent'] || 'unknown';
          db.prepare('INSERT INTO scans (link_id, user_agent) VALUES (?, ?)').run(id, userAgent);
          return res.redirect(data.target_url);
        }
      } catch (err) {
        console.error('Supabase redirect error:', err);
      }
    }

    const link = db.prepare('SELECT target_url FROM qr_codes WHERE id = ?').get(id) as { target_url: string } | undefined;

    if (link) {
      // Log the scan
      const userAgent = req.headers['user-agent'] || 'unknown';
      db.prepare('INSERT INTO scans (link_id, user_agent) VALUES (?, ?)').run(id, userAgent);
      
      // Redirect to target
      res.redirect(link.target_url);
    } else {
      res.status(404).send('Link not found');
    }
  });

  // Catch-all for API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Global Error Handler to prevent HTML responses on API errors
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: err.message,
      path: req.path
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
