import { useState, useRef, ChangeEvent, useCallback, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  X,
  QrCode,
  Check,
  AlertCircle,
  Sparkles,
  Info,
  LayoutDashboard,
  ExternalLink,
  BarChart3,
  Calendar,
  MousePointer2,
  Trash2,
  Lock,
  Crown
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

type View = 'generator' | 'dashboard';

interface LinkAnalytics {
  id: string;
  target_url: string;
  created_at: string;
  scan_count: number;
}

interface DetailedAnalytics {
  link: LinkAnalytics;
  scans: any[];
  chartData: { date: string; count: number }[];
}

interface LinksResponse {
  isPro: boolean;
  links: LinkAnalytics[];
  totalCount: number;
  hiddenCount: number;
}

export default function App() {
  const [view, setView] = useState<View>('generator');
  const [text, setText] = useState('https://google.com');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  
  // Analytics State
  const [linksData, setLinksData] = useState<LinksResponse | null>(null);
  const [selectedLink, setSelectedLink] = useState<DetailedAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinksData(data);
    } catch (err) {
      console.error('Failed to fetch links:', err);
    }
  };

  const fetchDetailedAnalytics = async (id: string) => {
    setIsLoadingAnalytics(true);
    try {
      const res = await fetch(`/api/analytics/${id}`);
      const data = await res.json();
      setSelectedLink(data);
    } catch (err) {
      console.error('Failed to fetch detailed analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this code and all its analytics?')) return;
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedLink?.link.id === id) setSelectedLink(null);
        fetchLinks();
      }
    } catch (err) {
      console.error('Failed to delete link:', err);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error('Upgrade failed:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  useEffect(() => {
    if (view === 'dashboard') {
      fetchLinks();
    }
  }, [view]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateArtisticQR = useCallback(async () => {
    if (!sourceImage || !text) return;
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create a tracking link first
      const linkRes = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: text }),
      });
      const { shortUrl } = await linkRes.json();

      // 2. Use Gemini to "create a new image" from the uploaded one
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const stylizeResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: sourceImage.split(',')[1],
                mimeType: 'image/png',
              },
            },
            {
              text: "Re-imagine this image as a vibrant, high-contrast, clean-lined cartoon illustration. Use bold, saturated colors and simplified shapes. The result must be a square image with a clear, uncluttered composition. Return only the image.",
            },
          ],
        },
      });

      let stylizedImageBase64 = '';
      for (const part of stylizeResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          stylizedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (!stylizedImageBase64) {
        throw new Error("AI failed to stylize the image. Please try again.");
      }

      // 3. Generate the raw QR Matrix using the TRACKING URL
      const qr = QRCode.create(shortUrl, { errorCorrectionLevel: 'H' });
      const modules = qr.modules;
      const moduleCount = modules.size;

      // 4. Prepare Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bgImg = new Image();
      bgImg.src = stylizedImageBase64;
      await new Promise((resolve, reject) => {
        bgImg.onload = resolve;
        bgImg.onerror = reject;
      });

      const size = 1024;
      canvas.width = size;
      canvas.height = size;
      const scale = size / moduleCount;

      ctx.drawImage(bgImg, 0, 0, size, size);

      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          const isDark = modules.get(row, col);
          const isFinder = (row < 7 && col < 7) || 
                          (row < 7 && col >= moduleCount - 7) || 
                          (row >= moduleCount - 7 && col < 7);
          
          if (isFinder) continue;

          const centerX = col * scale + scale / 2;
          const centerY = row * scale + scale / 2;
          const radius = scale * 0.18;

          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fillStyle = isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)';
          ctx.fill();
        }
      }

      const drawFinder = (x: number, y: number) => {
        ctx.fillStyle = 'black';
        ctx.fillRect(x * scale, y * scale, 7 * scale, 7 * scale);
        ctx.fillStyle = 'white';
        ctx.fillRect((x + 1) * scale, (y + 1) * scale, 5 * scale, 5 * scale);
        ctx.fillStyle = 'black';
        ctx.fillRect((x + 2) * scale, (y + 2) * scale, 3 * scale, 3 * scale);
      };

      drawFinder(0, 0);
      drawFinder(moduleCount - 7, 0);
      drawFinder(0, moduleCount - 7);

      setResultImage(canvas.toDataURL('image/png'));
    } catch (err: any) {
      console.error('Synthesis Error:', err);
      setError(err.message || 'Failed to generate artistic QR code.');
    } finally {
      setIsProcessing(false);
    }
  }, [sourceImage, text]);

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.download = `ai-qr-codez-${Date.now()}.png`;
    link.href = resultImage;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-white/10 flex flex-col">
      {/* Header */}
      <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold tracking-tighter text-xl">AI QR CodeZ</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setView('generator')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${view === 'generator' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Generator
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${view === 'dashboard' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button 
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
            >
              <Info className="w-4 h-4" />
              About
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-20 flex-grow w-full">
        <AnimatePresence mode="wait">
          {view === 'generator' ? (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <header className="mb-16 text-center">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6"
                >
                  <Sparkles className="w-3 h-3" />
                  Zetsu EDU presents AI QR CodeZ
                </motion.div>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-6">AI QR CodeZ</h1>
                <p className="text-zinc-500 max-w-xl mx-auto text-lg leading-relaxed">
                  Upload an image to re-imagine it as a vibrant illustration, then generate a scannable dot-matrix QR code integrated into the design.
                </p>
              </header>

              <main className="grid lg:grid-cols-2 gap-12 items-start">
                <section className="space-y-8">
                  <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-600">1. Link / Content</label>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="https://google.com"
                        className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-600">2. Reference Photo</label>
                      {!sourceImage ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full aspect-video rounded-3xl border-2 border-dashed border-zinc-800 bg-black/40 flex flex-col items-center justify-center gap-4 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all group"
                        >
                          <Upload className="w-6 h-6 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                          <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Upload Image</span>
                        </button>
                      ) : (
                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-800 group">
                          <img src={sourceImage} alt="Source" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setSourceImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateArtisticQR}
                    disabled={isProcessing || !sourceImage || !text}
                    className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all disabled:opacity-10 disabled:cursor-not-allowed uppercase tracking-widest"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                    {isProcessing ? 'Stylizing & Encoding...' : 'Generate Artwork'}
                  </button>

                  {error && (
                    <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}
                </section>

                <section className="relative">
                  <div className="aspect-square w-full rounded-[3.5rem] bg-zinc-900/20 border border-zinc-800 flex items-center justify-center overflow-hidden relative group">
                    <AnimatePresence mode="wait">
                      {resultImage ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full h-full p-6"
                        >
                          <img src={resultImage} alt="Result" className="w-full h-full object-contain rounded-[2.5rem] shadow-2xl shadow-white/5" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={downloadResult}
                              className="px-10 py-5 bg-white text-black rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform"
                            >
                              <Download className="w-5 h-5" />
                              Download
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-center space-y-6">
                          <div className="w-24 h-24 rounded-[2rem] bg-zinc-900 mx-auto flex items-center justify-center border border-zinc-800 shadow-inner">
                            <QrCode className="w-10 h-10 text-zinc-800" />
                          </div>
                          <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em]">
                            {isProcessing ? 'AI is creating...' : 'Awaiting Synthesis'}
                          </p>
                        </div>
                      )}
                    </AnimatePresence>

                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-16 h-16 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white animate-pulse">Processing</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 flex items-center justify-center gap-12">
                    <div className="flex flex-col items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest text-center">AI Stylized<br/>Background</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest text-center">Dot Matrix<br/>Encoding</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest text-center">High Contrast<br/>Finders</span>
                    </div>
                  </div>
                </section>
              </main>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <header className="flex items-end justify-between border-b border-zinc-800 pb-8">
                <div>
                  <h1 className="text-4xl font-bold tracking-tighter mb-2">Analytics Dashboard</h1>
                  <p className="text-zinc-500 text-sm">Track scans and performance for your AI QR CodeZ.</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Total Codes</p>
                    <p className="text-xl font-bold">{linksData?.totalCount || 0}</p>
                  </div>
                  <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-1">Total Scans</p>
                    <p className="text-xl font-bold">{linksData?.links.reduce((acc, curr) => acc + curr.scan_count, 0) || 0}</p>
                  </div>
                </div>
              </header>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Links List */}
                <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {linksData?.links.map((link) => (
                    <div key={link.id} className="relative group">
                      <button
                        onClick={() => fetchDetailedAnalytics(link.id)}
                        className={`w-full text-left p-6 rounded-3xl border transition-all ${
                          selectedLink?.link.id === link.id 
                            ? 'bg-white text-black border-white' 
                            : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-2 rounded-lg ${selectedLink?.link.id === link.id ? 'bg-black/10' : 'bg-zinc-800'}`}>
                            <QrCode className="w-4 h-4" />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${selectedLink?.link.id === link.id ? 'text-black/60' : 'text-zinc-600'}`}>
                            {new Date(link.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-bold truncate mb-1">{link.target_url}</p>
                        <div className="flex items-center gap-2">
                          <MousePointer2 className="w-3 h-3 opacity-60" />
                          <span className="text-xs font-medium">{link.scan_count} Scans</span>
                        </div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteLink(link.id); }}
                        className={`absolute top-4 right-4 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                          selectedLink?.link.id === link.id ? 'bg-black/5 text-black hover:bg-black/10' : 'bg-zinc-800 text-zinc-400 hover:text-red-400'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Hidden Codes CTA */}
                  {linksData && !linksData.isPro && linksData.hiddenCount > 0 && (
                    <div className="p-8 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[2.5rem] text-center space-y-6">
                      <div className="w-12 h-12 bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center">
                        <Lock className="w-6 h-6 text-zinc-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-1">{linksData.hiddenCount} More Codes Hidden</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">Upgrade to Pro to unlock your full history and analytics.</p>
                        <p className="text-[9px] text-zinc-600 mt-2 italic">No account needed. Purchase is tied to this app instance.</p>
                      </div>
                      <button
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-50"
                      >
                        {isUpgrading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                        Unlock All for $5
                      </button>
                    </div>
                  )}

                  {linksData?.links.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-zinc-800 rounded-3xl">
                      <p className="text-zinc-600 text-sm">No codes generated yet.</p>
                    </div>
                  )}
                </div>

                {/* Details / Chart */}
                <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-8 min-h-[500px] relative">
                  {isLoadingAnalytics ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-zinc-700" />
                    </div>
                  ) : selectedLink ? (
                    <div className="space-y-8 h-full flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold tracking-tighter mb-2">Scan Performance</h2>
                          <div className="flex items-center gap-4 text-zinc-500 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Created {new Date(selectedLink.link.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              <a href={selectedLink.link.target_url} target="_blank" rel="noreferrer" className="hover:text-white underline">Target URL</a>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold tracking-tighter">{selectedLink.link.scan_count}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Total Scans</p>
                        </div>
                      </div>

                      <div className="flex-grow min-h-[300px] w-full">
                        {selectedLink.chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedLink.chartData}>
                              <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                              <XAxis 
                                dataKey="date" 
                                stroke="#4a4a4a" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              />
                              <YAxis 
                                stroke="#4a4a4a" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                              />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#ffffff" 
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-4">
                            <BarChart3 className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-medium uppercase tracking-widest">No scan data yet</p>
                          </div>
                        )}
                      </div>

                      <div className="pt-8 border-t border-zinc-800">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          {selectedLink.scans.slice(0, 3).map((scan, i) => (
                            <div key={i} className="flex justify-between items-center text-xs p-3 bg-black/40 rounded-xl border border-zinc-800/50">
                              <span className="text-zinc-400">{new Date(scan.scanned_at).toLocaleString()}</span>
                              <span className="text-zinc-600 truncate max-w-[200px]">{scan.user_agent}</span>
                            </div>
                          ))}
                          {selectedLink.scans.length === 0 && <p className="text-zinc-700 text-xs italic">Waiting for first scan...</p>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-6">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center">
                        <MousePointer2 className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-sm font-medium uppercase tracking-widest">Select a code to view analytics</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 bg-black/50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[10px] md:text-xs font-medium text-zinc-500 tracking-widest leading-loose uppercase">
            Zetsumetsu EOe™ | Zetsu EDU™ | Zetsu R&D ⓒ | © 2024 - 2026 Zetsumetsu Corporation™ | Artworqq Kevin Suber
          </p>
        </div>
      </footer>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAbout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowAbout(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-bold tracking-tighter mb-6">About Zetsu AI QR CodeZ</h2>
              <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                <p>
                  AI QR CodeZ is a next-generation QR generation tool that blends high-end AI stylization with functional data encoding.
                </p>
                <div className="space-y-4">
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs">How it works</h3>
                  <ul className="space-y-3 list-disc pl-4">
                    <li><span className="text-white font-medium">AI Stylization:</span> The system uses advanced vision models to re-imagine your uploaded photo as a vibrant, clean-lined illustration.</li>
                    <li><span className="text-white font-medium">Tracking Links:</span> Every code generated is automatically assigned a tracking ID, allowing you to monitor scan performance in real-time.</li>
                    <li><span className="text-white font-medium">Dot-Matrix Encoding:</span> A scannable QR bit-matrix is integrated into the stylized artwork using discrete high-contrast dots.</li>
                  </ul>
                </div>

                <div className="space-y-4 pt-6 border-t border-zinc-800">
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs">Privacy & Data</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p><span className="text-white font-medium">No Profiles:</span> We do not require accounts, emails, or passwords. Your data is associated with this specific application instance.</p>
                    </div>
                    <div className="flex gap-3">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p><span className="text-white font-medium">Secure Payments:</span> All transactions are handled by Stripe. We never see or store your credit card information.</p>
                    </div>
                    <div className="flex gap-3">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p><span className="text-white font-medium">Anonymous Analytics:</span> Scan tracking is anonymous, recording only the time of scan and the general device type (User Agent).</p>
                    </div>
                  </div>
                </div>

                <p className="pt-4 border-t border-zinc-800 text-[10px] uppercase tracking-widest font-bold text-zinc-600">
                  Developed by Zetsumetsu Corporation™
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
