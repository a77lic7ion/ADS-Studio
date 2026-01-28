
import React, { useState } from 'react';
import { gemini } from '../services/geminiService';

interface BlueprintNode {
  id: string;
  title: string;
  color: string;
  x: number;
  y: number;
  points: string[];
}

const DataEngine: React.FC = () => {
  const [topic, setTopic] = useState('AI Development Workflow');
  const [blueprint, setBlueprint] = useState<{ nodes: BlueprintNode[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const generateBlueprint = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const data = await gemini.generateBlueprint(topic);
      if (data) setBlueprint(data);
    } finally {
      setLoading(false);
    }
  };

  const renderConnections = () => {
    if (!blueprint) return null;
    const core = blueprint.nodes.find(n => n.id === 'core' || n.title.toLowerCase().includes('core'));
    if (!core) return null;

    return blueprint.nodes.filter(n => n !== core).map((node, i) => {
      const dx = node.x - core.x;
      const dy = node.y - core.y;
      const midX = core.x + dx / 2;
      const midY = core.y + dy / 2;
      
      return (
        <path
          key={i}
          d={`M ${core.x} ${core.y} Q ${midX} ${core.y} ${node.x} ${node.y}`}
          stroke={node.color}
          strokeWidth="3"
          fill="none"
          strokeDasharray="5,5"
          className="opacity-40"
        />
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#f0f2f5] dark:bg-[#0a0c16]">
      <div className="w-full lg:w-[400px] border-r border-slate-200 dark:border-[#222949] bg-white dark:bg-background-dark p-6 overflow-y-auto z-10">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">account_tree</span>
          Blueprint Engine
        </h2>
        
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400">Process Idea</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-xl p-4 bg-slate-50 dark:bg-[#1a1e35] border-slate-200 dark:border-slate-700 min-h-[120px] text-sm"
              placeholder="e.g., How to build a SaaS application or The perfect coffee brewing process..."
            />
          </div>

          <button
            onClick={generateBlueprint}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">{loading ? 'sync' : 'auto_fix_high'}</span>
            {loading ? 'Analyzing Workflow...' : 'Generate Blueprint'}
          </button>

          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-xs text-primary leading-relaxed">
            <strong>Pro Tip:</strong> Describe the stages of your workflow to help Gemini categorize the technical requirements and UI components.
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#0a0c16] flex items-center justify-center">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]" 
          style={{ backgroundImage: 'radial-gradient(#0d33f2 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

        <div className="relative w-full h-full max-w-[1000px] max-h-[800px] p-8 overflow-auto scale-75 lg:scale-100">
          {blueprint ? (
            <svg viewBox="0 0 1000 1000" className="w-full h-full min-w-[800px] min-h-[600px]">
              {renderConnections()}
              {blueprint.nodes.map((node) => (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  {/* Outer Glow */}
                  <circle r="60" fill={node.color} opacity="0.1" />
                  {/* Main Bubble */}
                  <rect 
                    x="-80" y="-30" width="160" height="60" rx="30" 
                    fill={node.color} className="shadow-lg" 
                  />
                  <text 
                    textAnchor="middle" y="5" 
                    fill="#fff" className="text-[14px] font-bold pointer-events-none"
                  >
                    {node.title}
                  </text>
                  
                  {/* Points Box */}
                  <foreignObject x="-80" y="40" width="180" height="200">
                    <div className="bg-white dark:bg-[#1a1e35] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl">
                      <ul className="space-y-1">
                        {node.points.map((p, i) => (
                          <li key={i} className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <span className="size-1 rounded-full bg-primary shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </foreignObject>
                </g>
              ))}
            </svg>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4">schema</span>
              <p className="text-lg font-medium">Generate a blueprint to see the workflow</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataEngine;
