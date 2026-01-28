import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [config, setConfig] = useState({
    headline: 'NEXT GEN INNOVATION',
    body: 'Experience the future of digital product design.',
    cta: 'Explore Now',
    style: 'Minimalist Luxury',
    aspectRatio: '1:1' as AspectRatio
  });
  
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop');
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isInitializing = useRef(false);

  useEffect(() => {
    if (initialData) {
      isInitializing.current = true;
      setConfig({ ...config, ...initialData });
      if (initialData.bgImage) setBgImage(initialData.bgImage);
      if (initialData.refImageBase64) setRefImageBase64(initialData.refImageBase64);
      setTimeout(() => { isInitializing.current = false; }, 100);
    }
  }, [initialData]);

  const syncData = useCallback(() => {
    if (isInitializing.current) return;
    onDataChange?.({ ...config, bgImage, refImageBase64 });
  }, [config, bgImage, refImageBase64, onDataChange]);

  useEffect(() => { syncData(); }, [syncData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRefImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `Marketing visual for ${config.headline}. Mood: ${config.style}. Professional lighting, copy space.`;
      const refImg = refImageBase64 ? { data: refImageBase64.split(',')[1], mimeType: 'image/png' } : undefined;
      const img = await gemini.generateVisualAsset(prompt, config.aspectRatio, config.style, brandIdentity, refImg);
      if (img) setBgImage(img);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0a0c16]">
      <section className="w-full lg:w-[400px] border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0c16] overflow-y-auto p-8 flex flex-col gap-8 shrink-0">
        <h3 className="text-xl font-black flex items-center gap-3 italic uppercase tracking-tighter">
          <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
          Promo Studio
        </h3>

        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
          <h4 className="text-[10px] font-black uppercase text-primary mb-1 tracking-widest">Global Branding</h4>
          <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{brandIdentity?.name || 'Manual Session'}</p>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Headline Synthesis</label>
            <input 
              className="w-full rounded-2xl h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 px-6 text-sm font-black uppercase italic tracking-tighter" 
              value={config.headline} 
              onChange={e => setConfig({...config, headline: e.target.value})} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Campaign Body</label>
            <textarea 
              className="w-full rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 p-6 text-sm resize-none leading-relaxed" 
              rows={3} 
              value={config.body} 
              onChange={e => setConfig({...config, body: e.target.value})} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Style Direction</label>
            <select 
              className="w-full rounded-2xl h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 px-4 text-xs font-black uppercase tracking-widest"
              value={config.style}
              onChange={e => setConfig({...config, style: e.target.value})}
            >
              {['Minimalist Luxury', 'Neo-Brutalism', 'Glassmorphism', 'Retro-Future'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reference Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden relative group"
            >
               {refImageBase64 ? (
                 <img src={refImageBase64} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />
               ) : (
                 <span className="material-symbols-outlined text-slate-300">add_photo_alternate</span>
               )}
               <span className="text-[8px] font-black uppercase text-slate-400 mt-1">Upload Reference</span>
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-2xl shadow-primary/30 disabled:opacity-50 transition-all hover:-translate-y-1">
            {loading ? 'Synthesizing layout...' : 'Synthesize Campaign'}
          </button>
        </div>
      </section>

      <section className="flex-1 bg-slate-100 dark:bg-[#060810] flex items-center justify-center p-12 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
             <div className="size-20 border-4 border-white border-t-transparent rounded-full animate-spin mb-6 shadow-2xl"></div>
             <p className="text-sm font-black uppercase tracking-[0.2em] text-white animate-pulse">Encoding advertising layers...</p>
          </div>
        )}

        <div className="w-full max-w-[700px] aspect-square bg-white shadow-[0_60px_120px_rgba(0,0,0,0.5)] rounded-[3.5rem] overflow-hidden relative border border-white">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${bgImage}')` }}>
             <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/10 to-black/90"></div>
          </div>
          
          <div className="relative h-full flex flex-col p-16 text-white justify-between">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <div className="text-xs font-black uppercase tracking-[0.4em] text-primary">{brandIdentity?.name || 'ADS STUDIO'}</div>
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">{brandIdentity?.industry || 'Commercial Module'}</div>
               </div>
               {brandIdentity?.logo && (
                 <img src={brandIdentity.logo} className="h-20 w-20 object-contain rounded-2xl shadow-2xl border border-white/20 p-2 bg-white/5" />
               )}
            </div>

            <div className="space-y-6">
              <h4 className="text-6xl font-black leading-none uppercase tracking-tighter drop-shadow-2xl italic">{config.headline}</h4>
              <p className="text-lg opacity-80 font-medium max-w-md leading-relaxed">{config.body}</p>
            </div>

            <div className="flex items-center gap-10">
              <button className="px-12 py-6 bg-white text-black font-black text-xs uppercase rounded-full shadow-2xl hover:scale-105 transition-all">
                {config.cta}
              </button>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-relaxed">
                {brandIdentity?.address || '123 Innovation Way, Digital Suite'}<br/>
                {brandIdentity?.contact || 'ads-studio.ai'}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PromoEngine;