
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gemini } from '../services/geminiService';
import { BlueprintNode, BrandIdentity } from '../types';

interface Props {
  brandIdentity: BrandIdentity | null;
  initialData?: any;
  onDataChange?: (data: any) => void;
}

const DataEngine: React.FC<Props> = ({ brandIdentity, initialData, onDataChange }) => {
  const [sourceType, setSourceType] = useState<'url' | 'file' | 'text'>('text');
  const [inputValue, setInputValue] = useState('');
  const [designStyle, setDesignStyle] = useState('Process Flow');
  const [blueprint, setBlueprint] = useState<{ nodes: BlueprintNode[] } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const isInitializing = useRef(false);

  useEffect(() => {
    if (initialData) {
      isInitializing.current = true;
      setSourceType(initialData.sourceType || 'text');
      setInputValue(initialData.inputValue || '');
      setDesignStyle(initialData.designStyle || 'Process Flow');
      setBlueprint(initialData.blueprint || null);
      setTimeout(() => { isInitializing.current = false; }, 100);
    }
  }, [initialData]);

  const syncData = useCallback(() => {
    if (isInitializing.current) return;
    onDataChange?.({ sourceType, inputValue, designStyle, blueprint });
  }, [sourceType, inputValue, designStyle, blueprint, onDataChange]);

  useEffect(() => {
    syncData();
  }, [syncData]);

  const generateBlueprint = async (customValue?: string) => {
    const val = customValue || inputValue;
    if (!val) return;
    setLoading(true);
    try {
      const data = await gemini.generateBlueprintFromData(val, designStyle, brandIdentity);
      if (data) setBlueprint(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrySample = () => {
    const sample = `${brandIdentity?.name || 'ResumeBoost'} AI: 1. Input: PDF/DOCX or Images. 2. Processing: Gemini 2.5 Flash and ATS Checkpoints. 3. Output: Modern and Minimal templates. 4. Download optimized PDF.`;
    setInputValue(sample);
    generateBlueprint(sample);
  };

  const renderTierLines = () => {
    if (designStyle !== 'Process Flow') return null;
    return (
      <g opacity="0.1">
        <line x1="50" y1="280" x2="950" y2="280" stroke="#000" strokeWidth="1" strokeDasharray="10,10" />
        <line x1="50" y1="620" x2="950" y2="620" stroke="#000" strokeWidth="1" strokeDasharray="10,10" />
        <text x="60" y="270" className="text-[10px] font-black uppercase tracking-widest fill-slate-400">INPUT TIER</text>
        <text x="60" y="610" className="text-[10px] font-black uppercase tracking-widest fill-slate-400">OUTPUT TIER</text>
      </g>
    );
  };

  const renderConnections = () => {
    if (!blueprint) return null;
    const nodes = blueprint.nodes;
    
    if (designStyle === 'Process Flow') {
      const inputs = nodes.filter(n => n.y < 300);
      const engines = nodes.filter(n => n.y >= 300 && n.y < 600);
      const outputs = nodes.filter(n => n.y >= 600);

      const paths: React.ReactNode[] = [];
      
      inputs.forEach((input, idx) => {
        engines.forEach(eng => {
           paths.push(
             <path 
                key={`in-${input.id}-${eng.id}-${idx}`} 
                d={`M ${input.x} ${input.y + 60} C ${input.x} ${input.y + 120}, ${eng.x} ${eng.y - 120}, ${eng.x} ${eng.y - 80}`} 
                stroke="#E2E8F0" 
                strokeWidth="2" 
                strokeDasharray="10,5" 
                fill="none" 
             />
           );
        });
      });

      engines.forEach(eng => {
        outputs.forEach((out, idx) => {
          paths.push(
            <path 
                key={`out-${eng.id}-${out.id}-${idx}`} 
                d={`M ${eng.x} ${eng.y + 80} C ${eng.x} ${eng.y + 120}, ${out.x} ${out.y - 120}, ${out.x} ${out.y - 60}`} 
                stroke="#E2E8F0" 
                strokeWidth="2" 
                strokeDasharray="10,5" 
                fill="none" 
            />
          );
        });
      });

      return paths;
    }

    const core = nodes.find(n => n.id.includes('core')) || nodes[0];
    return nodes.filter(n => n.id !== core.id).map((node, i) => (
      <path key={i} d={`M ${core.x} ${core.y} Q ${(core.x+node.x)/2} ${core.y} ${node.x} ${node.y}`} stroke={node.color} strokeWidth="2" fill="none" opacity="0.3" />
    ));
  };

  const renderNode = (node: any) => {
    if (designStyle === 'Process Flow') {
      const isEngine = node.y >= 300 && node.y < 600;
      const isOutput = node.y >= 600;
      const isInput = node.y < 300;

      if (isEngine) {
        return (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
             <defs>
                <filter id="engineGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="15" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="engineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
             </defs>
             <circle r="90" fill={node.color || '#3B82F6'} opacity="0.1" filter="url(#engineGlow)" />
             <polygon points="0,-70 60,-35 60,35 0,70 -60,35 -60,-35" fill="white" stroke={node.color || '#3B82F6'} strokeWidth="4" />
             <text textAnchor="middle" y="15" className="material-symbols-outlined text-5xl" fill={node.color || '#3B82F6'}>hub</text>
             <text textAnchor="middle" y="110" fill="#1E293B" className="text-sm font-black uppercase tracking-[0.2em]">{node.title || 'THE ENGINE'}</text>
             <text textAnchor="middle" y="130" fill="#64748B" className="text-[9px] font-bold uppercase tracking-widest">{node.points?.[0] || 'AI PROCESSING'}</text>
          </g>
        );
      }

      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <rect x="-60" y="-55" width="120" height="110" rx="15" fill="white" stroke="#F1F5F9" strokeWidth="2" className="shadow-sm" />
          <foreignObject x="-60" y="-55" width="120" height="110">
             <div className="flex flex-col items-center justify-center h-full w-full text-center p-3">
                <span className="material-symbols-outlined text-2xl mb-2" style={{ color: isInput ? '#64748B' : '#1E293B' }}>{node.icon || (isInput ? 'description' : 'verified')}</span>
                <span className="text-[10px] font-black uppercase text-slate-800 leading-tight">{node.title}</span>
                {node.points && node.points[0] && (
                  <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 leading-tight">{node.points[0]}</span>
                )}
             </div>
          </foreignObject>
        </g>
      );
    }

    return (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        <circle r="75" fill={node.color} opacity="0.1" />
        <rect x="-95" y="-35" width="190" height="70" rx="35" fill={node.color} />
        <text textAnchor="middle" y="5" fill="#fff" className="text-[12px] font-black uppercase tracking-widest pointer-events-none">{node.title}</text>
        <foreignObject x="-100" y="50" width="200" height="150">
          <div className="bg-white/95 dark:bg-[#1a1e35]/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <ul className="space-y-1">
              {node.points.map((p: string, i: number) => (
                <li key={i} className="text-[9px] text-slate-800 dark:text-slate-200 font-bold flex items-start gap-1">
                  <span className="size-1.5 rounded-full bg-primary mt-1 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </foreignObject>
      </g>
    );
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0a0c16]">
      <div className="w-full lg:w-[420px] border-r border-slate-200 dark:border-[#222949] bg-white dark:bg-background-dark p-6 overflow-y-auto z-10 flex flex-col gap-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">account_tree</span>
          Blueprint Engine
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Process Logic Source</label>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your process flow tiers (e.g. Input: PDF/DOCX -> Engine: AI Processing -> Output: PDF)..."
              className="w-full rounded-xl p-4 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 min-h-[140px] text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blueprint Visual Style</label>
            <div className="grid grid-cols-2 gap-2">
              {['Process Flow', 'Organic Blueprint', 'Cyber Workflow', 'Bauhaus Geometric'].map(style => (
                <button
                  key={style}
                  onClick={() => setDesignStyle(style)}
                  className={`py-2 px-2 text-[9px] font-black uppercase border-2 rounded-xl transition-all ${designStyle === style ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => generateBlueprint()} disabled={loading || !inputValue} className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/30 disabled:opacity-50 transition-all hover:-translate-y-1 active:scale-[0.98]">
            {loading ? 'Synthesizing Blueprint...' : 'Generate Architecture'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto bg-slate-100 dark:bg-[#060810] flex flex-col items-center justify-center p-8">
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#0d33f2_1px,transparent_0)] [background-size:40px_40px]"></div>
        
        {blueprint ? (
          <div className="relative w-full max-w-[950px] aspect-[1/1.3] bg-white rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] overflow-hidden p-20 border border-white">
             <div className="text-center mb-16 relative">
                <div className="flex items-center justify-center gap-4 mb-4">
                   {brandIdentity?.logo && <img src={brandIdentity.logo} alt="Logo" className="h-10 w-10 object-contain rounded-lg opacity-40" />}
                   <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">{brandIdentity?.name || 'ARCHITECTURE OVERVIEW'}</h1>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">System Architecture & Data Orchestration</p>
             </div>
            
            <svg viewBox="0 0 1000 1000" className="blueprint-canvas w-full h-[65%] drop-shadow-2xl">
              {renderTierLines()}
              {renderConnections()}
              {blueprint.nodes.map(node => renderNode(node))}
            </svg>

            <div className="absolute bottom-16 left-0 right-0 px-20">
              <div className="flex flex-col gap-6">
                <div className="h-0.5 w-full bg-slate-100 rounded-full"></div>
                <div className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[3rem] border border-slate-100 backdrop-blur-sm">
                  <div className="flex items-center gap-5">
                    <div className="size-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                        <span className="material-symbols-outlined text-3xl">verified</span>
                    </div>
                    <div className="flex flex-col">
                        <div className="text-[12px] font-black uppercase tracking-[0.1em] text-slate-900">Blueprint Active</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimized for Production Tiers</div>
                    </div>
                  </div>
                  <button className="px-14 py-5 bg-primary text-white font-black text-xs uppercase rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all active:scale-95">Download PDF Blueprint</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            <span className="material-symbols-outlined text-[120px] text-slate-200 mb-6">dynamic_feed</span>
            <p className="text-2xl font-black uppercase italic tracking-tighter text-slate-300 leading-tight">Architecture Engine<br/>Ready for Logic Mapping</p>
            <button onClick={handleTrySample} className="mt-10 w-full py-5 bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary hover:text-white rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all">
               Load {brandIdentity?.name || 'Brand'} Sample Flow
            </button>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
             <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6 shadow-2xl"></div>
             <p className="text-sm font-black uppercase tracking-[0.2em] text-primary animate-pulse">Calculating Tiered Logic...</p>
             <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">Orchestrating Brand Schema</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataEngine;
