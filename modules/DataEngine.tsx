
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
    const sample = `${brandIdentity?.name || 'ResumeBoost'} AI: 1. Input: PDF/DOCX or Images. 2. Processing: Gemini 2.5 Flash and ATS Checkpoints. 3. Output: Modern and Minimal templates. 4. Download optimized PDF.`;
    setInputValue(sample);
    generateBlueprint(sample);
  };

  const renderConnections = () => {
    if (!blueprint) return null;
    const nodes = blueprint.nodes;
    
    // For Process Flow, connect sequentially based on Y position clusters
    if (designStyle === 'Process Flow') {
      const inputs = nodes.filter(n => n.y < 300);
      const engines = nodes.filter(n => n.y >= 300 && n.y < 600);
      const outputs = nodes.filter(n => n.y >= 600);

      const paths: React.ReactNode[] = [];
      
      inputs.forEach(input => {
        engines.forEach(eng => {
           paths.push(
             <path key={`${input.id}-${eng.id}`} d={`M ${input.x} ${input.y + 40} L ${eng.x} ${eng.y - 60}`} stroke="#CBD5E1" strokeWidth="2" strokeDasharray="5,5" fill="none" />
           );
        });
      });

      engines.forEach(eng => {
        outputs.forEach(out => {
          paths.push(
            <path key={`${eng.id}-${out.id}`} d={`M ${eng.x} ${eng.y + 60} L ${out.x} ${out.y - 80}`} stroke="#CBD5E1" strokeWidth="2" strokeDasharray="5,5" fill="none" />
          );
        });
      });

      return paths;
    }

    // Default connection logic for other styles
    const core = nodes.find(n => n.id.includes('core')) || nodes[0];
    return nodes.filter(n => n.id !== core.id).map((node, i) => (
      <path key={i} d={`M ${core.x} ${core.y} Q ${(core.x+node.x)/2} ${core.y} ${node.x} ${node.y}`} stroke={node.color} strokeWidth="2" fill="none" opacity="0.3" />
    ));
  };

  const renderNode = (node: any) => {
    if (designStyle === 'Process Flow') {
      const isEngine = node.y >= 300 && node.y < 600;
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          {isEngine ? (
            <g>
              <circle r="60" fill="white" stroke="#E2E8F0" strokeWidth="2" />
              <circle r="50" fill={node.color} opacity="0.1" />
              <text textAnchor="middle" y="0" className="material-symbols-outlined text-3xl" fill={node.color}>hub</text>
              <text textAnchor="middle" y="85" fill="#1E293B" className="text-[12px] font-black uppercase tracking-widest">{node.title}</text>
            </g>
          ) : (
            <g>
              <rect x="-40" y="-40" width="80" height="80" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1" />
              <text textAnchor="middle" y="5" className="material-symbols-outlined text-2xl" fill="#475569">{node.icon || 'description'}</text>
              <text textAnchor="middle" y="60" fill="#64748B" className="text-[9px] font-black uppercase tracking-widest">{node.title}</text>
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

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Process Data</label>
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
                  className={`py-2 px-2 text-[9px] font-black uppercase border-2 rounded-xl transition-all ${designStyle === style ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => generateBlueprint()} disabled={loading || !inputValue} className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/30 disabled:opacity-50">
            {loading ? 'Synthesizing Infographic...' : 'Generate Blueprint'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto bg-white dark:bg-[#060810] flex flex-col items-center justify-center p-8">
        <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#0d33f2_1px,transparent_0)] [background-size:40px_40px]"></div>
        
        {blueprint ? (
          <div className="relative w-full max-w-[1000px] aspect-[1/1.2] bg-white rounded-[3rem] shadow-2xl overflow-hidden p-12 border border-slate-100">
             <div className="text-center mb-16">
                <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">{brandIdentity?.name || 'PROCESS ANALYSIS'}</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Engine Architecture & Data Flow</p>
             </div>
            
            <svg viewBox="0 0 1000 1000" className="blueprint-canvas w-full h-full">
              {renderConnections()}
              {blueprint.nodes.map(node => renderNode(node))}
            </svg>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                <button className="px-12 py-4 bg-primary text-white font-black text-xs uppercase rounded-xl shadow-2xl shadow-primary/30">DOWNLOAD ASSET</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            <span className="material-symbols-outlined text-[120px] text-slate-200 mb-6">dynamic_feed</span>
            <p className="text-2xl font-black uppercase italic tracking-tighter text-slate-300">Ready for Synthesis</p>
            <button onClick={handleTrySample} className="mt-8 w-full py-4 bg-primary/10 text-primary border-2 border-primary/20 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase transition-all">
               Load Sample {brandIdentity?.name || 'Brand'} Flow
            </button>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-center">
             <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Calculating Logic Layout...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataEngine;
