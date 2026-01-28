
import React, { useState } from 'react';
import { gemini } from '../services/geminiService';
import { AspectRatio, Resolution } from '../types';

const PromoEngine: React.FC = () => {
  const [config, setConfig] = useState({
    companyUrl: '',
    topic: 'Product Launch',
    platform: 'Instagram Story',
    resolution: '1080p' as Resolution,
    aspectRatio: '9:16' as AspectRatio,
    headline: 'NEXT GEN INNOVATION',
    body: 'Discover the future of high-performance tools.',
    cta: 'Learn More'
  });
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState('https://picsum.photos/1200/1600?random=22');

  const platforms = [
    { name: 'Instagram Story', ratio: '9:16' as AspectRatio },
    { name: 'Facebook Cover', ratio: '16:9' as AspectRatio },
    { name: 'LinkedIn Post', ratio: '4:3' as AspectRatio },
    { name: 'Banner Ad', ratio: '3:4' as AspectRatio }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `Ad for ${config.topic}. Context: ${config.companyUrl}. Tone: Professional. Layout for ${config.platform}.`;
      const img = await gemini.generateVisualAsset(prompt, config.aspectRatio);
      if (img) setBgImage(img);
    } catch (err) {
      alert("Failed to generate campaign visual.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = bgImage;
    link.download = `promo-${config.platform.toLowerCase().replace(' ', '-')}-${Date.now()}.png`;
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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brand Context</label>
              <input 
                placeholder="Company URL (e.g., apple.com)"
                className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-sm"
                value={config.companyUrl}
                onChange={e => setConfig({...config, companyUrl: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ad Topic</label>
              <input 
                placeholder="e.g., Summer Sale, New App Features"
                className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-sm"
                value={config.topic}
                onChange={e => setConfig({...config, topic: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform & Quality</label>
             <div className="grid grid-cols-2 gap-2">
                {platforms.map(p => (
                  <button 
                    key={p.name}
                    onClick={() => updatePlatform(p)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${config.platform === p.name ? 'bg-primary border-primary text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                  >
                    {p.name}
                  </button>
                ))}
             </div>
             <div className="flex gap-2">
               {['720p', '1080p', '4K'].map(res => (
                 <button 
                  key={res}
                  onClick={() => setConfig({...config, resolution: res as Resolution})}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded border ${config.resolution === res ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                 >
                   {res}
                 </button>
               ))}
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <input 
              className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-sm font-bold" 
              value={config.headline} 
              onChange={e => setConfig({...config, headline: e.target.value})} 
              placeholder="Headline"
            />
            <textarea 
              className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 p-4 text-sm resize-none" 
              rows={3} 
              value={config.body} 
              onChange={e => setConfig({...config, body: e.target.value})} 
              placeholder="Body Copy"
            />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="flex-1 py-5 bg-primary text-white font-black uppercase tracking-tighter text-lg rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">{loading ? 'sync' : 'auto_awesome'}</span>
              {loading ? 'Thinking...' : 'Generate'}
            </button>
            <button 
              onClick={handleDownload}
              className="aspect-square bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 rounded-2xl hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>
      </section>

      <section className="flex-1 bg-slate-100 dark:bg-[#060810] flex flex-col items-center justify-center p-6 lg:p-12 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        
        <div className={`
          bg-white shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden relative border-4 border-white dark:border-slate-800 transition-all duration-700
          ${config.aspectRatio === '16:9' ? 'w-full max-w-[900px] aspect-video' : 
            config.aspectRatio === '9:16' ? 'h-full max-h-[850px] aspect-[9/16]' : 
            config.aspectRatio === '4:3' ? 'w-full max-w-[800px] aspect-[4/3]' : 'w-full max-w-[600px] aspect-[3/4]'}
        `}>
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url('${bgImage}')` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          </div>
          
          <div className="relative h-full flex flex-col justify-end p-8 lg:p-12 text-white">
            <div className="mb-4 flex items-center gap-3">
              <div className="px-3 py-1 bg-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-md">LIVE CAMPAIGN</div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{config.platform} • {config.resolution}</div>
            </div>
            <h4 className="text-4xl lg:text-6xl font-black leading-none mb-6 uppercase tracking-tighter italic">{config.headline}</h4>
            <p className="text-sm lg:text-lg opacity-80 mb-10 max-w-xl font-medium leading-relaxed">{config.body}</p>
            <div className="flex items-center gap-6">
              <button className="px-10 py-4 bg-white text-black font-black text-sm uppercase rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all">{config.cta}</button>
              <div className="h-10 w-px bg-white/20"></div>
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Powered by<br/><span className="text-white">Gemini Promo Engine</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PromoEngine;
