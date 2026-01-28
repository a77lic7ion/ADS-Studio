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
  const [activeStyle, setActiveStyle] = useState('minimalist');
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isInitializing = useRef(false);

  useEffect(() => {
    if (initialData) {
      isInitializing.current = true;
      setDescription(initialData.description || (brandIdentity ? `Minimalist logo for ${brandIdentity.name}, emphasizing ${brandIdentity.industry}.` : ''));
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
    onDataChange?.({ description, activeStyle, variations, selectedIndex });
  }, [description, activeStyle, variations, selectedIndex, onDataChange]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  const handleGenerate = async () => {
    if (!description) return;
    setLoading(true);
    try {
      const results = await gemini.generateLogoSystem(description, brandIdentity?.industry || '', activeStyle, brandIdentity);
      if (results.length > 0) {
        setVariations(results);
        setSelectedIndex(0);
        onLogoGenerated?.(results[0]);
      }
    } catch (err: any) {
      alert("Quota exceeded or error occurred. Please try again in a few moments.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVariation = (index: number) => {
    setSelectedIndex(index);
    onLogoGenerated?.(variations[index]);
  };

  const currentImg = variations[selectedIndex] || null;

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#060810]">
      {/* Control Panel */}
      <div className="w-full lg:w-[400px] flex flex-col border-r border-white/5 bg-[#0a0c16] overflow-y-auto shrink-0">
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-black flex items-center gap-3 italic uppercase tracking-tighter">
              <span className="material-symbols-outlined text-primary text-3xl">token</span>
              Identity Suite
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Synthesis Control v1.0</p>
          </div>

          <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
            <h4 className="text-[10px] font-black uppercase text-primary mb-1 tracking-widest">Active Brand</h4>
            <p className="text-sm font-bold truncate text-white">{brandIdentity?.name || 'Manual Session'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synthesis Prompt</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl text-white border-white/5 bg-white/5 min-h-[140px] p-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600"
                placeholder="E.g. A premium coffee shop logo featuring a minimalist cup and pastry silhouette..."
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Archetype</label>
              <div className="grid grid-cols-2 gap-3">
                {['Minimalist', 'Corporate', 'Abstract', 'Tech'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveStyle(s.toLowerCase())}
                    className={`p-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${
                      activeStyle === s.toLowerCase() ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20' : 'border-white/5 text-slate-500 hover:border-white/20'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !description}
            className="w-full h-16 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all disabled:opacity-30 disabled:translate-y-0"
          >
            {loading ? 'Synthesizing...' : 'Generate Identity'}
          </button>
        </div>
      </div>

      {/* Preview Stage */}
      <div className="flex-1 p-8 lg:p-16 overflow-y-auto flex flex-col items-center justify-start space-y-12">
        {loading && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
            <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-primary animate-pulse">Computing Geometry System...</p>
          </div>
        )}

        {/* Big Preview Box */}
        <div className="w-full max-w-[700px] aspect-square rounded-[3.5rem] bg-[#0d111d] border border-white/5 flex items-center justify-center relative shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:25px_25px] opacity-20"></div>
          {currentImg ? (
            <div className="flex flex-col items-center gap-8 animate-in zoom-in fade-in duration-1000">
               <img src={currentImg} className="size-[55%] object-contain rounded-[3rem] shadow-2xl" />
               <div className="text-center space-y-2">
                  <h2 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-white">{brandIdentity?.name || 'ADS STUDIO'}</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Identity Synthesis Phase 01</p>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-700 animate-pulse">
              <span className="material-symbols-outlined text-[120px]">fingerprint</span>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4">Awaiting Signal</p>
            </div>
          )}
        </div>

        {/* Variation Grid */}
        <div className="w-full max-w-[900px] space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{brandIdentity?.name || 'MARK'} SYSTEM</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{activeStyle} IDENTITY OVERVIEW</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Main Mark', icon: 'token' },
              { label: 'Glyph Pack', icon: 'grid_view' },
              { label: 'Monochrome', icon: 'invert_colors' },
              { label: 'Export Assets', icon: 'output' }
            ].map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => variations[idx] && handleSelectVariation(idx)}
                className={`group relative p-4 rounded-[2.5rem] bg-[#0a0c16] border transition-all cursor-pointer ${selectedIndex === idx ? 'border-primary shadow-2xl shadow-primary/10' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className="aspect-[3/2] bg-[#101322] rounded-3xl mb-4 flex items-center justify-center overflow-hidden border border-white/[0.02]">
                  {variations[idx] ? (
                    <img src={variations[idx]} className="h-[80%] w-[80%] object-contain rounded-lg" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-800 text-4xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  )}
                </div>
                <div className="px-2">
                   <p className={`text-[10px] font-black uppercase tracking-widest ${selectedIndex === idx ? 'text-primary' : 'text-slate-500'}`}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[900px] pt-8">
           <button 
             onClick={() => window.print()}
             className="w-full h-16 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-primary hover:text-white transition-all shadow-3xl"
           >
              Download Design Package
           </button>
        </div>
      </div>
    </div>
  );
};

export default MarkEngine;