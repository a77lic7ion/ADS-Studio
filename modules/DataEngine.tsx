
import React, { useState, useRef } from 'react';
import { gemini } from '../services/geminiService';
import { BlueprintNode } from '../types';

const DataEngine: React.FC = () => {
  const [sourceType, setSourceType] = useState<'url' | 'file' | 'text'>('text');
  const [inputValue, setInputValue] = useState('');
  const [designStyle, setDesignStyle] = useState('Organic Blueprint');
  const [blueprint, setBlueprint] = useState<{ nodes: BlueprintNode[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputValue(`Reference: ${file.name} (Uploaded ${new Date().toLocaleDateString()})`);
    }
  };

  const generateBlueprint = async () => {
    if (!inputValue) return;
    setLoading(true);
    try {
      const data = await gemini.generateBlueprintFromData(inputValue, designStyle);
      if (data) setBlueprint(data);
    } finally {
      setLoading(false);
    }
  };

  const renderConnections = () => {
    if (!blueprint) return null;
    const core = blueprint.nodes.find(n => n.id === 'core' || n.title.toLowerCase().includes('core')) || blueprint.nodes[0];
    
    return blueprint.nodes.filter(n => n.id !== core.id).map((node, i) => {
      const dx = node.x - core.x;
      const dy = node.y - core.y;
      const midX = core.x + dx / 2;
      
      // Creative Connector Logic
      let pathD = `M ${core.x} ${core.y} Q ${midX} ${core.y} ${node.x} ${node.y}`;
      let strokeWidth = "3";
      let strokeDash = "0";
      let connectorColor = node.color;

      if (designStyle === 'Cyber Workflow') {
        pathD = `M ${core.x} ${core.y} L ${node.x} ${core.y} L ${node.x} ${node.y}`;
        strokeWidth = "2";
        strokeDash = "4,2";
      } else if (designStyle === 'Hand-Drawn Schematic') {
        // Add "wiggle" to the path
        const wiggleX = Math.random() * 10 - 5;
        pathD = `M ${core.x} ${core.y} C ${midX + wiggleX} ${core.y + wiggleX}, ${midX - wiggleX} ${node.y - wiggleX}, ${node.x} ${node.y}`;
        strokeWidth = "2";
      }

      return (
        <path
          key={i}
          d={pathD}
          stroke={connectorColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={designStyle === 'Cyber Workflow' ? "opacity-60 animate-pulse" : "opacity-40"}
          style={{ strokeDasharray: strokeDash }}
        />
      );
    });
  };

  const renderNode = (node: BlueprintNode) => {
    const isCore = node.id === 'core' || node.title.toLowerCase().includes('core');

    if (designStyle === 'Cyber Workflow') {
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <rect x="-100" y="-30" width="200" height="60" fill="none" stroke={node.color} strokeWidth="1" opacity="0.5" />
          <rect x="-95" y="-25" width="190" height="50" fill={node.color} opacity="0.1" />
          <text textAnchor="middle" y="5" fill={node.color} className="text-[12px] font-black tracking-widest uppercase">
            {node.title}
          </text>
          <foreignObject x="-110" y="40" width="220" height="250">
            <div className="bg-[#111] border border-slate-800 p-4 font-mono text-[9px] text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="text-slate-500 mb-1">>> SYSTEM_LOG:</div>
              {node.points.map((p, i) => <div key={i} className="mb-1 uppercase tracking-tighter">> {p}</div>)}
            </div>
          </foreignObject>
        </g>
      );
    }

    if (designStyle === 'Hand-Drawn Schematic') {
      return (
        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
          <ellipse cx="0" cy="0" rx="90" ry="35" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="5,2" />
          <text textAnchor="middle" y="5" fill="#1e293b" className="text-[14px] font-medium" style={{ fontFamily: 'cursive' }}>
            {node.title}
          </text>
          <foreignObject x="-100" y="45" width="200" height="200">
            <div className="p-2 text-slate-600" style={{ fontFamily: 'cursive' }}>
              {node.points.map((p, i) => <div key={i} className="text-xs mb-1">- {p}</div>)}
            </div>
          </foreignObject>
        </g>
      );
    }

    // Default: Organic Blueprint
    return (
      <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
        <circle r="70" fill={node.color} opacity="0.1" />
        <rect 
          x="-90" y="-30" width="180" height="60" rx="30" 
          fill={node.color} 
          className="cursor-pointer hover:scale-105 transition-transform shadow-xl"
        />
        <text 
          textAnchor="middle" y="5" 
          fill="#fff" 
          className="text-[12px] font-black uppercase pointer-events-none"
        >
          {node.title}
        </text>
        <foreignObject x="-100" y="45" width="200" height="200">
          <div className="bg-white/90 dark:bg-[#1a1e35]/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
            <ul className="space-y-2">
              {node.points.map((p, i) => (
                <li key={i} className="text-[10px] text-slate-700 dark:text-slate-300 font-medium flex items-start gap-2">
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
      <div className="w-full lg:w-[420px] border-r border-slate-200 dark:border-[#222949] bg-white dark:bg-background-dark p-6 overflow-y-auto z-10">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">hub</span>
          Blueprint Engine
        </h2>
        
        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data Source</label>
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
                placeholder="Paste your notes, project description, or data here..."
                className="w-full rounded-xl p-4 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 min-h-[140px] text-sm focus:ring-2 focus:ring-primary/20"
              />
            )}

            {sourceType === 'url' && (
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full rounded-xl h-12 px-4 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 text-sm"
              />
            )}

            {sourceType === 'file' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
              >
                <span className="material-symbols-outlined text-slate-400">upload_file</span>
                <span className="text-xs font-medium text-slate-500">Upload Reference Document</span>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                {inputValue && <span className="text-[10px] text-primary font-bold">{inputValue}</span>}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aesthetic Direction</label>
            <div className="grid grid-cols-2 gap-2">
              {['Organic Blueprint', 'Cyber Workflow', 'Clean Architecture', 'Hand-Drawn Schematic'].map(style => (
                <button
                  key={style}
                  onClick={() => setDesignStyle(style)}
                  className={`py-2 px-1 text-[9px] font-black uppercase border-2 rounded-xl transition-all ${designStyle === style ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateBlueprint}
            disabled={loading || !inputValue}
            className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
          >
            <span className="material-symbols-outlined text-2xl">{loading ? 'sync' : 'magic_button'}</span>
            {loading ? 'Synthesizing...' : 'Visualize Workflow'}
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto bg-white dark:bg-[#0a0c16] flex items-center justify-center p-8">
        <div className={`absolute inset-0 opacity-[0.05] ${designStyle === 'Cyber Workflow' ? 'bg-[#000]' : ''}`} style={{ backgroundImage: designStyle === 'Hand-Drawn Schematic' ? 'none' : 'radial-gradient(#0d33f2 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
        
        {blueprint ? (
          <div className="relative w-full max-w-[1000px] aspect-square lg:aspect-video animate-in fade-in zoom-in duration-700">
            <svg viewBox="0 0 1000 1000" className="w-full h-full drop-shadow-2xl">
              <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="10" />
                  <feOffset dx="0" dy="5" result="offsetblur" />
                  <feComponentTransfer><feFuncA type="linear" slope="0.2" /></feComponentTransfer>
                  <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              
              {renderConnections()}
              {blueprint.nodes.map(node => renderNode(node))}
            </svg>
            <div className="absolute bottom-4 right-4 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
              Style: {designStyle} • Ref: {new Date().toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
            <span className="material-symbols-outlined text-[120px] mb-6 animate-pulse">schema</span>
            <p className="text-2xl font-black uppercase tracking-tighter">Blueprint Canvas Ready</p>
            <p className="text-sm font-medium opacity-60">Input data to map process architecture</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataEngine;
