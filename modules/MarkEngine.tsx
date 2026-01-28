
import React, { useState } from 'react';
import { gemini } from '../services/geminiService';
import { LogoStyle } from '../types';

const MarkEngine: React.FC = () => {
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [activeStyle, setActiveStyle] = useState('minimalist');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

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
      const img = await gemini.generateLogo(description, industry, activeStyle);
      if (img) setResultImage(img);
    } catch (err) {
      alert("Failed to generate logo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `brand-mark-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0a0c16]">
      <div className="w-full lg:w-[420px] flex flex-col border-r border-slate-200 dark:border-[#222949] bg-white dark:bg-background-dark overflow-y-auto">
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-black mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">token</span>
            Mark Engine
          </h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Brand Vision</label>
            <textarea
              title="Describe what your brand stands for"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#181d34] min-h-[120px] p-4 text-sm"
              placeholder="e.g. A cutting-edge AI research firm with a focus on human-centric design..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry</label>
            <select 
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-11 rounded-xl text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#181d34] px-4 text-sm"
            >
              <option value="">Select industry</option>
              <option value="tech">Technology</option>
              <option value="luxury">Luxury Goods</option>
              <option value="eco">Sustainability</option>
              <option value="finance">FinTech</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Design Language</label>
            <div className="grid grid-cols-2 gap-3">
              {styles.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStyle(s.id)}
                  title={s.description}
                  className={`p-4 rounded-xl cursor-pointer flex flex-col items-center gap-2 transition-all border-2 ${
                    activeStyle === s.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-100 dark:border-slate-800'
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
            className="w-full mt-4 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-tighter text-lg shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-2xl">{loading ? 'sync' : 'draw'}</span>
            {loading ? 'Synthesizing...' : 'Generate Identity'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-[#060810] p-6 lg:p-12 overflow-y-auto flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="relative group">
            <div className="aspect-square w-full rounded-3xl bg-slate-50 dark:bg-[#181d34] border-2 border-slate-100 dark:border-slate-800 shadow-inner flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#222949_1px,transparent_1px)] [background-size:15px_15px] opacity-20"></div>
              
              <div className="z-10 flex flex-col items-center text-center p-8">
                {resultImage ? (
                  <img src={resultImage} alt="Generated logo" className="size-64 lg:size-80 rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-1000" />
                ) : (
                  <div className="size-64 lg:size-80 bg-white dark:bg-slate-900 rounded-[40px] flex flex-col items-center justify-center text-slate-200 dark:text-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-[100px] mb-4">{loading ? 'hourglass_top' : 'fingerprint'}</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Identity Synthesis</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-2">
              <h3 className="text-4xl font-black uppercase tracking-tighter leading-none dark:text-white">
                {description.split(' ').slice(0, 2).join(' ') || 'BRAND PREVIEW'}
              </h3>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{activeStyle} IDENTITY SYSTEM</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {['Main Mark', 'Monochrome', 'Glyph', 'Dark Variant'].map((label, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="h-24 bg-white dark:bg-slate-800 rounded-xl mb-3 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-200 dark:text-slate-700">style</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                  </div>
               ))}
            </div>

            {resultImage && (
              <button 
                onClick={handleDownload}
                className="w-full py-4 rounded-xl border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-black uppercase text-sm hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">download</span>
                Export Design Package
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkEngine;
