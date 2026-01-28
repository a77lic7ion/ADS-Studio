
import React, { useState, useEffect } from 'react';

interface Endpoint {
  id: string;
  name: string;
  url: string;
  status: 'Active' | 'Idle' | 'Connected';
  latency: string;
  usage: string;
}

interface GeneratedAsset {
  id: number;
  type: string;
  data: string;
  timestamp: string;
}

interface Props {
  onResetBrand?: () => void;
}

const Settings: React.FC<Props> = ({ onResetBrand }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { id: '1', name: 'OpenAI GPT-4', url: 'api.openai.com/v1/chat/completions', status: 'Active', latency: '420ms', usage: '2.4k' },
    { id: '2', name: 'Gemini Flash Image', url: 'gemini-2.5-flash-image', status: 'Connected', latency: 'Local', usage: 'GPU: Native' }
  ]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({ name: '', url: '' });

  useEffect(() => {
    const savedAssets = JSON.parse(localStorage.getItem('ads_studio_assets') || '[]');
    setAssets(savedAssets);
  }, []);

  const handleAddEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.url) {
      alert("Please enter both a name and an endpoint URL.");
      return;
    }
    const added: Endpoint = {
      id: Math.random().toString(36).substr(2, 9),
      name: newEndpoint.name,
      url: newEndpoint.url,
      status: 'Idle',
      latency: '--',
      usage: '0'
    };
    setEndpoints(prev => [...prev, added]);
    setShowAddModal(false);
    setNewEndpoint({ name: '', url: '' });
  };

  const handleDownloadAsset = (asset: GeneratedAsset) => {
    const link = document.createElement('a');
    link.href = asset.data;
    link.download = `ads-studio-${asset.type.toLowerCase()}-${asset.id}.png`;
    link.click();
  };

  const clearAssets = () => {
    if (window.confirm("Clear all generation history?")) {
      localStorage.removeItem('ads_studio_assets');
      setAssets([]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 overflow-y-auto h-full w-full relative bg-slate-50 dark:bg-[#0a0c16]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Control Tower</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl">Configure AI stack and manage synthesized asset registry.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={onResetBrand} className="px-5 py-2.5 rounded-lg text-sm font-black uppercase text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all">Reset Brand</button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg"
           >
             <span className="material-symbols-outlined text-sm">add</span>
             Register Node
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 pb-12">
        <div className="xl:col-span-2 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter italic">
                <span className="material-symbols-outlined text-primary">psychology</span>
                Infrastructure
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {endpoints.map(ep => (
                <div key={ep.id} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] hover:border-primary transition-all group shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 transition-colors group-hover:bg-primary group-hover:text-white">
                        <span className="material-symbols-outlined text-3xl">hub</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase tracking-tight italic">{ep.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2.5 h-2.5 rounded-full ${ep.status === 'Active' || ep.status === 'Connected' ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-slate-500'}`}></span>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${ep.status === 'Active' || ep.status === 'Connected' ? 'text-emerald-500' : 'text-slate-400'}`}>{ep.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl mb-6 border border-slate-100 dark:border-slate-800 group-hover:border-primary/20 transition-colors">
                    <p className="text-[11px] font-mono text-slate-500 truncate">{ep.url}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black flex items-center gap-2 uppercase tracking-tighter italic">
                <span className="material-symbols-outlined text-primary">collections</span>
                Asset Registry
              </h3>
              {assets.length > 0 && (
                <button onClick={clearAssets} className="text-[10px] font-black uppercase text-red-500 hover:underline">Purge All</button>
              )}
            </div>
            
            {assets.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">image_not_supported</span>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Synthesized Content</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {assets.map(asset => (
                  <div key={asset.id} className="group relative aspect-square bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={asset.data} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Asset" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2 text-center">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{asset.type}</p>
                      <button 
                        onClick={() => handleDownloadAsset(asset)}
                        className="size-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl p-8 space-y-8">
             <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-widest italic border-b border-border-dark pb-4">
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
                Engine Params
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inference Temp</label>
                  <span className="text-[10px] font-mono text-primary font-bold">0.85</span>
                </div>
                <input className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary" type="range" defaultValue="85" />
              </div>
              <button className="w-full bg-primary text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all">
                Update Core Config
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
