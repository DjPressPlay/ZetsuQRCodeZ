import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import shortid from 'shortid';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('analytics.db');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id TEXT PRIMARY KEY,
    target_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id TEXT,
    scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    FOREIGN KEY(link_id) REFERENCES links(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  INSERT OR IGNORE INTO settings (key, value) VALUES ('is_pro', 'false');
`);

async function startServer() {
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

  app.use(express.json());

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

  // API: Create a short link
  app.post('/api/links', (req, res) => {
    const { targetUrl } = req.body;
    if (!targetUrl) return res.status(400).json({ error: 'Target URL is required' });

    const id = shortid.generate();
    const stmt = db.prepare('INSERT INTO links (id, target_url) VALUES (?, ?)');
    stmt.run(id, targetUrl);

    res.json({ id, shortUrl: `${process.env.APP_URL || 'http://localhost:3000'}/s/${id}` });
  });

  // API: Delete a link
  app.delete('/api/links/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM scans WHERE link_id = ?').run(id);
    const result = db.prepare('DELETE FROM links WHERE id = ?').run(id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Link not found' });
    }
  });

  // API: Get Analytics for a link
  app.get('/api/analytics/:id', (req, res) => {
    const { id } = req.params;
    
    const link = db.prepare('SELECT * FROM links WHERE id = ?').get(id);
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

  // API: Get All Links (for Dashboard)
  app.get('/api/links', (req, res) => {
    const status = db.prepare("SELECT value FROM settings WHERE key = 'is_pro'").get() as { value: string };
    const isPro = status.value === 'true';

    const links = db.prepare(`
      SELECT l.*, COUNT(s.id) as scan_count 
      FROM links l 
      LEFT JOIN scans s ON l.id = s.link_id 
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `).all();

    // If not pro, we only return the first 2, but we tell them how many are hidden
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
  });

  // REDIRECT: Handle short link scans
  app.get('/s/:id', (req, res) => {
    const { id } = req.params;
    const link = db.prepare('SELECT target_url FROM links WHERE id = ?').get(id) as { target_url: string } | undefined;

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
