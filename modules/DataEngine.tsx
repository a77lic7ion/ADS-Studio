
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { BlueprintNode, BrandIdentity } from '../types';

interface Props {
  brandIdentity: BrandIdentity | null;
  initialData?: any;
  onDataChange?: (data: any) => void;
}

const DataEngine: React.FC<Props> = ({ brandIdentity, initialData, onDataChange }) => {
  const [sourceType, setSourceType] = useState<'url' | 'file' | 'text'>(initialData?.sourceType || 'text');
  const [inputValue, setInputValue] = useState(initialData?.inputValue || '');
  const [designStyle, setDesignStyle] = useState(initialData?.designStyle || 'Process Flow');
  const [blueprint, setBlueprint] = useState<{ nodes: BlueprintNode[] } | null>(initialData?.blueprint || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setSourceType(initialData.sourceType || 'text');
      setInputValue(initialData.inputValue || '');
      setDesignStyle(initialData.designStyle || 'Process Flow');
      setBlueprint(initialData.blueprint || null);
    }
  }, [initialData]);

  useEffect(() => {
    onDataChange?.({ sourceType, inputValue, designStyle, blueprint });
  }, [sourceType, inputValue, designStyle, blueprint]);

  const generateBlueprint = async (customValue?: string) => {
    const val = customValue || inputValue;
    if (!val) return;
    setLoading(true);
    try {
      const data = await gemini.generateBlueprintFromData(val, designStyle, brandIdentity);
      if (data) setBlueprint(data);
    } finally {
      setLoading(false);
    }
  };

  const handleTrySample = () => {
    const sample = `${brandIdentity?.name || 'ResumeBoost'} AI Workflow: 1. Input: PDF/DOCX or Images. 2. Processing: Gemini 2.5 Flash and ATS Checkpoints. 3. Output: Modern and Minimal templates. 4. Download optimized PDF.`;
    setInputValue(sample);
    generateBlueprint(sample);
  };

  const renderConnections = () => {
    if (!blueprint) return null;
    const nodes = blueprint.nodes;
    
    if (designStyle === 'Process Flow') {
      const inputs = nodes.filter(n => n.y < 300);
      const engines = nodes.filter(n => n.y >= 300 && n.y < 600);
      const outputs = nodes.filter(n => n.y >= 600);

      const paths: React.ReactNode[] = [];
      
      inputs.forEach(input => {
        engines.forEach(eng => {
           paths.push(
             <path 
                key={`${input.id}-${eng.id}`} 
                d={`M ${input.x} ${input.y + 50} L ${eng.x} ${eng.y - 70}`} 
                stroke="#E2E8F0" 
                strokeWidth="2" 
                strokeDasharray="8,4" 
                fill="none" 
                className="animate-pulse"
             />
           );
        });
      });

      engines.forEach(eng => {
        outputs.forEach(out => {
          paths.push(
            <path 
                key={`${eng.id}-${out.id}`} 
                d={`M ${eng.x} ${eng.y + 70} L ${out.x} ${out.y - 80}`} 
                stroke="#E2E8F0" 
                strokeWidth="2" 
                strokeDasharray="8,4" 
                fill="none" 
                className="animate-pulse"
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
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          {isEngine ? (
            <g>
              <defs>
                <radialGradient id="engineGrad" cx="50%" cy="50%" r="50%">
                   <stop offset="0%" stopColor={node.color} stopOpacity="0.2" />
                   <stop offset="100%" stopColor={node.color} stopOpacity="0.0" />
                </radialGradient>
              </defs>
              <circle r="85" fill="url(#engineGrad)" className="animate-pulse" />
              <circle r="60" fill="white" stroke={node.color} strokeWidth="3" shadow-xl="true" />
              <text textAnchor="middle" y="5" className="material-symbols-outlined text-4xl" fill={node.color}>settings_input_component</text>
              <text textAnchor="middle" y="90" fill="#1E293B" className="text-[14px] font-black uppercase tracking-widest">{node.title}</text>
            </g>
          ) : (
            <g>
              <rect x="-55" y="-55" width="110" height="110" rx="20" fill="white" stroke="#E2E8F0" strokeWidth="2" className="shadow-lg" />
              <text textAnchor="middle" y="5" className="material-symbols-outlined text-3xl" fill={isOutput ? '#10B981' : '#3B82F6'}>{node.icon || 'description'}</text>
              <text textAnchor="middle" y="75" fill="#475569" className="text-[10px] font-black uppercase tracking-widest">{node.title}</text>
              {node.points && node.points.length > 0 && (
                <text textAnchor="middle" y="90" fill="#94A3B8" className="text-[8px] font-medium">{node.points[0]}</text>
              )}
            </g>
          )}
        </g>
      );
    }

    return (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        <circle r="75" fill={node.color} opacity="0.1" />
        <rect x="-95" y="-35" width="190" height="70" rx="35" fill={node.color} className="shadow-2xl" />
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
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          Infographic Engine
        </h2>

        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <h4 className="text-[10px] font-black uppercase text-primary mb-1">Brand Mapping</h4>
          <p className="text-xs font-bold truncate">{brandIdentity?.name || 'Generic Session'}</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Process Flow Description</label>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe your AI flow, business steps, or infrastructure..."
              className="w-full rounded-xl p-4 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 min-h-[140px] text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Direction</label>
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
            {loading ? 'Synthesizing Infographic...' : 'Generate Blueprint'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto bg-slate-100 dark:bg-[#060810] flex flex-col items-center justify-center p-8">
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#0d33f2_1px,transparent_0)] [background-size:40px_40px]"></div>
        
        {blueprint ? (
          <div className="relative w-full max-w-[900px] aspect-[1/1.3] bg-white rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden p-16 border border-white">
             <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="h-1 w-12 bg-primary/20 rounded-full"></div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900">{brandIdentity?.name || 'PROCESS ANALYSIS'}</h1>
                  <div className="h-1 w-12 bg-primary/20 rounded-full"></div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Architecture Schema & Data Orchestration</p>
             </div>
            
            <svg viewBox="0 0 1000 1000" className="blueprint-canvas w-full h-[70%]">
              {renderConnections()}
              {blueprint.nodes.map(node => renderNode(node))}
            </svg>

            <div className="absolute bottom-16 left-0 right-0 px-16">
              <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="flex flex-col gap-1">
                   <div className="text-[10px] font-black uppercase tracking-widest text-primary">Status: Validated</div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase">Architecture Node Synthesis Complete</div>
                </div>
                <button className="px-10 py-4 bg-slate-900 text-white font-black text-xs uppercase rounded-2xl shadow-xl hover:scale-105 transition-transform">Download Asset</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            <span className="material-symbols-outlined text-[120px] text-slate-200 mb-6">dynamic_feed</span>
            <p className="text-2xl font-black uppercase italic tracking-tighter text-slate-300">Ready for Logic Mapping</p>
            <button onClick={handleTrySample} className="mt-8 w-full py-4 bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all">
               Load Sample {brandIdentity?.name || 'Brand'} Workflow
            </button>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center">
             <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Calculating Logic Layout...</p>
             <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">Synchronizing with {brandIdentity?.name} guidelines</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataEngine;
