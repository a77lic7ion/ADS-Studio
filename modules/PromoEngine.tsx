
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { AspectRatio, Resolution, BrandIdentity } from '../types';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

interface Props {
  brandIdentity: BrandIdentity | null;
  initialData?: any;
  onDataChange?: (data: any) => void;
}

const PromoEngine: React.FC<Props> = ({ brandIdentity, initialData, onDataChange }) => {
  const commonCTAs = ['Explore Now', 'Shop Now', 'Learn More', 'Sign Up', 'Join Now', 'Get Started', 'Download Now', 'Book Now', 'Custom...'];

  const [config, setConfig] = useState({
    companyUrl: initialData?.companyUrl || '',
    topic: initialData?.topic || (brandIdentity ? `Official ${brandIdentity.name} Promo` : 'Product Launch'),
    platform: initialData?.platform || 'Instagram Post',
    resolution: (initialData?.resolution || '1080p') as Resolution,
    aspectRatio: (initialData?.aspectRatio || '1:1') as AspectRatio,
    style: initialData?.style || 'Neo-Brutalism',
    headline: initialData?.headline || (brandIdentity ? brandIdentity.name.toUpperCase() : 'NEXT GEN INNOVATION'),
    body: initialData?.body || (brandIdentity ? `Experience premium solutions in ${brandIdentity.industry}. Visit us at ${brandIdentity.address}.` : 'Experience the future of digital product design.'),
    cta: initialData?.cta || 'Explore Now'
  });
  
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [bgImage, setBgImage] = useState(initialData?.bgImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop');
  const [refImageBase64, setRefImageBase64] = useState<string | null>(initialData?.refImageBase64 || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setConfig(initialData);
      setBgImage(initialData.bgImage);
      setRefImageBase64(initialData.refImageBase64);
    }
  }, [initialData]);

  useEffect(() => {
    onDataChange?.({ ...config, bgImage, refImageBase64 });
    if (bgImage && !bgImage.startsWith('http')) {
      const assets = JSON.parse(localStorage.getItem('ads_studio_assets') || '[]');
      if (!assets.find((a: any) => a.data === bgImage)) {
        assets.unshift({ id: Date.now(), type: 'Promo', data: bgImage, timestamp: new Date().toLocaleString() });
        localStorage.setItem('ads_studio_assets', JSON.stringify(assets.slice(0, 20)));
      }
    }
  }, [config, bgImage, refImageBase64]);

  const platforms = [
    { name: 'Instagram Post', ratio: '1:1' as AspectRatio },
    { name: 'Instagram Story', ratio: '9:16' as AspectRatio },
    { name: 'YouTube Thumbnail', ratio: '16:9' as AspectRatio },
    { name: 'Business Card', ratio: '3:4' as AspectRatio }
  ];

  const aestheticStyles = [
    'Neo-Brutalism', 'Glassmorphism', 'Minimalist Luxury', 'Retro-Future', 
    'Bauhaus Geometric', 'Y2K Glitch', 'Swiss International', 'Hyper-Realistic',
    'Streetwear Aesthetic', 'Eco-Tech', 'Cyberpunk Noir', 'Acid Graphic', 'Modernist Swiss', '90s Retrowave'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result?.toString().split(',')[1];
        if (base64) setRefImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefineHeadline = async () => {
    if (!config.headline) return;
    setRefining(true);
    try {
      const refined = await gemini.refineText(config.headline, `advertising headline for ${config.topic}`);
      setConfig(prev => ({ ...prev, headline: refined }));
    } finally {
      setRefining(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `Premium advertising background for ${config.topic}. Target Mood: ${config.style}. High-end commercial look.`;
      const refImg = refImageBase64 ? { data: refImageBase64, mimeType: 'image/png' } : undefined;
      const img = await gemini.generateVisualAsset(prompt, config.aspectRatio, config.style, brandIdentity, refImg);
      if (img) setBgImage(img);
    } catch (err) {
      alert("Synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  const exportZipPack = async () => {
    const zip = new JSZip();
    const folder = zip.folder(`${brandIdentity?.name || 'ADS'}_Campaign_Pack`);
    
    // Add current flyer
    if (bgImage.startsWith('data:image')) {
      const base64Data = bgImage.split(',')[1];
      folder?.file("campaign_flyer.png", base64Data, {base64: true});
    }

    // Create business card text mock
    const cardContent = `
BRAND IDENTITY PACK
-------------------
Business: ${brandIdentity?.name}
Industry: ${brandIdentity?.industry}
Colors: ${brandIdentity?.colors}
Address: ${brandIdentity?.address}
Contact: ${brandIdentity?.contact}

CAMPAIGN DETAILS
----------------
Topic: ${config.topic}
Headline: ${config.headline}
CTA: ${config.cta}
`;
    folder?.file("brand_manifesto.txt", cardContent);

    const content = await zip.generateAsync({type: "blob"});
    FileSaver.saveAs(content, `${brandIdentity?.name || 'ADS'}_Brand_Pack.zip`);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0a0c16]">
      <section className="w-full lg:w-[420px] border-r border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark overflow-y-auto p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
            Promo Engine
          </h3>
          {loading && <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
        </div>

        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <h4 className="text-[10px] font-black uppercase text-primary mb-1">Global Branding</h4>
          <p className="text-xs font-bold truncate">{brandIdentity?.name || 'Manual Mode'}</p>
          <div className="flex gap-1 mt-1">
            {brandIdentity?.colors.split(',').map(c => (
              <span key={c} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[8px] font-bold uppercase text-slate-500">{c.trim()}</span>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aesthetic Style</label>
              <select 
                value={config.style}
                onChange={e => setConfig({...config, style: e.target.value})}
                className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-sm font-bold appearance-none cursor-pointer"
              >
                {aestheticStyles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Headline Synthesis</label>
              <div className="relative">
                <input 
                  className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 pr-12 text-sm font-bold uppercase tracking-tighter" 
                  value={config.headline} 
                  onChange={e => setConfig({...config, headline: e.target.value})} 
                />
                <button onClick={handleRefineHeadline} disabled={refining} className="absolute right-2 top-1.5 size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                  <span className={`material-symbols-outlined text-sm ${refining ? 'animate-spin' : ''}`}>auto_awesome</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Campaign Body</label>
              <textarea 
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 p-4 text-sm resize-none leading-relaxed" 
                rows={2} 
                value={config.body} 
                onChange={e => setConfig({...config, body: e.target.value})} 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CTA Action</label>
              <div className="flex gap-2">
                <select 
                  className="w-1/2 rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-3 text-xs font-bold"
                  onChange={(e) => e.target.value !== 'Custom...' && setConfig({...config, cta: e.target.value})}
                  value={commonCTAs.includes(config.cta) ? config.cta : 'Custom...'}
                >
                  {commonCTAs.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input 
                  className="w-1/2 rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-xs font-bold"
                  value={config.cta}
                  onChange={(e) => setConfig({...config, cta: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Category</label>
             <div className="grid grid-cols-2 gap-2">
                {platforms.map(p => (
                  <button 
                    key={p.name}
                    onClick={() => setConfig({...config, platform: p.name, aspectRatio: p.ratio})}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${config.platform === p.name ? 'bg-primary border-primary text-white shadow-lg' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                  >
                    {p.name}
                  </button>
                ))}
             </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">{loading ? 'sync' : 'draw'}</span>
              {loading ? 'Synthesizing...' : 'Synthesize Asset'}
            </button>
            <button 
              onClick={exportZipPack}
              className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">auto_fix_high</span>
              Export Brand Pack (.zip)
            </button>
          </div>
        </div>
      </section>

      <section className="flex-1 bg-slate-100 dark:bg-[#060810] flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:30px_30px] opacity-10"></div>
        
        <div className={`
          bg-white shadow-[0_60px_120px_rgba(0,0,0,0.6)] rounded-[3rem] overflow-hidden relative border-[12px] border-white dark:border-slate-800 transition-all duration-1000 ease-out transform-gpu
          ${config.aspectRatio === '16:9' ? 'w-full max-w-[900px] aspect-video' : 
            config.aspectRatio === '9:16' ? 'h-full max-h-[850px] aspect-[9/16]' : 
            config.aspectRatio === '3:4' ? 'h-full max-h-[700px] aspect-[3/4]' : 'w-full max-w-[650px] aspect-square'}
        `}>
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url('${bgImage}')` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative h-full flex flex-col justify-end p-8 lg:p-14 text-white">
            <h4 className="text-5xl lg:text-7xl font-black leading-[0.9] mb-8 uppercase tracking-tighter italic drop-shadow-2xl">{config.headline}</h4>
            <p className="text-sm lg:text-xl text-white/90 mb-12 max-w-xl font-bold leading-relaxed drop-shadow-md">{config.body}</p>
            <div className="flex items-center gap-8">
              <button className="px-12 py-5 bg-white text-black font-black text-sm uppercase rounded-2xl shadow-2xl hover:bg-primary hover:text-white transition-all transform active:scale-95">{config.cta}</button>
              {brandIdentity?.address && (
                <div className="flex flex-col opacity-60">
                   <span className="text-[10px] font-black uppercase tracking-widest">{brandIdentity.address}</span>
                   <span className="text-[10px] font-black uppercase tracking-widest">{brandIdentity.contact}</span>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center text-white">
               <div className="size-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-sm font-black uppercase tracking-widest animate-pulse">Encoding Visual Layer...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PromoEngine;
