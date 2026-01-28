
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { BlueprintNode } from '../types';

interface Props {
  initialData?: any;
  onDataChange?: (data: any) => void;
}

const DataEngine: React.FC<Props> = ({ initialData, onDataChange }) => {
  const [sourceType, setSourceType] = useState<'url' | 'file' | 'text'>(initialData?.sourceType || 'text');
  const [inputValue, setInputValue] = useState(initialData?.inputValue || '');
  const [designStyle, setDesignStyle] = useState(initialData?.designStyle || 'Organic Blueprint');
  const [blueprint, setBlueprint] = useState<{ nodes: BlueprintNode[] } | null>(initialData?.blueprint || null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setSourceType(initialData.sourceType || 'text');
      setInputValue(initialData.inputValue || '');
      setDesignStyle(initialData.designStyle || 'Organic Blueprint');
      setBlueprint(initialData.blueprint || null);
    }
  }, [initialData]);

  useEffect(() => {
    onDataChange?.({ sourceType, inputValue, designStyle, blueprint });
  }, [sourceType, inputValue, designStyle, blueprint]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputValue(`Reference: ${file.name} Content Extract: ${event.target?.result?.toString().slice(0, 1000)}...`);
      };
      reader.readAsText(file);
    }
  };

  const generateBlueprint = async (customValue?: string) => {
    const val = customValue || inputValue;
    if (!val) return;
    setLoading(true);
    try {
      const data = await gemini.generateBlueprintFromData(val, designStyle);
      if (data) setBlueprint(data);
    } finally {
      setLoading(false);
    }
  };

  const handleTrySample = () => {
    const sample = "Global Logistics Supply Chain Optimization: 1. Core Hub manages inventory. 2. Suppliers send raw materials. 3. Manufacturing assembles components. 4. Warehouse handles distribution. 5. Logistics routes to Retail. 6. Customer receives product.";
    setInputValue(sample);
    generateBlueprint(sample);
  };

  const renderConnections = () => {
    if (!blueprint) return null;
    const core = blueprint.nodes.find(n => n.id === 'core' || n.title.toLowerCase().includes('core')) || blueprint.nodes[0];
    
    return blueprint.nodes.filter(n => n.id !== core.id).map((node, i) => {
      if (designStyle === 'Cyber Workflow') {
        return (
          <path
            key={i}
            d={`M ${core.x} ${core.y} L ${node.x} ${core.y} L ${node.x} ${node.y}`}
            stroke={node.color}
            strokeWidth="1"
            fill="none"
            className="opacity-60 animate-pulse"
            style={{ strokeDasharray: '4,4' }}
          />
        );
      }

      if (designStyle === 'Bauhaus Geometric') {
        return (
          <path
            key={i}
            d={`M ${core.x} ${core.y} L ${node.x} ${node.y}`}
            stroke={node.color}
            strokeWidth="6"
            className="opacity-20"
          />
        );
      }

      if (designStyle === 'Hand-Drawn Schematic') {
        const mx = (core.x + node.x) / 2 + (Math.random() * 30 - 15);
        const my = (core.y + node.y) / 2 + (Math.random() * 30 - 15);
        return (
          <path
            key={i}
            d={`M ${core.x} ${core.y} Q ${mx} ${my} ${node.x} ${node.y}`}
            stroke="#475569"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="opacity-60"
          />
        );
      }

      const dx = node.x - core.x;
      const midX = core.x + dx / 2;
      return (
        <path
          key={i}
          d={`M ${core.x} ${core.y} Q ${midX} ${core.y} ${node.x} ${node.y}`}
          stroke={node.color}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="opacity-30"
        />
      );
    });
  };

  const renderNode = (node: BlueprintNode) => {
    if (designStyle === 'Cyber Workflow') {
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <rect x="-100" y="-25" width="200" height="50" fill="none" stroke={node.color} strokeWidth="1" />
          <rect x="-95" y="-20" width="190" height="40" fill={node.color} opacity="0.1" />
          <text textAnchor="middle" y="5" fill={node.color} className="text-[10px] font-mono tracking-widest uppercase font-bold">
            {node.title}
          </text>
          <foreignObject x="-110" y="30" width="220" height="150">
            <div className="bg-black/90 border border-slate-800 p-3 font-mono text-[8px] text-emerald-400 shadow-2xl">
              <div className="opacity-40 mb-1">0x{node.id.slice(0, 4)} LOG_ENTRY</div>
              {node.points.map((p, i) => <div key={i} className="mb-0.5 whitespace-nowrap overflow-hidden text-primary">>> {p}</div>)}
            </div>
          </foreignObject>
        </g>
      );
    }

    if (designStyle === 'Bauhaus Geometric') {
      const shapeType = node.id.charCodeAt(0) % 3;
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          {shapeType === 0 && <circle r="60" fill={node.color} />}
          {shapeType === 1 && <rect x="-60" y="-60" width="120" height="120" fill={node.color} />}
          {shapeType === 2 && <polygon points="0,-70 60,35 -60,35" fill={node.color} />}
          <text textAnchor="middle" y="5" fill="white" className="text-[12px] font-black uppercase tracking-tighter">
            {node.title}
          </text>
          <foreignObject x="-90" y="70" width="180" height="150">
            <div className="bg-white p-3 border-4 border-black font-black uppercase text-[9px] text-black">
              {node.points.map((p, i) => <div key={i} className="mb-1">{p}</div>)}
            </div>
          </foreignObject>
        </g>
      );
    }

    if (designStyle === 'Hand-Drawn Schematic') {
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <ellipse cx="0" cy="0" rx="95" ry="40" fill="white" stroke="#475569" strokeWidth="2" strokeDasharray="5,3" />
          <text textAnchor="middle" y="5" fill="#1e293b" className="text-[14px] font-bold" style={{ fontFamily: 'Brush Script MT, cursive' }}>
            {node.title}
          </text>
          <foreignObject x="-85" y="45" width="170" height="150">
            <div className="p-2 space-y-1 text-slate-700 italic border-l-2 border-slate-300 ml-4" style={{ fontFamily: 'Brush Script MT, cursive' }}>
              {node.points.map((p, i) => <div key={i} className="text-[11px] leading-tight">- {p}</div>)}
            </div>
          </foreignObject>
        </g>
      );
    }

    return (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        <circle r="75" fill={node.color} opacity="0.1" />
        <rect x="-95" y="-35" width="190" height="70" rx="35" fill={node.color} className="shadow-2xl" />
        <text textAnchor="middle" y="5" fill="#fff" className="text-[12px] font-black uppercase tracking-widest pointer-events-none">
          {node.title}
        </text>
        <foreignObject x="-100" y="50" width="200" height="200">
          <div className="bg-white/95 dark:bg-[#1a1e35]/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <ul className="space-y-2">
              {node.points.map((p, i) => (
                <li key={i} className="text-[10px] text-slate-800 dark:text-slate-200 font-bold flex items-start gap-2">
                  <span className="size-2 rounded-full bg-primary mt-1 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </foreignObject>
      </g>
    );
  };

  const handleDownloadSVG = () => {
    const svg = document.querySelector('.blueprint-canvas');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = 2000;
      canvas.height = 1400;
      ctx!.fillStyle = designStyle === 'Cyber Workflow' ? '#000' : '#fff';
      ctx!.fillRect(0, 0, 2000, 1400);
      ctx!.drawImage(img, 0, 0, 2000, 1400);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      const pngData = canvas.toDataURL('image/png');
      link.href = pngData;
      link.download = `blueprint-${designStyle.toLowerCase().replace(' ', '-')}.png`;
      link.click();

      const assets = JSON.parse(localStorage.getItem('ads_studio_assets') || '[]');
      assets.unshift({ id: Date.now(), type: 'Infographic', data: pngData, timestamp: new Date().toLocaleString() });
      localStorage.setItem('ads_studio_assets', JSON.stringify(assets.slice(0, 20)));
    };
    img.src = url;
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-[#0a0c16]">
      <div className="w-full lg:w-[420px] border-r border-slate-200 dark:border-[#222949] bg-white dark:bg-background-dark p-6 overflow-y-auto z-10 flex flex-col gap-6">
        <h2 className="text-xl font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          Blueprint Engine
        </h2>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Input</label>
            <div className="flex bg-slate-100 dark:bg-[#1a1e35] p-1 rounded-lg">
              {['text', 'url', 'file'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSourceType(type as any)}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded ${sourceType === type ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            {sourceType === 'text' && (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste business logic or project steps here..."
                className="w-full rounded-xl p-4 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 min-h-[140px] text-sm focus:ring-2 focus:ring-primary/20"
              />
            )}

            {sourceType === 'url' && (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="https://your-docs.com"
                className="w-full rounded-xl h-12 px-4 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 text-sm"
              />
            )}

            {sourceType === 'file' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-center"
              >
                <span className="material-symbols-outlined text-slate-400">upload_file</span>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Upload TXT/MD</span>
                <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Direction</label>
            <div className="grid grid-cols-2 gap-2">
              {['Organic Blueprint', 'Cyber Workflow', 'Bauhaus Geometric', 'Hand-Drawn Schematic'].map(style => (
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

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => generateBlueprint()}
              disabled={loading || !inputValue}
              className="flex-1 h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-2xl">{loading ? 'sync' : 'magic_button'}</span>
              {loading ? 'Synthesizing...' : 'Visualize Architecture'}
            </button>
            {blueprint && (
              <button 
                onClick={handleDownloadSVG}
                className="aspect-square bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 rounded-2xl hover:scale-105 transition-transform flex items-center justify-center"
                title="Export high-res PNG"
              >
                <span className="material-symbols-outlined">download</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto bg-white dark:bg-[#060810] flex flex-col items-center justify-center p-8">
        <div className={`absolute inset-0 opacity-[0.05]`} style={{ 
          backgroundImage: designStyle === 'Hand-Drawn Schematic' ? 'url("https://www.transparenttextures.com/patterns/paper.png")' : 'radial-gradient(#0d33f2 1px, transparent 0)', 
          backgroundSize: '40px 40px',
          backgroundColor: designStyle === 'Cyber Workflow' ? '#000' : 'transparent'
        }}></div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center text-primary animate-pulse z-20">
            <span className="material-symbols-outlined text-[100px] animate-spin mb-4">refresh</span>
            <p className="text-xl font-black uppercase italic tracking-tighter">Calculating Logic...</p>
          </div>
        ) : blueprint ? (
          <div className="relative w-full max-w-[1000px] aspect-[1.4/1] animate-in fade-in zoom-in duration-1000 transform-gpu">
            <svg viewBox="0 0 1000 700" className="blueprint-canvas w-full h-full drop-shadow-2xl">
              {renderConnections()}
              {blueprint.nodes.map(node => renderNode(node))}
            </svg>
            <div className="absolute top-4 left-4 flex gap-2">
               <div className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest border border-primary/20 rounded-full backdrop-blur-md">
                  CORE INFOGRAPHIC
               </div>
               <div className="px-3 py-1 bg-slate-900/10 dark:bg-white/10 text-slate-400 text-[8px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 rounded-full backdrop-blur-md">
                  STYLE: {designStyle}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            <div className="text-slate-300 dark:text-slate-700 mb-8">
              <span className="material-symbols-outlined text-[140px] mb-2">dynamic_feed</span>
              <p className="text-3xl font-black uppercase tracking-tighter italic">Engine Idle</p>
              <p className="text-sm font-medium opacity-60 uppercase tracking-widest mt-2">The architecture engine is ready.</p>
              <p className="text-xs font-medium opacity-40 mt-1 italic">Please enter your process requirements in the sidebar to map the visual logic.</p>
            </div>
            
            <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Quick Start</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">New to ADS Studio? Click below to instantly generate a professional supply-chain visualization sample.</p>
              <button 
                onClick={handleTrySample}
                className="w-full py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                Load Sample Architecture
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataEngine;
