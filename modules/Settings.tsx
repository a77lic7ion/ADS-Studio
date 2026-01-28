
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8 overflow-y-auto h-full w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">AI Configuration</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl">Manage your LLM and Image Generation endpoints to power your design workflows.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20">
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
                Logic LLM
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2 Configured</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EndpointCard name="OpenAI GPT-4" url="api.openai.com/v1/chat/completions" status="Active" latency="420ms" usage="2.4k" />
              <EndpointCard name="Anthropic Claude" url="api.anthropic.com/v1/messages" status="Idle" latency="--" usage="0" />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">palette</span>
                Image Generation
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1 Configured</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EndpointCard name="Gemini Flash Image" url="gemini-2.5-flash-image" status="Connected" latency="Local" usage="GPU: RTX 4090" />
              <button className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">add_circle</span>
                <span className="text-sm font-bold uppercase tracking-wider">Add Provider</span>
              </button>
            </div>
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Temperature</label>
                  <span className="text-xs font-mono text-primary font-bold">0.7</span>
                </div>
                <input className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" type="range" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Default Resolution</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary">
                  <option>1024 x 1024 (1:1)</option>
                  <option>1920 x 1080 (16:9)</option>
                </select>
              </div>
              <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity">
                Save Preferences
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-xl">health_and_safety</span>
              System Maintenance
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Cache Usage</span>
                <span className="font-bold">1.2 GB</span>
              </div>
              <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-primary"></div>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 rounded-lg text-xs font-bold uppercase tracking-wider">
              Clear Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EndpointCard: React.FC<{ name: string; url: string; status: string; latency: string; usage: string }> = ({ name, url, status, latency, usage }) => (
  <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-primary/50 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">hub</span>
        </div>
        <div>
          <h4 className="text-sm font-bold">{name}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* Fix: Added missing className property to ensure correct JSX syntax */}
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
