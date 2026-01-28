
import React, { useState } from 'react';

interface Endpoint {
  id: string;
  name: string;
  url: string;
  status: 'Active' | 'Idle' | 'Connected';
  latency: string;
  usage: string;
}

const Settings: React.FC = () => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([
    { id: '1', name: 'OpenAI GPT-4', url: 'api.openai.com/v1/chat/completions', status: 'Active', latency: '420ms', usage: '2.4k' },
    { id: '2', name: 'Gemini Flash Image', url: 'gemini-2.5-flash-image', status: 'Connected', latency: 'Local', usage: 'GPU: Native' }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({ name: '', url: '' });

  const addEndpoint = () => {
    if (!newEndpoint.name || !newEndpoint.url) return;
    const added: Endpoint = {
      id: Date.now().toString(),
      name: newEndpoint.name,
      url: newEndpoint.url,
      status: 'Idle',
      latency: '--',
      usage: '0'
    };
    setEndpoints([...endpoints, added]);
    setShowAddModal(false);
    setNewEndpoint({ name: '', url: '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 overflow-y-auto h-full w-full relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">AI Configuration</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl">Manage your LLM and Image Generation endpoints to power your design workflows.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Endpoint
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-12">
        <div className="xl:col-span-2 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">psychology</span>
                Active Service Stack
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {endpoints.map(ep => (
                <EndpointCard key={ep.id} {...ep} />
              ))}
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-4xl text-primary">api</span>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black text-primary mb-1 uppercase italic tracking-tighter">Unified Proxy Layer</h4>
              <p className="text-sm text-slate-600 dark:text-text-muted">Route all your generation requests through a single secure gateway with automated failover and caching.</p>
            </div>
            <button className="px-6 py-2 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">Enable Proxy</button>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">tune</span>
                Generation Defaults
              </h3>
            </div>
            <div className="p-5 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Creativity</label>
                  <span className="text-xs font-mono text-primary font-bold">High</span>
                </div>
                <input className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" type="range" defaultValue="80" />
              </div>
              <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-background-dark border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-black uppercase italic tracking-tighter">New Service Endpoint</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Service Name</label>
                <input 
                  autoFocus
                  className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl h-12 px-4 text-sm"
                  placeholder="e.g. Mistral AI, Custom Model"
                  value={newEndpoint.name}
                  onChange={e => setNewEndpoint({...newEndpoint, name: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Endpoint URL</label>
                <input 
                  className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-xl h-12 px-4 text-sm font-mono"
                  placeholder="https://api.example.com/v1"
                  value={newEndpoint.url}
                  onChange={e => setNewEndpoint({...newEndpoint, url: e.target.value})}
                />
              </div>
              <button 
                onClick={addEndpoint}
                className="w-full bg-primary text-white h-12 rounded-xl font-black uppercase tracking-widest text-xs mt-4 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                Connect Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EndpointCard: React.FC<Endpoint> = ({ name, url, status, latency, usage }) => (
  <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-primary/50 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">hub</span>
        </div>
        <div>
          <h4 className="text-sm font-bold">{name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' || status === 'Connected' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            <span className={`text-[10px] font-bold uppercase tracking-tight ${status === 'Active' || status === 'Connected' ? 'text-emerald-500' : 'text-slate-400'}`}>{status}</span>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg mb-4">
      <p className="text-[11px] font-mono text-slate-500 truncate">{url}</p>
    </div>
    <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 uppercase">
      <span>Latency: {latency}</span>
      <span>{usage} req/mo</span>
    </div>
  </div>
);

export default Settings;
