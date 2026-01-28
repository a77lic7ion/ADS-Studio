import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gemini } from '../services/geminiService';
import { BlueprintNode, BrandIdentity } from '../types';

interface Props {
  brandIdentity: BrandIdentity | null;
  initialData?: any;
  onDataChange?: (data: any) => void;
}

const DataEngine: React.FC<Props> = ({ brandIdentity, initialData, onDataChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [designStyle, setDesignStyle] = useState('Process Flow');
  const [blueprint, setBlueprint] = useState<{ nodes: BlueprintNode[] } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const isInitializing = useRef(false);

  const styles = [
    'Process Flow',
    'Minimalist Geometric',
    'Hand-Drawn Organic',
    'Corporate Data Visualization',
    'Abstract Infographic'
  ];

  useEffect(() => {
    if (initialData) {
      isInitializing.current = true;
      setInputValue(initialData.inputValue || '');
      setDesignStyle(initialData.designStyle || 'Process Flow');
      setBlueprint(initialData.blueprint || null);
      setTimeout(() => { isInitializing.current = false; }, 100);
    }
  }, [initialData]);

  const syncData = useCallback(() => {
    if (isInitializing.current) return;
    onDataChange?.({ inputValue, designStyle, blueprint });
  }, [inputValue, designStyle, blueprint, onDataChange]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  const generateBlueprint = async () => {
    if (!inputValue) return;
    setLoading(true);
    try {
      const data = await gemini.generateBlueprintFromData(inputValue, designStyle, brandIdentity);
      if (data) setBlueprint(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderNode = (node: any) => {
    return (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        <circle r="70" fill={node.color} opacity="0.1" className="animate-pulse" />
        <rect x="-80" y="-40" width="160" height="80" rx="20" fill="white" stroke={node.color} strokeWidth="2" />
        <text textAnchor="middle" y="5" className="text-[12px] font-black uppercase tracking-widest fill-slate-900 pointer-events-none">{node.title}</text>
        <foreignObject x="-90" y="50" width="180" height="120">
          <div className="bg-white/95 p-3 rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sub-Details</p>
            <ul className="space-y-1">
              {node.points?.slice(0, 3).map((p: string, i: number) => (
                <li key={i} className="text-[8px] text-slate-800 font-bold truncate">• {p}</li>
              ))}
            </ul>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0a0c16]">
      <div className="w-full lg:w-[400px] border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0c16] p-8 overflow-y-auto z-10 flex flex-col gap-8">
        <h2 className="text-xl font-black flex items-center gap-3 italic uppercase tracking-tighter">
          <span className="material-symbols-outlined text-primary text-3xl">account_tree</span>
          Blueprint Engine
        </h2>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Source</label>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste data, project notes, or process flows..."
              className="w-full rounded-2xl p-4 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 min-h-[160px] text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Direction</label>
            <div className="flex flex-col gap-2">
              {styles.map(style => (
                <button
                  key={style}
                  onClick={() => setDesignStyle(style)}
                  className={`py-3 px-4 text-left text-[10px] font-black uppercase border-2 rounded-xl transition-all ${designStyle === style ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-300'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generateBlueprint} disabled={loading || !inputValue} className="w-full h-16 rounded-3xl bg-primary text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 disabled:opacity-50 transition-all hover:-translate-y-1">
            {loading ? 'Processing logic...' : 'Synthesize Blueprint'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-100 dark:bg-[#060810] flex flex-col items-center justify-center p-8 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
             <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6 shadow-2xl"></div>
             <p className="text-sm font-black uppercase tracking-[0.2em] text-primary animate-pulse">Calculating architecture tiers...</p>
          </div>
        )}

        {blueprint ? (
          <div className="relative w-full max-w-[900px] aspect-[1/1.3] bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden p-16 border border-white">
             <div className="text-center mb-16 relative">
                <div className="flex items-center justify-center gap-4 mb-4">
                   {brandIdentity?.logo && <img src={brandIdentity.logo} className="h-12 w-12 object-contain rounded-xl opacity-30" />}
                   <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">{brandIdentity?.name || 'ARCHITECTURE OVERVIEW'}</h1>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">{designStyle} Blueprint System</p>
             </div>
            
            <svg viewBox="0 0 1000 1000" className="w-full h-[65%] drop-shadow-2xl">
              {blueprint.nodes.map(node => renderNode(node))}
            </svg>

            <div className="absolute bottom-16 left-0 right-0 px-20">
               <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[3rem] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-emerald-500 filled">verified</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blueprint Phase Active</span>
                  </div>
                  <button className="px-12 py-5 bg-slate-900 text-white font-black text-[10px] uppercase rounded-2xl shadow-2xl hover:bg-primary transition-all">Download PDF Architecture</button>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center max-w-md animate-in fade-in zoom-in">
            <span className="material-symbols-outlined text-[100px] text-slate-200 dark:text-slate-800 mb-6">hub</span>
            <p className="text-2xl font-black italic uppercase tracking-tighter text-slate-300">Ready for Logic Mapping</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataEngine;