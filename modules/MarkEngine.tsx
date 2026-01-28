
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

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <div className="w-full lg:w-[420px] flex flex-col border-r border-slate-200 dark:border-[#222949] bg-background-light dark:bg-background-dark overflow-y-auto">
        <div className="p-6 space-y-6">
          <h2 className="text-slate-900 dark:text-white text-xl font-bold">Logo Studio</h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Brand Vision</label>
            <textarea
              title="Describe what your brand stands for to guide the AI"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-lg text-slate-900 dark:text-white border-slate-300 dark:border-[#313a68] bg-white dark:bg-[#181d34] min-h-32 p-4 text-sm"
              placeholder="e.g. A sustainable coffee brand focused on ethical sourcing and organic vibes..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Industry</label>
            <select 
              title="Specific industry helps AI choose appropriate symbolism"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full h-12 rounded-lg text-slate-900 dark:text-white border-slate-300 dark:border-[#313a68] bg-white dark:bg-[#181d34] px-4 text-sm"
            >
              <option value="">Select industry</option>
              <option value="tech">Technology</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="eco">Sustainability</option>
              <option value="media">Creative Media</option>
            </select>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Style Preferences</label>
            <div className="grid grid-cols-2 gap-3">
              {styles.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setActiveStyle(s.id)}
                  title={s.description}
                  className={`p-3 rounded-lg cursor-pointer flex flex-col items-center gap-2 transition-all border-2 ${
                    activeStyle === s.id ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-300 dark:border-[#313a68]'
                  }`}
                >
                  <span className={`material-symbols-outlined ${activeStyle === s.id ? 'text-primary' : 'text-slate-400'}`}>{s.icon}</span>
                  <span className={`text-xs ${activeStyle === s.id ? 'font-bold text-primary' : 'text-slate-600 dark:text-slate-400'}`}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !description}
            className="w-full mt-4 h-14 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">{loading ? 'sync' : 'bolt'}</span>
            {loading ? 'Processing...' : 'Generate Identity'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-[#0a0c16] p-4 lg:p-8 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col gap-8">
          <div className="relative group">
            <div className="aspect-square lg:aspect-video w-full rounded-2xl bg-white dark:bg-[#181d34] border border-slate-200 dark:border-[#222949] shadow-sm flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#222949_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
              
              <div className="z-10 flex flex-col items-center text-center p-6 lg:p-12">
                {resultImage ? (
                  <img src={resultImage} alt="Generated logo" className="size-48 lg:size-64 rounded-3xl mb-6 shadow-2xl animate-in fade-in zoom-in duration-500" />
                ) : (
                  <div className="size-48 lg:size-64 bg-slate-100 dark:bg-slate-800 rounded-3xl mb-6 flex items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-[80px]">{loading ? 'hourglass_top' : 'palette'}</span>
                  </div>
                )}
                <h3 className="text-xl lg:text-2xl font-bold dark:text-white uppercase tracking-tight">
                  {description.split(' ').slice(0, 2).join(' ') || 'Studio Preview'}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {['Primary Mark', 'Secondary', 'Iconic', 'Simplified'].map((label, i) => (
                <div key={i} className="bg-white dark:bg-[#181d34] p-4 rounded-xl border border-slate-200 dark:border-[#222949] text-center">
                  <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded mb-2 animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkEngine;
