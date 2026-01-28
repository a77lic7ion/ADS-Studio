
import React, { useState } from 'react';
import { BrandIdentity } from '../types';

interface Props {
  onComplete: (identity: BrandIdentity) => void;
}

const Landing: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [identity, setIdentity] = useState<BrandIdentity>({
    name: '',
    industry: '',
    address: '',
    contact: '',
    colors: 'Midnight Blue, Electric White',
    products: []
  });

  const productOptions = [
    { id: 'logos', label: 'Identity & Logos', icon: 'token' },
    { id: 'flyers', label: 'Marketing Flyers', icon: 'description' },
    { id: 'cards', label: 'Business Cards', icon: 'badge' },
    { id: 'infographics', label: 'Process Blueprints', icon: 'hub' },
    { id: 'website', label: 'Web Hero Sections', icon: 'web' }
  ];

  const handleProductToggle = (id: string) => {
    const products = identity.products.includes(id) 
      ? identity.products.filter(p => p !== id)
      : [...identity.products, id];
    setIdentity({ ...identity, products });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="h-full w-full bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-4xl w-full z-10">
        {step === 1 && (
          <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="size-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12">
               <span className="material-symbols-outlined text-white text-5xl">auto_awesome</span>
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl font-black tracking-tighter italic uppercase">ADS Studio</h1>
              <p className="text-xl text-slate-400 font-medium max-w-xl mx-auto">The world's most advanced AI engine for unified brand identity and marketing synthesis.</p>
            </div>
            <button 
              onClick={nextStep}
              className="px-12 py-5 bg-primary text-white font-black uppercase tracking-widest text-lg rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              Initialize New Brand
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-surface-dark border border-border-dark p-12 rounded-[3rem] shadow-3xl space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Suite Selection</h2>
              <p className="text-slate-500 text-sm font-medium">Select the assets your brand requires for this campaign.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {productOptions.map(opt => (
                <div 
                  key={opt.id}
                  onClick={() => handleProductToggle(opt.id)}
                  className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4 ${identity.products.includes(opt.id) ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10' : 'border-border-dark hover:border-slate-600'}`}
                >
                  <span className={`material-symbols-outlined text-3xl ${identity.products.includes(opt.id) ? 'text-primary' : 'text-slate-500'}`}>{opt.icon}</span>
                  <span className="text-xs font-black uppercase tracking-widest">{opt.label}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={prevStep} className="px-8 py-3 text-slate-500 font-black uppercase text-xs">Back</button>
              <button 
                onClick={nextStep} 
                disabled={identity.products.length === 0}
                className="px-12 py-4 bg-white text-black font-black uppercase text-xs rounded-2xl disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-surface-dark border border-border-dark p-12 rounded-[3rem] shadow-3xl space-y-10 animate-in fade-in zoom-in duration-500">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Core Identity</h2>
              <p className="text-slate-500 text-sm font-medium">Provide the foundational details for consistent synthesis across all modules.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Name</label>
                  <input 
                    className="w-full h-14 bg-background-dark border border-border-dark rounded-2xl px-6 font-bold"
                    value={identity.name}
                    onChange={e => setIdentity({...identity, name: e.target.value})}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Industry Context</label>
                  <input 
                    className="w-full h-14 bg-background-dark border border-border-dark rounded-2xl px-6 font-bold"
                    value={identity.industry}
                    onChange={e => setIdentity({...identity, industry: e.target.value})}
                    placeholder="FinTech, E-commerce, etc."
                  />
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Brand Palette</label>
                  <input 
                    className="w-full h-14 bg-background-dark border border-border-dark rounded-2xl px-6 font-bold"
                    value={identity.colors}
                    onChange={e => setIdentity({...identity, colors: e.target.value})}
                    placeholder="Deep Sea Blue, Gold Accent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Contact & Address</label>
                  <input 
                    className="w-full h-14 bg-background-dark border border-border-dark rounded-2xl px-6 font-bold"
                    value={identity.address}
                    onChange={e => setIdentity({...identity, address: e.target.value})}
                    placeholder="123 Innovation Way, NY"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={prevStep} className="px-8 py-3 text-slate-500 font-black uppercase text-xs">Back</button>
              <button 
                onClick={() => onComplete(identity)}
                disabled={!identity.name || !identity.industry}
                className="px-14 py-5 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-full shadow-2xl shadow-primary/30"
              >
                Launch Unified Suite
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
