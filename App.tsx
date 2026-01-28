
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import MarkEngine from './modules/MarkEngine';
import DataEngine from './modules/DataEngine';
import PromoEngine from './modules/PromoEngine';
import Settings from './modules/Settings';
import { ModuleType, Project } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModuleType>(ModuleType.LOGOS);
  const [currentProjectData, setCurrentProjectData] = useState<any>(null);

  const handleProjectSelect = (project: Project) => {
    setActiveTab(project.type);
    setCurrentProjectData(project.data);
  };

  const handleDataChange = (data: any) => {
    setCurrentProjectData(data);
  };

  const renderContent = () => {
    switch (activeTab) {
      case ModuleType.LOGOS:
        return <MarkEngine initialData={currentProjectData} onDataChange={handleDataChange} />;
      case ModuleType.INFOGRAPHICS:
        return <DataEngine initialData={currentProjectData} onDataChange={handleDataChange} />;
      case ModuleType.FLYERS:
        return <PromoEngine initialData={currentProjectData} onDataChange={handleDataChange} />;
      case ModuleType.SETTINGS:
        return <Settings />;
      default:
        return <MarkEngine initialData={currentProjectData} onDataChange={handleDataChange} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        setCurrentProjectData(null); // Reset when switching manually to new tab
      }} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          onProjectSelect={handleProjectSelect}
          currentProjectData={currentProjectData} 
        />
        <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-[#0a0c16]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
