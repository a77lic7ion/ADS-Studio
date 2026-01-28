
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
  const commonCTAs = [
    'Explore Now', 
    'Shop Now', 
    'Learn More', 
    'Sign Up', 
    'Join Now', 
    'Get Started', 
    'Download Now', 
    'Book Now', 
    'Message Us on WhatsApp', 
    'Custom...'
  ];

  const defaultFeatures = ['Premium Support', 'Global Delivery', 'Verified Quality'];

  const [config, setConfig] = useState({
    companyUrl: '',
    topic: brandIdentity ? `Official ${brandIdentity.name} Promo` : 'Product Launch',
    platform: 'Instagram Post',
    resolution: '1080p' as Resolution,
    aspectRatio: '1:1' as AspectRatio,
    style: 'Neo-Brutalism',
    headline: brandIdentity ? brandIdentity.name.toUpperCase() : 'NEXT GEN INNOVATION',
    body: brandIdentity ? `Experience premium solutions in ${brandIdentity.industry}. Visit us at ${brandIdentity.address}.` : 'Experience the future of digital product design.',
    cta: 'Explore Now',
    features: defaultFeatures
  });
  
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop');
  const [refImageBase64, setRefImageBase64] = useState<string | null>(null);
  
  const isInitializing = useRef(false);

  useEffect(() => {
    if (initialData) {
      isInitializing.current = true;
      setConfig({
        ...config,
        ...initialData,
        features: initialData.features || defaultFeatures
      });
      if (initialData.bgImage) setBgImage(initialData.bgImage);
      if (initialData.refImageBase64) setRefImageBase64(initialData.refImageBase64);
      setTimeout(() => { isInitializing.current = false; }, 100);
    }
  }, [initialData]);

  const syncData = useCallback(() => {
    if (isInitializing.current) return;
    onDataChange?.({ ...config, bgImage, refImageBase64 });
  }, [config, bgImage, refImageBase64, onDataChange]);

  useEffect(() => {
    syncData();
  }, [syncData]);

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
      const prompt = `Premium advertising background for ${config.topic}. Visual style: ${config.style}. Clean composition for high-end marketing.`;
      const refImg = refImageBase64 ? { data: refImageBase64, mimeType: 'image/png' } : undefined;
      const img = await gemini.generateVisualAsset(prompt, config.aspectRatio, config.style, brandIdentity, refImg);
      if (img) setBgImage(img);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportZipPack = async () => {
    const zip = new JSZip();
    const folder = zip.folder(`${brandIdentity?.name || 'ADS'}_Campaign_Pack`);
    if (bgImage.startsWith('data:image')) {
      const base64Data = bgImage.split(',')[1];
      folder?.file("campaign_flyer.png", base64Data, {base64: true});
    }
    const manifest = `Business: ${brandIdentity?.name}\nHeadline: ${config.headline}\nCTA: ${config.cta}`;
    folder?.file("brand_manifesto.txt", manifest);
    const content = await zip.generateAsync({type: "blob"});
    FileSaver.saveAs(content, `${brandIdentity?.name || 'ADS'}_Brand_Pack.zip`);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...config.features];
    newFeatures[index] = value;
    setConfig({ ...config, features: newFeatures });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0a0c16]">
      <section className="w-full lg:w-[420px] border-r border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark overflow-y-auto p-6 flex flex-col gap-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
          Promo Studio
        </h3>

        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <h4 className="text-[10px] font-black uppercase text-primary mb-1">Global Branding</h4>
          <p className="text-xs font-bold truncate">{brandIdentity?.name || 'Manual Session'}</p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-4">
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
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Features</label>
              <div className="space-y-2">
                {config.features.map((feature, i) => (
                  <input 
                    key={i}
                    className="w-full rounded-xl h-10 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-xs font-bold" 
                    value={feature}
                    onChange={e => updateFeature(i, e.target.value)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CTA Action</label>
              <select 
                className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-3 text-sm font-bold mb-2"
                onChange={(e) => { if (e.target.value !== 'Custom...') setConfig({...config, cta: e.target.value}); }}
                value={commonCTAs.includes(config.cta) ? config.cta : 'Custom...'}
              >
                {commonCTAs.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input 
                className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-sm font-bold"
                value={config.cta}
                onChange={(e) => setConfig({...config, cta: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button onClick={handleGenerate} disabled={loading} className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl disabled:opacity-50 transition-all hover:-translate-y-1">
              {loading ? 'Synthesizing...' : 'Synthesize Flyer'}
            </button>
            <button onClick={exportZipPack} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">auto_fix_high</span>
              Export Brand Pack
            </button>
          </div>
        </div>
      </section>

      <section className="flex-1 bg-slate-100 dark:bg-[#060810] flex flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:30px_30px] opacity-10"></div>
        
        <div className={`
          bg-white shadow-[0_60px_120px_rgba(0,0,0,0.4)] rounded-[2.5rem] overflow-hidden relative border-[1px] border-white/20 transition-all duration-700 transform-gpu
          ${config.aspectRatio === '16:9' ? 'w-full max-w-[900px] aspect-video' : 
            config.aspectRatio === '9:16' ? 'h-full max-h-[850px] aspect-[9/16]' : 
            config.aspectRatio === '3:4' ? 'h-full max-h-[750px] aspect-[3/4]' : 'w-full max-w-[650px] aspect-square'}
        `}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${bgImage}')` }}>
             <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black/90"></div>
          </div>
          
          <div className="relative h-full flex flex-col p-10 lg:p-16 text-white">
            <div className="flex justify-between items-start mb-auto">
               <div className="text-sm font-black uppercase tracking-[0.4em] opacity-80">{brandIdentity?.name || 'ADS STUDIO'}</div>
               <div className="material-symbols-outlined opacity-30 text-4xl">blur_on</div>
            </div>

            <div className="space-y-6 mb-12">
              <h4 className="text-4xl lg:text-7xl font-black leading-none uppercase tracking-tighter drop-shadow-2xl italic">{config.headline}</h4>
              <p className="text-sm lg:text-xl opacity-90 font-medium max-w-lg leading-relaxed">{config.body}</p>
              <div className="flex flex-col gap-3">
                {config.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-[10px] lg:text-sm font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm text-primary filled">check_circle</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-10">
              <button className="w-full lg:w-auto px-12 py-6 bg-white text-black font-black text-xs uppercase rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-3">
                {config.cta.toLowerCase().includes('whatsapp') && <span className="material-symbols-outlined text-lg">chat</span>}
                {config.cta}
              </button>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-center lg:text-left">
                Start your project today!<br/>
                {brandIdentity?.contact}
              </div>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl z-30 flex flex-col items-center justify-center text-white">
               <div className="size-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
               <p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">Encoding Brand Assets</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PromoEngine;
