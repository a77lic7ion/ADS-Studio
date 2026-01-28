
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
  const commonCTAs = ['Explore Now', 'Shop Now', 'Learn More', 'Sign Up', 'Join Now', 'Get Started', 'Download Now', 'Book Now', 'Message Us on WhatsApp', 'Custom...'];

  const [config, setConfig] = useState({
    companyUrl: initialData?.companyUrl || '',
    topic: initialData?.topic || (brandIdentity ? `Official ${brandIdentity.name} Promo` : 'Product Launch'),
    platform: initialData?.platform || 'Instagram Post',
    resolution: (initialData?.resolution || '1080p') as Resolution,
    aspectRatio: (initialData?.aspectRatio || '1:1') as AspectRatio,
    style: initialData?.style || 'Neo-Brutalism',
    headline: initialData?.headline || (brandIdentity ? brandIdentity.name.toUpperCase() : 'NEXT GEN INNOVATION'),
    body: initialData?.body || (brandIdentity ? `Experience premium solutions in ${brandIdentity.industry}. Visit us at ${brandIdentity.address}.` : 'Experience the future of digital product design.'),
    cta: initialData?.cta || 'Explore Now',
    features: initialData?.features || ['Premium Support', 'Global Delivery', 'Verified Quality']
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
  }, [config, bgImage, refImageBase64]);

  const platforms = [
    { name: 'Instagram Post', ratio: '1:1' as AspectRatio },
    { name: 'Instagram Story', ratio: '9:16' as AspectRatio },
    { name: 'YouTube Thumbnail', ratio: '16:9' as AspectRatio },
    { name: 'Business Card', ratio: '3:4' as AspectRatio }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `Premium advertising visual for ${config.topic}. Visual elements: ${config.style}. Clean composition for marketing flyer.`;
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
    if (bgImage.startsWith('data:image')) {
      const base64Data = bgImage.split(',')[1];
      folder?.file("campaign_flyer.png", base64Data, {base64: true});
    }
    const cardContent = `Business: ${brandIdentity?.name}\nHeadline: ${config.headline}\nCTA: ${config.cta}`;
    folder?.file("brand_manifesto.txt", cardContent);
    const content = await zip.generateAsync({type: "blob"});
    FileSaver.saveAs(content, `${brandIdentity?.name || 'ADS'}_Brand_Pack.zip`);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0a0c16]">
      <section className="w-full lg:w-[420px] border-r border-slate-200 dark:border-border-dark bg-white dark:bg-background-dark overflow-y-auto p-6 flex flex-col gap-6">
        <h3 className="text-xl font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">campaign</span>
          Ad Suite
        </h3>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Headline</label>
              <input 
                className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-sm font-bold uppercase tracking-tighter" 
                value={config.headline} 
                onChange={e => setConfig({...config, headline: e.target.value})} 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Body Message</label>
              <textarea 
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 p-4 text-sm resize-none leading-relaxed" 
                rows={3} 
                value={config.body} 
                onChange={e => setConfig({...config, body: e.target.value})} 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Call to Action</label>
              <select 
                className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-3 text-sm font-bold mb-2"
                onChange={(e) => {
                  if (e.target.value !== 'Custom...') {
                    setConfig({...config, cta: e.target.value});
                  }
                }}
                value={commonCTAs.includes(config.cta) ? config.cta : 'Custom...'}
              >
                {commonCTAs.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input 
                className="w-full rounded-xl h-11 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 px-4 text-sm font-bold"
                value={config.cta}
                onChange={(e) => setConfig({...config, cta: e.target.value})}
                placeholder="Custom CTA text..."
              />
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Layout Format</label>
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
            <button onClick={handleGenerate} disabled={loading} className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl disabled:opacity-50">
              {loading ? 'Synthesizing...' : 'Synthesize Campaign'}
            </button>
            <button onClick={exportZipPack} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-2xl">
              Export Design Pack
            </button>
          </div>
        </div>
      </section>

      <section className="flex-1 bg-slate-100 dark:bg-[#060810] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className={`
          bg-white shadow-[0_60px_120px_rgba(0,0,0,0.4)] rounded-[2.5rem] overflow-hidden relative border-[1px] border-white/20 transition-all duration-700 transform-gpu
          ${config.aspectRatio === '16:9' ? 'w-full max-w-[900px] aspect-video' : 
            config.aspectRatio === '9:16' ? 'h-full max-h-[850px] aspect-[9/16]' : 
            config.aspectRatio === '3:4' ? 'h-full max-h-[750px] aspect-[3/4]' : 'w-full max-w-[650px] aspect-square'}
        `}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${bgImage}')` }}>
             <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80"></div>
          </div>
          
          <div className="relative h-full flex flex-col p-10 lg:p-14 text-white">
            <div className="flex justify-between items-start mb-auto">
               <div className="text-sm font-black uppercase tracking-[0.3em] opacity-80">{brandIdentity?.name || 'ADS STUDIO'}</div>
               <div className="material-symbols-outlined opacity-40">blur_on</div>
            </div>

            <div className="space-y-6 mb-8">
              <h4 className="text-4xl lg:text-6xl font-black leading-none uppercase tracking-tighter drop-shadow-2xl">{config.headline}</h4>
              <p className="text-sm lg:text-lg opacity-90 font-medium max-w-lg leading-relaxed">{config.body}</p>
              <div className="flex flex-col gap-2">
                {config.features.map((f: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] lg:text-xs font-bold uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm text-primary filled">check_circle</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-6">
              <button className="w-full lg:w-auto px-10 py-5 bg-white text-black font-black text-xs uppercase rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2">
                {config.cta.toLowerCase().includes('whatsapp') && <span className="material-symbols-outlined text-sm">chat</span>}
                {config.cta}
              </button>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-50 text-center lg:text-left">
                Start your project today!<br/>
                {brandIdentity?.contact}
              </div>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white">
               <div className="size-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Encoding Brand Assets</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PromoEngine;
