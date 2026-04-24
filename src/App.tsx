import { useState, useRef, ChangeEvent, useCallback, useEffect, CSSProperties } from 'react';
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
  Crown,
  Moon,
  Sun,
  Heart,
  Eye,
  HelpCircle,
  Zap,
  ShieldCheck,
  Printer,
  LogOut
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './lib/supabase';
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

type View = 'home' | 'generator' | 'dashboard' | 'signin' | 'signup';

interface RecentQR {
  id: string;
  image: string;
  url: string;
  createdAt: string;
}

interface LinkAnalytics {
  id: string;
  target_url: string;
  image_data?: string;
  created_at: string;
  scan_count: number;
  likes: number;
  downloads: number;
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

function HomeView({ recentQRs, linksData, setView, onLike, onDownload }: { 
  recentQRs: RecentQR[], 
  linksData: LinksResponse | null, 
  setView: (v: View) => void, 
  onLike: (id: string) => void,
  onDownload: (id: string) => void
}) {
  const isDarkMode = true;
  const luxuryClass = isDarkMode ? 'luxury-border-gold' : 'luxury-border-silver';
  const luxuryBg = isDarkMode ? '#000000' : '#eff6ff'; // Using a better light-mode fallback for home images
  const luxuryStyle = { '--luxury-bg': luxuryBg } as CSSProperties;
  const heroQR = recentQRs[0];
  
  const [globalLinks, setGlobalLinks] = useState<LinkAnalytics[]>([]);

  useEffect(() => {
    fetch('/api/global-links')
      .then(res => res.json())
      .then(data => setGlobalLinks(data))
      .catch(err => console.error('Failed to fetch global links:', err));
  }, []);

  const trendingQRs = linksData?.links
    ? [...linksData.links]
        .sort((a, b) => (b.likes + b.scan_count + b.downloads) - (a.likes + a.scan_count + a.downloads))
        .slice(0, 6)
        .map(link => recentQRs.find(qr => qr.id === link.id))
        .filter(Boolean) as RecentQR[]
    : [];

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getStats = (id: string) => {
    const link = linksData?.links.find(l => l.id === id) || globalLinks.find(l => l.id === id);
    return {
      likes: link?.likes || 0,
      downloads: link?.downloads || 0,
      scans: link?.scan_count || 0
    };
  };

  return (
    <div className="space-y-32 pb-32">
      {/* Rebranded Header Section */}
      <section className="space-y-8 pt-8 text-center px-6">
        <div className="space-y-6 flex flex-col items-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 animate-pulse">Zetsumetsu EOe™</span>
            <h1 className="text-5xl lg:text-8xl font-black italic uppercase tracking-tighter font-serif">Luxury QR CodeZ from Zetsumetsu EOe</h1>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <div className={`h-px w-12 bg-zinc-800`} />
            <p className="text-xl lg:text-2xl font-light italic text-zinc-400 font-serif">Where utility meets luxury design.</p>
            <div className={`h-px w-12 bg-zinc-800`} />
          </div>
          <p className={`text-sm font-medium leading-relaxed max-w-2xl text-zinc-500`}>
            Transform ordinary links into scannable works of art—crafted to elevate your brand at every touchpoint.
          </p>
          <div className="pt-4 flex gap-4">
             <button onClick={() => setView('generator')} className="btn-primary">Begin Synthesis</button>
          </div>
        </div>
      </section>

      {/* The Evolution of Engagement */}
      <section className="space-y-16 py-16 px-6">
        <div className="text-center space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">Traditional vs. Zetsu</span>
          <h2 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter font-serif">The Evolution</h2>
        </div>
        
        <div className="relative max-w-3xl mx-auto rounded-[3rem] overflow-hidden border border-zinc-900 shadow-2xl group">
           <img 
            src="https://assets.skool.com/f/0f7f15bc8d494ed0b4bfb968b9a216e4/39aeeadd8084490f982fd66ea16990a89176734750fc4be4ae73738181d49fe0.png" 
            alt="The Evolution: Multi-Code Clutter vs Zetsu QR" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12 text-center">
              <p className="text-xl lg:text-3xl font-serif italic text-amber-500">One Scan. Complete Brand Story. 10x User Engagement.</p>
           </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
             <h4 className="text-amber-500 font-serif italic font-black uppercase text-xs tracking-widest">Structural Engineering</h4>
             <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">Our AI dot-matrix architecture is physically engineered from the ground up, unlike standard QR codes. Every module is built differently to ensure peak scannability within high-end digital art.</p>
          </div>
          <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
             <h4 className="text-amber-500 font-serif italic font-black uppercase text-xs tracking-widest">Unified Identity</h4>
             <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">Eliminate multi-code clutter. One masterpiece links to your entire digital ecosystem via a high-end brand portal.</p>
          </div>
          <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
             <h4 className="text-amber-500 font-serif italic font-black uppercase text-xs tracking-widest">Enhanced Perception</h4>
             <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">Transform a moment of utility into a moment of luxury. Every scan reinforces your position in the premium market.</p>
          </div>
        </div>
      </section>

      {/* Scannable Masterpieces */}
      <section className="grid lg:grid-cols-2 gap-16 items-center px-6">
        <div className="order-2 lg:order-1 relative aspect-[4/5] rounded-[3rem] overflow-hidden border border-zinc-900 group luxury-border-gold shadow-2xl" style={luxuryStyle}>
           <img 
            src="https://assets.skool.com/f/0f7f15bc8d494ed0b4bfb968b9a216e4/594313b3450d4622a1aac473b1805731cde7bf6e1aba4822abab26838a3bbb42.png" 
            alt="Scannable Masterpiece" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
           />
           <div className="absolute bottom-12 right-12">
              <div className="w-16 h-16 bg-amber-500 flex items-center justify-center font-black italic shadow-lg">+</div>
           </div>
        </div>
        <div className="order-1 lg:order-2 space-y-10">
          <div className="space-y-2 text-right lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-black italic uppercase tracking-tighter text-amber-500 font-serif">Scannable Masterpieces</h2>
          </div>
          <div className="space-y-8">
            <p className="text-2xl font-light leading-snug">Our generative AI seamlessly weaves destination URLs into <span className="italic font-serif">beautiful imagery</span>.</p>
            <p className="text-sm text-zinc-500 leading-relaxed font-medium">We merge function with your brand's unique storytelling, transforming utility into a high-end experience.</p>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="p-8 border border-zinc-800 rounded-2xl flex flex-col items-center text-center gap-3 hover:bg-zinc-900/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="font-black italic uppercase text-xs tracking-widest text-white">Invisible</p>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Integration</p>
                  </div>
               </div>
               <div className="p-8 border border-zinc-800 rounded-2xl flex flex-col items-center text-center gap-3 hover:bg-zinc-900/50 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="font-black italic uppercase text-xs tracking-widest text-white">Flawless</p>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Scanning</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elevate Every Touchpoint */}
      <section className="space-y-16 py-16 px-6 bg-zinc-950/50 border-y border-zinc-900">
        <div className="text-center space-y-4">
          <h2 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter font-serif">Elevate Every Touchpoint</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Restaurant Menus",
              desc: "Elevate the dining experience with scannable table art that complements the interior design.",
              icon: <Zap className="w-4 h-4" />,
              image: "https://assets.skool.com/f/0f7f15bc8d494ed0b4bfb968b9a216e4/d4bd14a0b6ef4250be6c2312ca80f2c700a3e7f75ef543ea98f155a9895c81fe.png"
            },
            {
              title: "Business Cards",
              desc: "Make a lasting first impression. A unique digital bridge that sparks conversation before it's even scanned.",
              icon: <Zap className="w-4 h-4" />,
              image: "https://assets.skool.com/f/0f7f15bc8d494ed0b4bfb968b9a216e4/9e5c0d113c864dada83da387215e1a2fa7a0276ea68c4a1cb99437dbf7511f5c.png"
            },
            {
              title: "Event Posters",
              desc: "Turn promotional materials into interactive gallery pieces that draw audiences in rather than pushing them away.",
              icon: <Zap className="w-4 h-4" />,
              image: "https://assets.skool.com/f/0f7f15bc8d494ed0b4bfb968b9a216e4/59554960e5554c7fa7ae89d67f06cd58af85ad66fb1642d7ac351de2bca2be95.png"
            },
            {
              title: "Product Packaging",
              desc: "Tell your brand story right on the box. Premium packaging demands premium digital integration.",
              icon: <Zap className="w-4 h-4" />,
              image: "https://assets.skool.com/f/0f7f15bc8d494ed0b4bfb968b9a216e4/2a2e6a3c9ae54e2ea4a878f961ef5cd555fa041d74a7435d87bf54e168175575.png"
            }
          ].map((item, i) => (
            <div key={i} className="group overflow-hidden border border-zinc-900 rounded-3xl bg-black hover:border-amber-500/30 transition-all">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8 space-y-6">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  {item.icon}
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-black italic uppercase tracking-tight text-white">{item.title}</h4>
                  <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Three Steps to Synthesis */}
      <section className="space-y-16 py-16 px-6">
        <div className="text-center space-y-4">
          <h2 className="text-4xl lg:text-7xl font-black italic uppercase tracking-tighter font-serif">Three Steps to Synthesis</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              title: "Input URL",
              desc: "Enter the destination. A website, social profile, or digital menu.",
              image: "https://assets.skool.com/f/0f7f15bc8d494ed0b4bfb968b9a216e4/55b2a10cf30c4fbf813f01bc62d9d2e7e1b85c73d0234244a7b85496c7906a99.jpg"
            },
            {
              title: "Choose Style",
              desc: "Provide your brand's reference image and our AI will translate its core aesthetic into the Zetsu Code.",
              image: "https://assets.skool.com/f/0f7f15bc8d494ed0b4bfb968b9a216e4/4a9974f37e0f40898ad37763db5246fae9b72c6e92d04d3480ccc3f15502db1d.jpg"
            },
            {
              title: "Synthesize",
              desc: "Our AI engine merges the QR data with your style into a scannable masterpiece.",
              image: "https://assets.skool.com/f/0f7f15bc8d494ed0b4bfb968b9a216e4/a2434155eaf6435d82918fb6d92114d6bd108f8f654641419248e8f1b479041a.jpg"
            }
          ].map((item, i) => (
            <div key={i} className="space-y-8 group text-center flex flex-col items-center">
              <div 
                className={`relative w-full aspect-video rounded-[2.5rem] overflow-hidden border border-zinc-800 transition-colors luxury-border-gold shadow-2xl`}
                style={{ '--luxury-bg': '#000000' } as CSSProperties}
              >
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-black italic tracking-tighter text-amber-500 uppercase font-serif">{item.title}</h4>
                <p className={`text-xs font-medium leading-relaxed text-zinc-500 italic px-4`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engineered for Luxury Brands */}
      <section className="relative h-[80vh] rounded-[4rem] overflow-hidden group shadow-2xl mx-6">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80" 
          alt="High Fashion" 
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col items-center justify-center text-center p-12">
           <div className="space-y-6 max-w-3xl">
              <h2 className="text-5xl lg:text-8xl font-black italic uppercase tracking-tighter font-serif">Engineered for Luxury Brands</h2>
              <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Powered by Zetsumetsu EOe™ and Zetsu R&D ©.</p>
                <p className="text-sm font-medium text-zinc-500 max-w-xl italic">This isn't a simple overlay filter; it's a proprietary blend of aesthetic intelligence and data integrity.</p>
              </div>
           </div>
        </div>
      </section>

      {/* Some QR codes do the job */}
      <section className="grid lg:grid-cols-2 gap-16 items-center py-32 border-t border-zinc-900 px-6">
         <div className="space-y-12">
            <div className="space-y-6">
               <h2 className="text-3xl lg:text-6xl font-black italic uppercase tracking-tighter font-serif leading-none">Some QR codes do the job. <span className="text-amber-500">This one makes a statement.</span></h2>
               <div className="h-1 w-24 bg-amber-500" />
            </div>
            <div className="space-y-8">
               <p className="text-2xl font-light leading-snug">There's a version of everything that works, and there's a version that <span className="italic font-serif">turns heads</span>. You already know the difference. You've felt it.</p>
               <p className="text-xl font-medium text-zinc-400 leading-relaxed">A Zetsu QR code is the one people notice before they scan it. Built into the art. Carrying your brand. Saying something about you the moment someone sees it.</p>
               <p className="text-2xl font-black italic uppercase tracking-widest text-amber-500 font-serif">That's the one you want.</p>
            </div>
            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-500">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Limited Intake Notice</span>
              </div>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">Due to the high computational demand of our aesthetic engine, we are currently limiting new Executive intakes. Prices are scheduled to increase as we reach capacity.</p>
            </div>
         </div>
         <div className="grid sm:grid-cols-2 gap-6 relative">
            {/* Free Tier */}
            <div className="p-8 rounded-[2.5rem] border border-white bg-zinc-950 flex flex-col items-center text-center gap-6 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative overflow-hidden group">
                <div className="relative space-y-1">
                   <p className="text-5xl font-black italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">FREE</p>
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">DAILY ACCESS</p>
                </div>
                <div className="space-y-2">
                  <p className="relative text-[9px] font-black text-white uppercase tracking-widest">• 1 SCAN MASTERPIECE / DAY</p>
                  <p className="relative text-[9px] font-black text-white uppercase tracking-widest">• SIGN-IN REQUIRED</p>
                  <p className="relative text-[9px] font-black text-white uppercase tracking-widest">• COMMUNITY GALLERY ACCESS</p>
                </div>
                <button 
                  onClick={() => setView('signup')}
                  className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  Sign In to Try
                </button>
            </div>

            {/* Paid Tier */}
            <div className="p-8 rounded-[2.5rem] border border-amber-500/30 bg-zinc-950 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                <div className="relative space-y-1">
                   <p className="text-5xl font-black italic text-white">$50</p>
                   <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">EXECUTIVE / MO</p>
                </div>
                <div className="space-y-2">
                  <p className="relative text-[9px] font-black text-amber-500/80 uppercase tracking-widest">• 30 BRANDED QR CODES / MO</p>
                  <p className="relative text-[9px] font-black text-amber-500/80 uppercase tracking-widest">• BRAND MANAGEMENT DASHBOARD</p>
                  <p className="relative text-[9px] font-black text-amber-500/80 uppercase tracking-widest">• PRIORITY ARCHITECTURE</p>
                  <p className="relative text-[9px] font-black text-amber-500/80 uppercase tracking-widest">• REMOVE WATERMARKS</p>
                </div>
                <button 
                  onClick={() => setView('signup')}
                  className="w-full py-4 bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-amber-400 transition-colors relative z-10"
                >
                  Get Full Suite
                </button>
            </div>
         </div>
      </section>

      {/* Global Collection Section */}
      {globalLinks.length > 0 && (
        <section className="space-y-12 px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] flex items-center gap-3 font-serif">
              Gallery of Synthesis
            </h3>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 font-serif">GLOBAL COLLECTION</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {globalLinks.map((link, i) => (
              <motion.div
                key={`global-${link.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative aspect-[2/3] rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl bg-zinc-900 luxury-border-gold`}
                style={{ '--luxury-bg': '#0a0a0a' } as CSSProperties}
              >
                <img src={link.image_data} alt="QR" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-6 text-center">
                  <div className="w-full space-y-4">
                    <p className="text-[9px] font-black text-white uppercase tracking-widest truncate w-full drop-shadow-md">{getHostname(link.target_url)}</p>
                    
                    <div className="flex items-center justify-center gap-4 text-white/70 text-[10px] font-black">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {link.scan_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {link.likes}
                      </div>
                    </div>

                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onLike(link.id);
                        }}
                        className="p-3 bg-white text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all scale-75 hover:scale-90 active:scale-75 shadow-lg"
                      >
                        <Heart className="w-3 h-3 fill-current" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(link.id);
                          const downloadLink = document.createElement('a');
                          downloadLink.download = `qr-${link.id}.png`;
                          downloadLink.href = link.image_data || '';
                          downloadLink.click();
                        }}
                        className="p-3 bg-white text-black rounded-full hover:bg-amber-400 transition-all scale-75 hover:scale-90 active:scale-75 shadow-lg"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recent QRs Section */}
      {recentQRs.length > 0 && (
        <section className="space-y-12 px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.5em] flex items-center gap-3 font-serif">
              Your Creations
            </h3>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 font-serif">PERSONAL GALLERY</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {recentQRs.map((qr, i) => (
              <motion.div
                key={qr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative aspect-[2/3] rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl bg-zinc-900 luxury-border-gold`}
                style={{ '--luxury-bg': '#0a0a0a' } as CSSProperties}
              >
                <img src={qr.image} alt="QR" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-6 text-center">
                  <div className="w-full space-y-4">
                    <p className="text-[9px] font-black text-white uppercase tracking-widest truncate w-full drop-shadow-md">{getHostname(qr.url)}</p>
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(qr.id);
                          const downloadLink = document.createElement('a');
                          downloadLink.download = `qr-${qr.id}.png`;
                          downloadLink.href = qr.image;
                          downloadLink.click();
                        }}
                        className="p-3 bg-white text-black rounded-full hover:bg-amber-400 transition-all scale-75 hover:scale-90 active:scale-75 shadow-lg"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Footer / Call to Action */}
      <section className="py-32 text-center space-y-12 px-6">
        <div className="space-y-6">
          <h2 className="text-5xl lg:text-9xl font-black italic uppercase tracking-tighter font-serif">Begin Your Synthesis.</h2>
          <p className="text-xl lg:text-3xl font-light italic text-zinc-500 font-serif">Transform your links into art today.</p>
        </div>
        <div className="flex flex-col items-center gap-12">
           <button onClick={() => setView('generator')} className="btn-primary scale-125">Synthesize Now</button>
           <div className="flex flex-col items-center gap-4 pt-12">
             <button 
               onClick={() => {
                 window.focus();
                 window.print();
               }} 
               className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-amber-500 transition-colors mb-4 no-print cursor-pointer"
             >
               <Printer className="w-3 h-3" />
               Print Page as PDF
             </button>
             <div className="h-px w-48 bg-zinc-900" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">Luxury QR CodeZ from Zetsumetsu EOe | Zetsumetsu Corporation™</p>
             <p className="text-[8px] font-medium text-zinc-800 uppercase tracking-widest leading-relaxed max-w-sm">
                Bespoke digital assets engineered for the premium market. Uncompromising quality. Unmatched aesthetics.
             </p>
           </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [text, setText] = useState('https://google.com');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [recentQRs, setRecentQRs] = useState<RecentQR[]>([]);
  const [brandName, setBrandName] = useState('');
  const [logoImage, setLogoImage] = useState<string | null>(null);

  // Supabase Auth State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async () => {
    setAuthLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
    });
    if (error) setError(error.message);
    else setView('home');
    setAuthLoading(false);
  };

  const handleSignIn = async () => {
    setAuthLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (error) setError(error.message);
    else setView('home');
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setView('home');
  };
  
  // Analytics State
  const [linksData, setLinksData] = useState<LinksResponse | null>(null);
  const [selectedLink, setSelectedLink] = useState<DetailedAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [apiKey, setApiKey] = useState(process.env.GEMINI_API_KEY || '');
  const isDarkMode = true;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch runtime config to un-bake secrets from the build process
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.apiKey) {
          setApiKey(data.apiKey);
        }
      })
      .catch(err => console.error('Config Fetch Error:', err));
  }, []);

  const luxuryClass = isDarkMode ? 'luxury-border-gold' : 'luxury-border-silver';
  const luxuryBg = isDarkMode ? '#000000' : '#1d4ed8';
  const luxuryStyle = { '--luxury-bg': luxuryBg } as CSSProperties;

  const fetchLinks = async () => {
    if (!session) return;
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          qr_interactions (
            type
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedLinks = data.map((qr: any) => ({
        id: qr.id,
        target_url: qr.target_url,
        image_data: qr.image_data,
        created_at: qr.created_at,
        scan_count: qr.qr_interactions?.filter((i: any) => i.type === 'scan').length || 0,
        likes: qr.qr_interactions?.filter((i: any) => i.type === 'like').length || 0,
        downloads: qr.qr_interactions?.filter((i: any) => i.type === 'download').length || 0,
      }));

      setLinksData({
        isPro: true, // Assuming Supabase users are treated as pro or simplified for this flow
        links: processedLinks,
        totalCount: processedLinks.length,
        hiddenCount: 0
      });
      
      // Update local recent QRs state too
      setRecentQRs(processedLinks.map(l => ({
        id: l.id,
        image: l.image_data,
        url: l.target_url,
        createdAt: l.created_at
      })));
    } catch (err) {
      console.error('Failed to fetch from Supabase:', err);
    }
  };

  const fetchDetailedAnalytics = async (id: string) => {
    setIsLoadingAnalytics(true);
    try {
      const { data: qr, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', id)
        .single();

      if (qrError) throw qrError;

      const { data: interactions, error: intError } = await supabase
        .from('qr_interactions')
        .select('*')
        .eq('qr_code_id', id)
        .order('created_at', { ascending: true });

      if (intError) throw intError;

      // Group by date for chart
      const chartDataMap = interactions.reduce((acc: any, curr: any) => {
        const date = new Date(curr.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(chartDataMap).map(([date, count]) => ({
        date,
        count: count as number
      }));

      const linkAnalytic = {
        id: qr.id,
        target_url: qr.target_url,
        image_data: qr.image_data,
        created_at: qr.created_at,
        scan_count: interactions.filter((i: any) => i.type === 'scan').length,
        likes: interactions.filter((i: any) => i.type === 'like').length,
        downloads: interactions.filter((i: any) => i.type === 'download').length,
      };

      setSelectedLink({
        link: linkAnalytic,
        scans: interactions.filter((i: any) => i.type === 'scan'),
        chartData
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('qr_codes').delete().eq('id', id);
      if (error) throw error;
      if (selectedLink?.link.id === id) setSelectedLink(null);
      fetchLinks();
    } catch (err) {
      console.error('Delete failed:', err);
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
    if (session) {
      fetchLinks();
    } else {
      const saved = localStorage.getItem('recent_qrs');
      if (saved) {
        try {
          setRecentQRs(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse recent QRs', e);
        }
      }
    }
  }, [view, session]);

  const saveRecentQR = (qr: RecentQR) => {
    setRecentQRs(prev => {
      const updated = [qr, ...prev].slice(0, 12);
      try {
        localStorage.setItem('recent_qrs', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage (likely quota exceeded)', e);
        // If quota exceeded, try saving fewer
        try {
          localStorage.setItem('recent_qrs', JSON.stringify(updated.slice(0, 5)));
        } catch (e2) {
          localStorage.removeItem('recent_qrs');
        }
      }
      return updated;
    });
  };

  const handleLike = async (id: string) => {
    if (!id) return;
    try {
      const { error } = await supabase.from('qr_interactions').insert({
        qr_code_id: id,
        type: 'like'
      });
      if (error) throw error;
      fetchLinks();
    } catch (err) {
      console.error('Failed to like in Supabase:', err);
    }
  };

  const handleDownload = async (id: string) => {
    if (!id) return;
    try {
      const { error } = await supabase.from('qr_interactions').insert({
        qr_code_id: id,
        type: 'download'
      });
      if (error) throw error;
      fetchLinks();
    } catch (err) {
      console.error('Failed to track download in Supabase:', err);
    }
  };

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
      
      const contentType = linkRes.headers.get('content-type');
      if (!linkRes.ok) {
        let errorMessage = `Server error ${linkRes.status}`;
        try {
          if (contentType && contentType.includes('application/json')) {
            const linkData = await linkRes.json();
            errorMessage = linkData.message || linkData.error || errorMessage;
          } else {
            const text = await linkRes.text();
            errorMessage = text.slice(0, 100) || errorMessage;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const linkData = await linkRes.json();

      const { shortUrl } = linkData;

      // 2. Use Gemini to "re-imagine" the image (Hardcoded Key)
      const ai = new GoogleGenAI({ apiKey: "AIzaSyCTbHXfUzXZfjSlMdNRinwKxY6aLd_v3tE" });
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
              text: "Transform this image into a professional, high-fidelity digital art masterpiece. Style: Vibrant neo-pop illustration with clean vector-like lines, sophisticated color gradients, and cinematic lighting. Composition: Centered, square format, optimized for high-contrast visibility. The artwork should be detailed yet scannable, maintaining the core essence of the original image while elevating it to a premium artistic standard. Return only the image.",
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let stylizedImageBase64 = '';
      const parts = stylizeResponse.candidates?.[0]?.content?.parts;
      if (!parts) {
        throw new Error('AI failed to generate artwork. Please try again.');
      }
      
      for (const part of parts) {
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

      const size = 2048;
      const padding = 200; // Space for the premium frame
      const totalSize = size + padding * 2;
      
      canvas.width = totalSize;
      canvas.height = totalSize;
      const scale = size / moduleCount;

      // --- 1. Draw Premium Frame ---
      // Fill entire background with the luxury black
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, totalSize, totalSize);

      // Draw the main rounded container (The "Image" border)
      const frameRadius = size * 0.15;
      ctx.beginPath();
      ctx.roundRect(padding / 2, padding / 2, totalSize - padding, totalSize - padding, frameRadius);
      ctx.fillStyle = '#111111';
      ctx.fill();
      
      // Draw the thin gold border line
      const goldGradient = ctx.createLinearGradient(0, 0, totalSize, totalSize);
      goldGradient.addColorStop(0, '#fde68a'); // Amber 200
      goldGradient.addColorStop(0.5, '#fbbf24'); // Amber 400
      goldGradient.addColorStop(1, '#fde68a');
      
      ctx.strokeStyle = goldGradient;
      ctx.lineWidth = 12;
      ctx.stroke();

      // Clip the QR content area with rounded corners
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(padding, padding, size, size, frameRadius * 0.8);
      ctx.clip();

      // --- 2. Draw QR Content (Inside Clipped Area) ---
      // Draw Background AI Image
      ctx.drawImage(bgImg, padding, padding, size, size);

      // Add a very subtle "protection" layer to normalize background contrast for the dots
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(padding, padding, size, size);

      // Draw Dot Matrix
      const logoSizeModules = Math.ceil(moduleCount * 0.22);
      const logoStart = Math.floor((moduleCount - logoSizeModules) / 2);
      const logoEnd = logoStart + logoSizeModules;

      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          const isDark = modules.get(row, col);
          
          const isFinder = (row < 7 && col < 7) || 
                          (row < 7 && col >= moduleCount - 7) || 
                          (row >= moduleCount - 7 && col < 7);
          
          const isAlignment = (row >= moduleCount - 9 && row < moduleCount - 4 && col >= moduleCount - 9 && col < moduleCount - 4);
          
          const isLogoArea = (row >= logoStart && row < logoEnd && col >= logoStart && col < logoEnd);

          if (isFinder || isAlignment || isLogoArea) continue;

          const centerX = padding + col * scale + scale / 2;
          const centerY = padding + row * scale + scale / 2;
          
          if (isDark) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, scale * 0.42, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(centerX, centerY, scale * 0.12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
          }
        }
      }
      ctx.restore(); // Stop clipping

      // --- 3. Draw Functional Patterns (Finders and Alignment) ---
      const drawFinder = (x_mod: number, y_mod: number) => {
        const x = padding + x_mod * scale;
        const y = padding + y_mod * scale;
        
        // Outer white border for finders
        ctx.fillStyle = 'white';
        ctx.fillRect(x - 5, y - 5, 7 * scale + 10, 7 * scale + 10);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, 7 * scale, 7 * scale);
        ctx.fillStyle = 'white';
        ctx.fillRect(x + scale, y + scale, 5 * scale, 5 * scale);
        ctx.fillStyle = 'black';
        ctx.fillRect(x + 2 * scale, y + 2 * scale, 3 * scale, 3 * scale);
      };

      const drawAlignment = (x_mod: number, y_mod: number) => {
        const x = padding + x_mod * scale;
        const y = padding + y_mod * scale;
        ctx.fillStyle = 'white';
        ctx.fillRect(x - 5, y - 5, 5 * scale + 10, 5 * scale + 10);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, 5 * scale, 5 * scale);
        ctx.fillStyle = 'white';
        ctx.fillRect(x + scale, y + scale, 3 * scale, 3 * scale);
        ctx.fillStyle = 'black';
        ctx.fillRect(x + 2 * scale, y + 2 * scale, 1 * scale, 1 * scale);
      };

      drawFinder(0, 0);
      drawFinder(moduleCount - 7, 0);
      drawFinder(0, moduleCount - 7);
      if (moduleCount > 21) {
        drawAlignment(moduleCount - 9, moduleCount - 9);
      }

      // --- 4. Draw Center Logo ---
      if (logoImage) {
        const logoImg = new Image();
        logoImg.src = logoImage;
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve;
          logoImg.onerror = reject;
        });

        const logoPxSize = (logoSizeModules - 2) * scale;
        const logoX = totalSize / 2 - logoPxSize / 2;
        const logoY = totalSize / 2 - logoPxSize / 2;

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.roundRect(logoX - 25, logoY - 25, logoPxSize + 50, logoPxSize + 50, 40);
        ctx.fill();
        
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.drawImage(logoImg, logoX, logoY, logoPxSize, logoPxSize);
      }

      // --- 5. Draw Brand Name Pill ---
      if (brandName) {
        ctx.font = 'bold 80px Inter, system-ui';
        const textWidth = ctx.measureText(brandName).width;
        const pillWidth = textWidth + 120;
        const pillHeight = 160;
        const pillX = (totalSize - pillWidth) / 2;
        const pillY = padding + size - 120; // Positioned near bottom of QR content area

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 30);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(brandName, totalSize / 2, pillY + pillHeight / 2);
      }

      const resultDataUrl = canvas.toDataURL('image/png');
      const id = Date.now().toString();
      setResultImage(resultDataUrl);

      // Save to Supabase if logged in
      if (session) {
        try {
          const { error: saveError } = await supabase
            .from('qr_codes')
            .insert({
              user_id: session.user.id,
              target_url: text,
              image_data: resultDataUrl,
              brand_name: brandName || null,
              logo_image: logoImage || null
            });
          
          if (saveError) throw saveError;
          fetchLinks(); // Refresh history
        } catch (err) {
          console.error('Failed to save to Supabase:', err);
        }
      }

      // Save to recent (local fallback)
      saveRecentQR({
        id: id,
        image: resultDataUrl,
        url: text,
        createdAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Synthesis Error:', err);
      setError(err.message || 'Failed to generate artistic QR code.');
    } finally {
      setIsProcessing(false);
    }
  }, [sourceImage, text, brandName, logoImage]);

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.download = `ai-qr-codez-${Date.now()}.png`;
    link.href = resultImage;
    link.click();
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-amber-500/20 flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-zinc-900'}`}>
      {/* Header */}
      <nav 
        className={`sticky top-0 z-50 shadow-lg ${luxuryClass} border-t-0 border-x-0 transition-colors duration-500 ${isDarkMode ? 'bg-black/80 backdrop-blur-md' : 'bg-blue-700 text-white'}`}
        style={luxuryStyle}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-colors ${isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-amber-500'}`}>
              <QrCode className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-blue-900'}`} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tighter text-xl leading-tight italic uppercase">Luxury QR CodeZ</span>
              <span className="text-[8px] font-black tracking-[0.4em] text-zinc-500 uppercase leading-none">by Zetsumetsu EOe</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setView('home')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${view === 'home' ? (isDarkMode ? 'text-white' : 'text-amber-400') : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-blue-100 hover:text-white')}`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('generator')}
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${view === 'generator' ? (isDarkMode ? 'text-white' : 'text-amber-400') : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-blue-100 hover:text-white')}`}
            >
              Generator
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${view === 'dashboard' ? (isDarkMode ? 'text-white' : 'text-amber-400') : (isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-blue-100 hover:text-white')}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            {session ? (
              <button 
                onClick={handleSignOut}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-blue-200 hover:text-white'}`}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <button 
                onClick={() => setView('signin')}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-blue-200 hover:text-white'}`}
              >
                <Lock className="w-4 h-4" />
                Sign In
              </button>
            )}
            <button 
              onClick={() => setShowAbout(true)}
              className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-blue-200 hover:text-white'}`}
            >
              <Info className="w-4 h-4" />
              About
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 lg:py-20 flex-grow w-full">
        <AnimatePresence mode="wait">
          {authEmail && authPassword && (
            <div data-auth-debug className="hidden">Auth State Ready</div>
          )}
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HomeView 
                recentQRs={recentQRs} 
                linksData={linksData} 
                setView={setView} 
                onLike={handleLike}
                onDownload={handleDownload}
              />
            </motion.div>
          ) : view === 'signin' || view === 'signup' ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto"
            >
              <div className="p-12 rounded-[3rem] border border-zinc-800 bg-zinc-900/50 shadow-2xl space-y-8 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4">
                  <QrCode className="w-8 h-8 text-black" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter font-serif">
                    {view === 'signin' ? 'Welcome Back' : 'Join the Elite'}
                  </h2>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                    {view === 'signin' ? 'Sign in to access your dashboard' : 'Create an account to start synthesizing'}
                  </p>
                </div>

                {error && (
                  <div className="w-full p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Email Address</label>
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@luxury.com"
                      className="w-full h-14 bg-black border border-zinc-800 rounded-2xl px-6 text-sm focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">Password</label>
                    <input 
                      type="password" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-14 bg-black border border-zinc-800 rounded-2xl px-6 text-sm focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <button 
                  onClick={view === 'signin' ? handleSignIn : handleSignUp}
                  disabled={authLoading}
                  className="w-full h-16 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50"
                >
                  {authLoading ? 'Processing...' : (view === 'signin' ? 'Sign In' : 'Create Account')}
                </button>

                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {view === 'signin' ? "Don't have an account?" : "Already a member?"}{' '}
                  <button 
                    onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
                    className="text-white hover:text-amber-500 transition-colors underline"
                  >
                    {view === 'signin' ? 'Sign Up' : 'Sign In'}
                  </button>
                </p>
              </div>
            </motion.div>
          ) : view === 'generator' ? (
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
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-500' : 'bg-blue-50 border border-blue-100 text-blue-700'} text-[10px] font-black uppercase tracking-[0.3em] mb-6`}
                >
                  <Sparkles className={`w-3 h-3 ${isDarkMode ? 'text-zinc-400' : 'text-amber-500'}`} />
                  Zetsu EDU presents AI QR CodeZ
                </motion.div>
                <h1 className={`text-5xl lg:text-7xl font-bold tracking-tighter mb-6 transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
                  AI <span className={isDarkMode ? 'text-zinc-400' : 'text-amber-500'}>QR</span> CodeZ
                </h1>
                <p className={`max-w-xl mx-auto text-lg leading-relaxed transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  Upload an image to re-imagine it as a vibrant illustration, then generate a scannable dot-matrix QR code integrated into the design.
                </p>
              </header>

              <main className="grid lg:grid-cols-2 gap-12 items-start">
                <section className="space-y-8">
                  <div 
                    className={`p-8 rounded-[2.5rem] space-y-8 shadow-xl transition-colors ${luxuryClass} ${isDarkMode ? 'bg-zinc-900/50' : 'bg-blue-700'}`}
                    style={luxuryStyle}
                  >
                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase tracking-[0.2em] font-black transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>1. Link / Content</label>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="https://google.com"
                        className={`w-full rounded-2xl px-6 py-4 text-sm focus:outline-none transition-all ${isDarkMode ? 'bg-black border border-zinc-800 text-white focus:border-zinc-600' : 'bg-blue-800 border border-blue-600 text-white focus:border-amber-500/50 placeholder:text-blue-400'}`}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase tracking-[0.2em] font-black transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>2. Reference Photo</label>
                      {!sourceImage ? (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className={`w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all group ${isDarkMode ? 'border-zinc-800 bg-black/40 hover:bg-zinc-900/40 hover:border-zinc-700' : 'border-blue-500 bg-blue-800/40 hover:bg-blue-800/60 hover:border-blue-400'}`}
                        >
                          <Upload className={`w-6 h-6 transition-colors ${isDarkMode ? 'text-zinc-700 group-hover:text-zinc-500' : 'text-blue-400 group-hover:text-amber-400'}`} />
                          <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-blue-300 group-hover:text-white'}`}>Upload Image</span>
                        </button>
                      ) : (
                        <div className={`relative aspect-video rounded-3xl overflow-hidden border group transition-colors ${isDarkMode ? 'border-zinc-800' : 'border-blue-500'}`}>
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

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className={`text-[10px] uppercase tracking-[0.2em] font-black transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>3. Brand Name</label>
                        <input
                          type="text"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          placeholder="Zetsu EDU"
                          className={`w-full rounded-2xl px-6 py-4 text-xs font-bold focus:outline-none transition-all ${isDarkMode ? 'bg-black border border-zinc-800 text-white focus:border-zinc-600' : 'bg-blue-800 border border-blue-600 text-white focus:border-amber-500/50 placeholder:text-blue-400'}`}
                        />
                      </div>

                      <div className="space-y-3">
                        <label className={`text-[10px] uppercase tracking-[0.2em] font-black transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>4. Center Logo</label>
                        {!logoImage ? (
                          <button
                            onClick={() => logoInputRef.current?.click()}
                            className={`w-full h-[52px] rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-all group ${isDarkMode ? 'border-zinc-800 bg-black/40 hover:bg-zinc-900/40 hover:border-zinc-700' : 'border-blue-500 bg-blue-800/40 hover:bg-blue-800/60 hover:border-blue-400'}`}
                          >
                            <Upload className={`w-3 h-3 transition-colors ${isDarkMode ? 'text-zinc-700 group-hover:text-zinc-500' : 'text-blue-400 group-hover:text-amber-400'}`} />
                            <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-blue-300 group-hover:text-white'}`}>Logo</span>
                          </button>
                        ) : (
                          <div className={`relative h-[52px] rounded-2xl border flex items-center justify-center group transition-colors ${isDarkMode ? 'border-zinc-800 bg-black' : 'border-blue-500 bg-blue-800/40'}`}>
                            <img src={logoImage} alt="Logo" className="h-6 object-contain" />
                            <button
                              onClick={() => setLogoImage(null)}
                              className="absolute top-1 right-1 p-1 bg-black/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2 h-2 text-white" />
                            </button>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={logoInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => setLogoImage(ev.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={generateArtisticQR}
                    disabled={isProcessing || !sourceImage || !text}
                    className={`w-full py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-10 disabled:cursor-not-allowed uppercase tracking-widest shadow-lg ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200 shadow-white/5' : 'bg-amber-500 text-blue-900 hover:bg-amber-400 shadow-amber-500/20'}`}
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
                  <div 
                    className={`aspect-square w-full rounded-[3.5rem] flex items-center justify-center overflow-hidden relative group shadow-inner transition-colors ${luxuryClass} ${isDarkMode ? 'bg-zinc-900/20' : 'bg-blue-50 border border-blue-100'}`}
                    style={{ '--luxury-bg': isDarkMode ? '#0a0a0a' : '#f8fafc' } as CSSProperties}
                  >
                    <AnimatePresence mode="wait">
                      {resultImage ? (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full h-full p-6"
                        >
                          <img src={resultImage} alt="Result" className={`w-full h-full object-contain rounded-[2.5rem] shadow-2xl transition-all ${isDarkMode ? 'shadow-white/5' : 'shadow-blue-900/10'}`} />
                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ${isDarkMode ? 'bg-black/40' : 'bg-blue-900/20'}`}>
                            <button
                              onClick={downloadResult}
                              className={`px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform ${isDarkMode ? 'bg-white text-black' : 'bg-amber-500 text-blue-900'}`}
                            >
                              <Download className="w-5 h-5" />
                              Download
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="text-center space-y-6">
                          <div className={`w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center border shadow-sm transition-colors ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-blue-100'}`}>
                            <QrCode className={`w-10 h-10 transition-colors ${isDarkMode ? 'text-zinc-800' : 'text-blue-200'}`} />
                          </div>
                          <p className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isDarkMode ? 'text-zinc-700' : 'text-blue-300'}`}>
                            {isProcessing ? 'AI is creating...' : 'Awaiting Synthesis'}
                          </p>
                        </div>
                      )}
                    </AnimatePresence>

                    {isProcessing && (
                      <div className={`absolute inset-0 backdrop-blur-sm flex items-center justify-center transition-colors ${isDarkMode ? 'bg-black/60' : 'bg-white/60'}`}>
                        <div className="flex flex-col items-center gap-6">
                          <div className={`w-16 h-16 border-4 rounded-full animate-spin transition-colors ${isDarkMode ? 'border-zinc-800 border-t-white' : 'border-blue-100 border-t-amber-500'}`} />
                          <p className={`text-[10px] font-black uppercase tracking-[0.4em] animate-pulse transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Processing</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 flex items-center justify-center gap-12">
                    <div className="flex flex-col items-center gap-2">
                      <Check className={`w-4 h-4 ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`} />
                      <span className={`text-[8px] font-bold uppercase tracking-widest text-center transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-700'}`}>AI Stylized<br/>Background</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Check className={`w-4 h-4 ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`} />
                      <span className={`text-[8px] font-bold uppercase tracking-widest text-center transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-700'}`}>Dot Matrix<br/>Encoding</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Check className={`w-4 h-4 ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`} />
                      <span className={`text-[8px] font-bold uppercase tracking-widest text-center transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-700'}`}>High Contrast<br/>Finders</span>
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
              <header className={`flex items-end justify-between border-b pb-8 transition-colors ${isDarkMode ? 'border-zinc-800' : 'border-blue-100'}`}>
                <div>
                  <h1 className={`text-4xl font-bold tracking-tighter mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Analytics Dashboard</h1>
                  <p className={`text-sm transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>Track scans and performance for your AI QR CodeZ.</p>
                </div>
                <div className="flex gap-4">
                  <div className={`rounded-xl px-4 py-2 text-center shadow-md transition-colors ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-blue-700 border border-blue-600'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>Total Scans</p>
                    <p className="text-xl font-bold text-white">{linksData?.links.reduce((acc, curr) => acc + curr.scan_count, 0) || 0}</p>
                  </div>
                  <div className={`rounded-xl px-4 py-2 text-center shadow-md transition-colors ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-blue-700 border border-blue-600'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>Total Likes</p>
                    <p className="text-xl font-bold text-white">{linksData?.links.reduce((acc, curr) => acc + curr.likes, 0) || 0}</p>
                  </div>
                  <div className={`rounded-xl px-4 py-2 text-center shadow-md transition-colors ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-blue-700 border border-blue-600'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>Total Downloads</p>
                    <p className="text-xl font-bold text-white">{linksData?.links.reduce((acc, curr) => acc + curr.downloads, 0) || 0}</p>
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
                        className={`w-full text-left p-6 rounded-3xl border transition-all shadow-sm ${
                          selectedLink?.link.id === link.id 
                            ? (isDarkMode ? 'bg-white text-black border-white' : 'bg-amber-500 text-blue-900 border-amber-500')
                            : (isDarkMode ? 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 text-white' : 'bg-blue-700 text-white border-blue-600 hover:bg-blue-600')
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className={`p-0 rounded-lg overflow-hidden flex items-center justify-center transition-all ${selectedLink?.link.id === link.id ? (isDarkMode ? 'bg-black/10' : 'bg-blue-900/10') : (isDarkMode ? 'bg-zinc-800' : 'bg-blue-800')} ${link.image_data ? 'w-10 h-10' : 'w-8 h-8 p-2'}`}>
                            {link.image_data ? (
                              <img src={link.image_data} alt="QR" className="w-full h-full object-cover" />
                            ) : (
                              <QrCode className="w-4 h-4" />
                            )}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${selectedLink?.link.id === link.id ? (isDarkMode ? 'text-black/60' : 'text-blue-900/60') : (isDarkMode ? 'text-zinc-600' : 'text-blue-200')}`}>
                            {new Date(link.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-bold truncate mb-1">{link.target_url}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MousePointer2 className="w-3 h-3 opacity-60" />
                            <span className="text-xs font-medium">{link.scan_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 opacity-60" />
                            <span className="text-xs font-medium">{link.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3 opacity-60" />
                            <span className="text-xs font-medium">{link.downloads}</span>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteLink(link.id); }}
                        className={`absolute top-4 right-4 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                          selectedLink?.link.id === link.id 
                            ? (isDarkMode ? 'bg-black/5 text-black hover:bg-black/10' : 'bg-blue-900/5 text-blue-900 hover:bg-blue-900/10') 
                            : (isDarkMode ? 'bg-zinc-800 text-zinc-400 hover:text-red-400' : 'bg-blue-800 text-blue-300 hover:text-amber-400')
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Hidden Codes CTA */}
                  {linksData && !linksData.isPro && linksData.hiddenCount > 0 && (
                    <div className={`p-8 border border-dashed rounded-[2.5rem] text-center space-y-6 transition-colors ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-blue-50 border-blue-100'}`}>
                      <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-sm transition-colors ${isDarkMode ? 'bg-zinc-800' : 'bg-white'}`}>
                        <Lock className={`w-6 h-6 ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold mb-1 transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>{linksData.hiddenCount} More Codes Hidden</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">Upgrade to Pro to unlock your full history and analytics.</p>
                        <p className={`text-[9px] mt-2 italic transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>No account needed. Purchase is tied to this app instance.</p>
                      </div>
                      <button
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-amber-500 text-blue-900 hover:bg-amber-400'}`}
                      >
                        {isUpgrading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
                        Unlock All for $5
                      </button>
                    </div>
                  )}

                  {linksData?.links.length === 0 && (
                    <div className={`text-center py-12 border border-dashed rounded-3xl transition-colors ${isDarkMode ? 'border-zinc-800' : 'border-blue-100'}`}>
                      <p className="text-zinc-400 text-sm">No codes generated yet.</p>
                    </div>
                  )}
                </div>

                {/* Details / Chart */}
                <div 
                  className={`border rounded-[2.5rem] p-8 min-h-[500px] relative shadow-xl transition-colors lg:col-span-2 ${luxuryClass} ${isDarkMode ? 'bg-zinc-900/30' : 'bg-blue-700 border-blue-600'}`}
                  style={luxuryStyle}
                >
                  {isLoadingAnalytics ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className={`w-8 h-8 animate-spin transition-colors ${isDarkMode ? 'text-zinc-700' : 'text-blue-400'}`} />
                    </div>
                  ) : selectedLink ? (
                    <div className="space-y-8 h-full flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-2xl font-bold tracking-tighter mb-2 text-white">Scan Performance</h2>
                          <div className={`flex items-center gap-4 text-xs transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-blue-200'}`}>
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
                        <div className="text-right flex gap-6">
                          {selectedLink.link.image_data && (
                            <div className={`w-16 h-16 rounded-xl overflow-hidden border transition-colors ${isDarkMode ? 'border-zinc-800' : 'border-blue-400'}`}>
                              <img 
                                src={selectedLink.link.image_data} 
                                alt="QR Code" 
                                className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => {
                                  const win = window.open();
                                  win?.document.write(`<img src="${selectedLink.link.image_data}" />`);
                                }}
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-4xl font-bold tracking-tighter text-white">{selectedLink.link.scan_count}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>Scans</p>
                          </div>
                          <div>
                            <p className="text-4xl font-bold tracking-tighter text-white">{selectedLink.link.likes}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>Likes</p>
                          </div>
                          <div>
                            <p className="text-4xl font-bold tracking-tighter text-white">{selectedLink.link.downloads}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>Downloads</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-grow min-h-[300px] w-full">
                        {selectedLink.chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedLink.chartData}>
                              <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={isDarkMode ? "#ffffff" : "#fbbf24"} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={isDarkMode ? "#ffffff" : "#fbbf24"} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1f1f1f" : "#1d4ed8"} vertical={false} />
                              <XAxis 
                                dataKey="date" 
                                stroke={isDarkMode ? "#4a4a4a" : "#93c5fd"} 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              />
                              <YAxis 
                                stroke={isDarkMode ? "#4a4a4a" : "#93c5fd"} 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false} 
                              />
                              <Tooltip 
                                contentStyle={{ backgroundColor: isDarkMode ? '#000' : '#1e3a8a', border: `1px solid ${isDarkMode ? '#333' : '#3b82f6'}`, borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke={isDarkMode ? "#ffffff" : "#fbbf24"} 
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className={`h-full flex flex-col items-center justify-center gap-4 transition-colors ${isDarkMode ? 'text-zinc-800' : 'text-blue-500'}`}>
                            <BarChart3 className="w-12 h-12 opacity-20" />
                            <p className="text-sm font-medium uppercase tracking-widest">No scan data yet</p>
                          </div>
                        )}
                      </div>

                      <div className={`pt-8 border-t transition-colors ${isDarkMode ? 'border-zinc-800' : 'border-blue-600'}`}>
                        <h3 className={`text-xs font-black uppercase tracking-widest mb-4 transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-200'}`}>Recent Activity</h3>
                        <div className="space-y-3">
                          {selectedLink.scans.slice(0, 3).map((scan, i) => (
                            <div key={i} className={`flex justify-between items-center text-xs p-3 rounded-xl border transition-colors ${isDarkMode ? 'bg-black/40 border-zinc-800/50 text-zinc-400' : 'bg-blue-800/40 border-blue-700/50 text-blue-100'}`}>
                              <span>{new Date(scan.scanned_at).toLocaleString()}</span>
                              <span className={`truncate max-w-[200px] transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-300'}`}>{scan.user_agent}</span>
                            </div>
                          ))}
                          {selectedLink.scans.length === 0 && <p className={`text-xs italic transition-colors ${isDarkMode ? 'text-zinc-700' : 'text-blue-300'}`}>Waiting for first scan...</p>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`h-full flex flex-col items-center justify-center gap-6 transition-colors ${isDarkMode ? 'text-zinc-800' : 'text-blue-500'}`}>
                      <div className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center transition-colors ${isDarkMode ? 'border-zinc-800' : 'border-blue-600'}`}>
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
      <footer 
        className={`py-12 shadow-inner ${luxuryClass} border-b-0 border-x-0 transition-colors ${isDarkMode ? 'bg-black text-zinc-500' : 'bg-blue-700 text-white'}`}
        style={luxuryStyle}
      >
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className={`text-[10px] md:text-xs font-medium tracking-widest leading-loose uppercase transition-colors ${isDarkMode ? 'text-zinc-600' : 'text-blue-100'}`}>
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
            className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm transition-colors ${isDarkMode ? 'bg-black/80' : 'bg-blue-900/80'}`}
            onClick={() => setShowAbout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`p-8 rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl transition-colors max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-blue-100'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowAbout(false)}
                className={`absolute top-6 right-6 transition-colors ${isDarkMode ? 'text-zinc-500 hover:text-white' : 'text-blue-300 hover:text-blue-900'}`}
              >
                <X className="w-6 h-6" />
              </button>
          <h2 className={`text-3xl font-bold tracking-tighter mb-6 transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>The Zetsu Architecture</h2>
          <div className={`space-y-6 text-sm leading-relaxed transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <div className="space-y-4">
              <h3 className={`font-bold uppercase tracking-widest text-xs transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`}>What it is</h3>
              <p>
                Luxury QR CodeZ is a synthesis engine that transforms utilitarian digital bridges into high-end brand assets. We redefine how users interact with your physical-to-digital touchpoints by merging functional data with bespoke generative art.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className={`font-bold uppercase tracking-widest text-xs transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`}>How it’s made</h3>
              <p>
                Built using a specialized stack for the premium market:
              </p>
              <ul className="space-y-2 list-disc pl-4">
                <li><span className={`font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Aesthetic Engine:</span> Powered by Google's Gemini Vision models for high-fidelity image stylization.</li>
                <li><span className={`font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Secure Infrastructure:</span> Integrated with Supabase for state-of-the-art authentication and encrypted data management.</li>
                <li><span className={`font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Client Core:</span> A high-performance React application utilizing Canvas API for custom dot-matrix synthesis.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className={`font-bold uppercase tracking-widest text-xs transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`}>The Process</h3>
              <ul className="space-y-3">
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] text-white shrink-0">1</span>
                  <p><span className="text-white font-bold">Destiny:</span> You provide the URL. Our system prepares the data stream for luxury encoding.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] text-white shrink-0">2</span>
                  <p><span className="text-white font-bold">Aesthetics:</span> Upload your brand's look. Gemini AI re-imagines it into a clean, neo-pop masterpiece.</p>
                </li>
                <li className="flex gap-4">
                  <span className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] text-white shrink-0">3</span>
                  <p><span className="text-white font-bold">Synthesis:</span> We merge the scannable matrix into the art using discrete high-contrast dots that respect the visual integrity.</p>
                </li>
              </ul>
            </div>

                <div className={`space-y-4 pt-6 border-t transition-colors ${isDarkMode ? 'border-zinc-800' : 'border-blue-100'}`}>
                  <h3 className={`font-bold uppercase tracking-widest text-xs transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`}>Privacy & Data</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`} />
                      <p><span className={`font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Secure Auth:</span> We use Supabase for state-of-the-art authentication and data encryption, ensuring your brand assets are protected.</p>
                    </div>
                    <div className="flex gap-3">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`} />
                      <p><span className={`font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Zero Trash Policy:</span> We never store un-synthesized image data. Your reference photos remain yours alone.</p>
                    </div>
                    <div className="flex gap-3">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-amber-500'}`} />
                      <p><span className={`font-medium transition-colors ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>Anonymous Analytics:</span> Scan tracking is anonymous, recording only the time of scan and the general device type to respect end-user privacy.</p>
                    </div>
                  </div>
                </div>

                <p className={`pt-4 border-t text-[10px] uppercase tracking-widest font-bold transition-colors ${isDarkMode ? 'border-zinc-800 text-zinc-600' : 'border-blue-100 text-blue-300'}`}>
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
