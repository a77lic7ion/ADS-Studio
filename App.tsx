
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import MarkEngine from './modules/MarkEngine';
import DataEngine from './modules/DataEngine';
import PromoEngine from './modules/PromoEngine';
import Settings from './modules/Settings';
import Landing from './modules/Landing';
import { ModuleType, Project, BrandIdentity } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModuleType>(ModuleType.LANDING);
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);
  const [currentProjectData, setCurrentProjectData] = useState<any>(null);

  useEffect(() => {
    const savedBrand = localStorage.getItem('ads_studio_brand');
    if (savedBrand) {
      setBrandIdentity(JSON.parse(savedBrand));
      setActiveTab(ModuleType.LOGOS);
    }
  }, []);

  const handleStartBrand = (identity: BrandIdentity) => {
    setBrandIdentity(identity);
    localStorage.setItem('ads_studio_brand', JSON.stringify(identity));
    setActiveTab(ModuleType.LOGOS);
  };

  const handleProjectSelect = (project: Project) => {
    setActiveTab(project.type);
    setCurrentProjectData(project.data);
  };

  const handleDataChange = (data: any) => {
    setCurrentProjectData(data);
  };

  const resetBrand = () => {
    if (window.confirm("This will reset your global brand settings. Continue?")) {
      localStorage.removeItem('ads_studio_brand');
      setBrandIdentity(null);
      setActiveTab(ModuleType.LANDING);
    }
  };

  const renderContent = () => {
    if (activeTab === ModuleType.LANDING) {
      return <Landing onComplete={handleStartBrand} />;
    }

    switch (activeTab) {
      case ModuleType.LOGOS:
        return <MarkEngine brandIdentity={brandIdentity} initialData={currentProjectData} onDataChange={handleDataChange} />;
      case ModuleType.INFOGRAPHICS:
        return <DataEngine brandIdentity={brandIdentity} initialData={currentProjectData} onDataChange={handleDataChange} />;
      case ModuleType.FLYERS:
        return <PromoEngine brandIdentity={brandIdentity} initialData={currentProjectData} onDataChange={handleDataChange} />;
      case ModuleType.SETTINGS:
        return <Settings onResetBrand={resetBrand} />;
      default:
        return <MarkEngine brandIdentity={brandIdentity} initialData={currentProjectData} onDataChange={handleDataChange} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {activeTab !== ModuleType.LANDING && (
        <TopNav activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentProjectData(null); 
        }} />
      )}
      <div className="flex flex-1 overflow-hidden">
        {activeTab !== ModuleType.LANDING && (
          <Sidebar 
            activeTab={activeTab} 
            onProjectSelect={handleProjectSelect}
            currentProjectData={currentProjectData} 
          />
        )}
        <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-[#0a0c16]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
