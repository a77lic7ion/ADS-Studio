
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { AspectRatio, Resolution } from '../types';

interface Props {
  initialData?: any;
  onDataChange?: (data: any) => void;
}

const PromoEngine: React.FC<Props> = ({ initialData, onDataChange }) => {
  const [config, setConfig] = useState({
    companyUrl: initialData?.companyUrl || '',
    topic: initialData?.topic || 'Product Launch',
    platform: initialData?.platform || 'Instagram Post',
    resolution: (initialData?.resolution || '1080p') as Resolution,
    aspectRatio: (initialData?.aspectRatio || '1:1') as AspectRatio,
    style: initialData?.style || 'Neo-Brutalism',
    headline: initialData?.headline || 'NEXT GEN INNOVATION',
    body: initialData?.body || 'Experience the future of digital product design.',
    cta: initialData?.cta || 'Explore Now'
  });
  
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [bgImage, setBgImage] = useState(initialData?.bgImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop');
  const [refImageBase64, setRefImageBase64] = useState<string | null>(initialData?.refImageBase64 || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setConfig({
        companyUrl: initialData.companyUrl || '',
        topic: initialData.topic || 'Product Launch',
        platform: initialData.platform || 'Instagram Post',
        resolution: (initialData.resolution || '1080p') as Resolution,
        aspectRatio: (initialData.aspectRatio || '1:1') as AspectRatio,
        style: initialData.style || 'Neo-Brutalism',
        headline: initialData.headline || 'NEXT GEN INNOVATION',
        body: initialData.body || 'Experience the future of digital product design.',
        cta: initialData.cta || 'Explore Now'
      });
      setBgImage(initialData.bgImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop');
      setRefImageBase64(initialData.refImageBase64 || null);
    }
  }, [initialData]);

  useEffect(() => {
    onDataChange?.({ ...config, bgImage, refImageBase64 });
    // Save to global asset registry for Settings module
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
    { name: 'Facebook Banner', ratio: '4:3' as AspectRatio }
  ];

  const aestheticStyles = [
    'Neo-Brutalism', 'Glassmorphism', 'Minimalist Luxury', 'Retro-Future', 
    'Bauhaus Geometric', 'Y2K Glitch', 'Swiss International', 'Hyper-Realistic',
    'Streetwear Aesthetic', 'Eco-Tech', 'Cyberpunk Noir'
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
      const prompt = `Premium advertising background for ${config.topic}. Headline: ${config.headline}. Mood: ${config.style}. No text in image, just high-end photography/art.`;
      const refImg = refImageBase64 ? { data: refImageBase64, mimeType: 'image/png' } : undefined;
      
      const img = await gemini.generateVisualAsset(prompt, config.aspectRatio, config.style, refImg);
      if (img) setBgImage(img);
    } catch (err) {
      console.error(err);
      alert("Synthesis failed. Check your configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = bgImage;
    link.download = `campaign-${config.topic.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.png`;
    link.click();
  };

  const updatePlatform = (p: any) => {
    setConfig({ ...config, platform: p.name, aspectRatio: p.ratio });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0a0c16]">
      <section className="w-full lg:w-[420px] border-r border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark overflow-y-auto p-6 flex flex-col gap-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
          Ad Studio
        </h3>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Reference</label>
              <div className="flex gap-2">
                <input 
                  placeholder="Reference Brand URL"
                  className="flex-1 rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-sm"
                  value={config.companyUrl}
                  onChange={e => setConfig({...config, companyUrl: e.target.value})}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square h-11 rounded-xl flex items-center justify-center border-2 border-dashed ${refImageBase64 ? 'bg-primary/10 border-primary text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}
                >
                  <span className="material-symbols-outlined">{refImageBase64 ? 'check_circle' : 'upload'}</span>
                </button>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aesthetic Style</label>
              <select 
                value={config.style}
                onChange={e => setConfig({...config, style: e.target.value})}
                className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-sm font-bold appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-[#222949]"
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
                  placeholder="Headline"
                />
                <button 
                  onClick={handleRefineHeadline}
                  disabled={refining}
                  className="absolute right-2 top-1.5 size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                  title="Refine with AI"
                >
                  <span className={`material-symbols-outlined text-sm ${refining ? 'animate-spin' : ''}`}>auto_awesome</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Campaign Body</label>
              <textarea 
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 p-4 text-sm resize-none leading-relaxed" 
                rows={3} 
                value={config.body} 
                onChange={e => setConfig({...config, body: e.target.value})} 
                placeholder="Core message..."
              />
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform & Ratio</label>
             <div className="grid grid-cols-2 gap-2">
                {platforms.map(p => (
                  <button 
                    key={p.name}
                    onClick={() => updatePlatform(p)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${config.platform === p.name ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'}`}
                  >
                    {p.name}
                  </button>
                ))}
             </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="flex-1 py-5 bg-primary text-white font-black uppercase tracking-tighter text-lg rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">{loading ? 'sync' : 'draw'}</span>
              {loading ? 'Generating...' : 'Synthesize Ad'}
            </button>
            <button 
              onClick={handleDownload}
              className="aspect-square bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 rounded-2xl hover:scale-105 transition-transform flex items-center justify-center"
              title="Download Background"
            >
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>
      </section>

      <section className="flex-1 bg-slate-100 dark:bg-[#060810] flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:30px_30px] opacity-10"></div>
        
        <div className={`
          bg-white shadow-[0_60px_120px_rgba(0,0,0,0.6)] rounded-3xl overflow-hidden relative border-[12px] border-white dark:border-slate-800 transition-all duration-1000 ease-out transform-gpu
          ${config.aspectRatio === '16:9' ? 'w-full max-w-[900px] aspect-video' : 
            config.aspectRatio === '9:16' ? 'h-full max-h-[850px] aspect-[9/16]' : 
            config.aspectRatio === '4:3' ? 'w-full max-w-[800px] aspect-[4/3]' : 'w-full max-w-[650px] aspect-square'}
        `}>
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url('${bgImage}')` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative h-full flex flex-col justify-end p-8 lg:p-14 text-white">
            <div className="mb-6 flex items-center gap-4">
              <div className="px-4 py-1.5 bg-primary text-[9px] font-black uppercase tracking-[0.3em] rounded-full border border-white/20 backdrop-blur-sm">ADS STUDIO PREVIEW</div>
              <div className="text-[9px] font-black uppercase tracking-widest text-white/50">{config.style} • {config.resolution}</div>
            </div>
            <h4 className="text-5xl lg:text-7xl font-black leading-[0.9] mb-8 uppercase tracking-tighter italic drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">{config.headline}</h4>
            <p className="text-sm lg:text-xl text-white/90 mb-12 max-w-xl font-bold leading-relaxed drop-shadow-md">{config.body}</p>
            <div className="flex items-center gap-8">
              <button className="px-12 py-5 bg-white text-black font-black text-sm uppercase rounded-2xl shadow-2xl hover:bg-primary hover:text-white transition-all transform active:scale-95">{config.cta}</button>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Platform Specific</span>
                <span className="text-xs font-black uppercase italic tracking-tighter">{config.platform}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PromoEngine;
