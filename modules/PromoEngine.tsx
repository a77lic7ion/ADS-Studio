
import React, { useState } from 'react';
import { gemini } from '../services/geminiService';
import { AspectRatio } from '../types';

const PromoEngine: React.FC = () => {
  const [config, setConfig] = useState({
    type: 'Flash Sale',
    size: '16:9' as AspectRatio,
    headline: 'SUMMER MEGA SALE 50% OFF',
    body: 'Get ready for the hottest deals of the season. Limited time offer valid on all new collections.',
    cta: 'Shop Now'
  });
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState('https://picsum.photos/1200/1600?random=10');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const img = await gemini.generateVisualAsset(config.headline, config.size);
      if (img) setBgImage(img);
    } catch (err) {
      alert("Failed to generate flyer theme.");
    } finally {
      setLoading(false);
    }
  };

  const refineCopy = async (field: 'headline' | 'body') => {
    const refined = await gemini.refineText(config[field], config.type);
    setConfig({ ...config, [field]: refined });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <section className="w-full lg:w-[420px] border-r border-border-dark bg-background-dark overflow-y-auto p-6 flex flex-col gap-6">
        <h3 className="text-white text-xl font-bold">Campaign Editor</h3>
        
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
             <label className="text-xs font-bold text-slate-500 uppercase">Format & Dimensions</label>
             <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setConfig({...config, size: '16:9'})}
                  title="Best for Web Banners and Facebook Covers"
                  className={`px-4 py-2 rounded-lg text-xs font-bold border ${config.size === '16:9' ? 'bg-primary border-primary text-white' : 'border-slate-700 text-slate-400'}`}
                >
                  Landscape (16:9)
                </button>
                <button 
                  onClick={() => setConfig({...config, size: '9:16'})}
                  title="Best for Instagram Stories and Phone Wallpapers"
                  className={`px-4 py-2 rounded-lg text-xs font-bold border ${config.size === '9:16' ? 'bg-primary border-primary text-white' : 'border-slate-700 text-slate-400'}`}
                >
                  Vertical (9:16)
                </button>
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white">Headline</label>
              <button onClick={() => refineCopy('headline')} title="Refine headline with AI" className="text-primary text-[10px] font-bold uppercase hover:underline">Auto-Refine</button>
            </div>
            <input className="w-full rounded-lg text-white border-border-dark bg-surface-dark px-4 h-12 text-sm" value={config.headline} onChange={e => setConfig({...config, headline: e.target.value})} />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white">Body Copy</label>
              <button onClick={() => refineCopy('body')} title="Make the copy more engaging with AI" className="text-primary text-[10px] font-bold uppercase hover:underline">Auto-Refine</button>
            </div>
            <textarea className="w-full rounded-lg text-white border-border-dark bg-surface-dark p-4 text-sm resize-none" rows={3} value={config.body} onChange={e => setConfig({...config, body: e.target.value})} />
          </div>

          <button onClick={handleGenerate} className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">{loading ? 'sync' : 'auto_fix_high'}</span>
            {loading ? 'Creating Visuals...' : 'Generate New Theme'}
          </button>
        </div>
      </section>

      <section className="flex-1 bg-surface-dark/20 flex flex-col items-center justify-center p-4 lg:p-12 overflow-y-auto">
        <div className={`
          bg-white shadow-2xl rounded overflow-hidden relative border-8 border-white/5 transition-all duration-500
          ${config.size === '16:9' ? 'w-full max-w-[800px] aspect-video' : 'h-full max-h-[800px] aspect-[9/16]'}
        `}>
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url('${bgImage}')` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
          </div>
          
          <div className="relative h-full flex flex-col justify-end p-6 lg:p-10 text-white">
            <div className="mb-2 inline-block px-3 py-1 bg-primary text-[10px] font-bold uppercase tracking-widest rounded-full self-start">PROMOTION</div>
            <h4 className={`${config.size === '16:9' ? 'text-4xl lg:text-5xl' : 'text-3xl lg:text-4xl'} font-black leading-tight mb-4 uppercase`}>{config.headline}</h4>
            <p className="text-sm opacity-90 mb-8 max-w-md">{config.body}</p>
            <div className="flex items-center gap-4">
              <button className="px-8 py-3 bg-white text-black font-bold text-sm rounded shadow-lg transition-transform active:scale-95">{config.cta}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PromoEngine;
