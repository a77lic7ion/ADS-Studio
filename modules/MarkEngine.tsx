
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gemini } from '../services/geminiService';
import { LogoStyle, BrandIdentity } from '../types';

interface Props {
  brandIdentity: BrandIdentity | null;
  initialData?: any;
  onDataChange?: (data: any) => void;
  onLogoGenerated?: (logo: string) => void;
}

const MarkEngine: React.FC<Props> = ({ brandIdentity, initialData, onDataChange, onLogoGenerated }) => {
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [activeStyle, setActiveStyle] = useState('minimalist');
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isInitializing = useRef(false);

  useEffect(() => {
    if (initialData) {
      isInitializing.current = true;
      setDescription(initialData.description || (brandIdentity ? `High-end logo for ${brandIdentity.name}, specializing in ${brandIdentity.industry}.` : ''));
      setIndustry(initialData.industry || brandIdentity?.industry || '');
      setActiveStyle(initialData.activeStyle || 'minimalist');
      setVariations(initialData.variations || (brandIdentity?.logo ? [brandIdentity.logo] : []));
      setSelectedIndex(initialData.selectedIndex || 0);
      setTimeout(() => { isInitializing.current = false; }, 100);
    } else if (brandIdentity?.logo) {
      setVariations([brandIdentity.logo]);
    }
  }, [initialData, brandIdentity]);

  const syncData = useCallback(() => {
    if (isInitializing.current) return;
    onDataChange?.({ description, industry, activeStyle, variations, selectedIndex });
  }, [description, industry, activeStyle, variations, selectedIndex, onDataChange]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  const styles: LogoStyle[] = [
    { id: 'minimalist', name: 'Minimalist', icon: 'grid_view', description: 'Clean lines and lots of white space' },
    { id: 'vintage', name: 'Vintage', icon: 'history_edu', description: 'Classic, textured, and heritage-focused' },
    { id: '3d', name: '3D Isometric', icon: 'view_in_ar', description: 'Depth and modern tech perspective' },
    { id: 'corporate', name: 'Corporate', icon: 'corporate_fare', description: 'Professional, stable, and trust-evoking' },
  ];

  const handleGenerate = async () => {
    if (!description || !industry) return;
    setLoading(true);
    try {
      const results = await gemini.generateLogoSystem(description, industry, activeStyle, brandIdentity);
      if (results.length > 0) {
        setVariations(results);
        setSelectedIndex(0);
        onLogoGenerated?.(results[0]);
      }
    } catch (err) {
      alert("Failed to generate logo system. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVariation = (index: number) => {
    setSelectedIndex(index);
    onLogoGenerated?.(variations[index]);
  };

  const handleDownload = () => {
    if (variations[selectedIndex]) {
      const link = document.createElement('a');
      link.href = variations[selectedIndex];
      link.download = `brand-mark-${Date.now()}.png`;
      link.click();
    }
  };

  const resultImage = variations[selectedIndex] || null;

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#060810]">
      <div className="w-full lg:w-[420px] flex flex-col border-r border-slate-200 dark:border-[#1a1e35] bg-white dark:bg-background-dark overflow-y-auto">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-black mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">token</span>
            Identity Studio
          </h2>
          
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <h4 className="text-[10px] font-black uppercase text-primary mb-1 tracking-widest">Brand Context</h4>
            <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">{brandIdentity?.name || 'Manual Session'}</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Design Direction</label>
            <textarea
              title="Describe what your brand stands for"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#181d34] min-h-[120px] p-4 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="E.g. High-end coffee shop specializing in artisanal beans and baked goods..."
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Style Archetype</label>
            <div className="grid grid-cols-2 gap-3">
              {styles.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStyle(s.id)}
                  title={s.description}
                  className={`p-4 rounded-xl cursor-pointer flex flex-col items-center gap-2 transition-all border-2 ${
                    activeStyle === s.id ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-lg' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className={`material-symbols-outlined text-2xl ${activeStyle === s.id ? 'text-primary' : 'text-slate-400'}`}>{s.icon}</span>
                  <span className={`text-[10px] font-black uppercase ${activeStyle === s.id ? 'text-primary' : 'text-slate-500'}`}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !description}
            className="w-full mt-4 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-2xl">{loading ? 'sync' : 'auto_awesome'}</span>
            {loading ? 'Synthesizing...' : 'Synthesize Identity'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-[#060810] p-6 lg:p-12 overflow-y-auto flex flex-col items-center relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
            <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 shadow-2xl"></div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-primary animate-pulse text-center">
              Orchestrating Brand Geometries...
            </p>
          </div>
        )}

        <div className="w-full max-w-5xl space-y-12 pb-20">
          {/* Main Stage */}
          <div className="relative group w-full aspect-square max-w-[650px] mx-auto">
            <div className="h-full w-full rounded-[3rem] bg-slate-50 dark:bg-[#101322] border border-slate-200 dark:border-white/5 shadow-inner flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1d243e_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
              
              <div className="z-10 flex flex-col items-center text-center p-8 w-full h-full justify-center">
                {resultImage ? (
                  <div className="relative w-full h-full flex items-center justify-center group/main">
                    <img 
                      src={resultImage} 
                      alt="Generated logo" 
                      className="size-[70%] object-contain rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-700" 
                    />
                    <div className="absolute bottom-8 left-0 right-0 text-center animate-in slide-in-from-bottom-4 duration-1000">
                       <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white drop-shadow-lg">
                          {brandIdentity?.name || 'ADS STUDIO'}
                       </h2>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">
                          Identity Module Synthesis
                       </p>
                    </div>
                  </div>
                ) : (
                  <div className="size-64 lg:size-80 bg-white dark:bg-slate-900/50 rounded-[40px] flex flex-col items-center justify-center text-slate-200 dark:text-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-[100px] mb-4">fingerprint</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Geometry Synthesis</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Identity System Grid */}
          <div className="space-y-6">
             <div className="flex flex-col gap-1">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter dark:text-white leading-none">
                  {brandIdentity?.name || 'BRAND IDENTITY'}
                </h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">{activeStyle} System Overview</p>
             </div>

             <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Main Mark', icon: 'auto_awesome' },
                  { label: 'Glyph Pack', icon: 'grid_view' },
                  { label: 'Monochrome', icon: 'invert_colors' },
                  { label: 'Export Assets', icon: 'output' }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => variations[i] && handleSelectVariation(i)}
                    className={`
                      group/card relative bg-slate-50 dark:bg-[#101322] rounded-[2rem] p-4 border transition-all cursor-pointer overflow-hidden
                      ${selectedIndex === i ? 'border-primary shadow-2xl shadow-primary/10 bg-primary/[0.02]' : 'border-slate-200 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/20'}
                    `}
                  >
                    <div className="aspect-video bg-white dark:bg-slate-900 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
                      {variations[i] ? (
                        <img src={variations[i]} alt={item.label} className="h-[80%] w-[80%] object-contain" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-200 dark:text-slate-800 text-3xl group-hover/card:scale-110 transition-transform">
                          {item.icon}
                        </span>
                      )}
                    </div>
                    <div className="px-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedIndex === i ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleDownload}
              disabled={!variations.length}
              className="w-full py-6 rounded-3xl bg-slate-900 dark:bg-primary text-white font-black uppercase text-xs tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-3xl disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-xl">download</span>
              Download Full Design Package
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Menu FAB placeholder to match image */}
      <button className="lg:hidden fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center">
        <span className="material-symbols-outlined">menu</span>
      </button>
    </div>
  );
};

export default MarkEngine;
