
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import MarkEngine from './modules/MarkEngine';
import DataEngine from './modules/DataEngine';
import PromoEngine from './modules/PromoEngine';
import Settings from './modules/Settings';
import { ModuleType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModuleType>(ModuleType.LOGOS);

  const renderContent = () => {
    switch (activeTab) {
      case ModuleType.LOGOS:
        return <MarkEngine />;
      case ModuleType.INFOGRAPHICS:
        return <DataEngine />;
      case ModuleType.FLYERS:
        return <PromoEngine />;
      case ModuleType.SETTINGS:
        return <Settings />;
      default:
        return <MarkEngine />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} />
        <main className="flex-1 flex flex-col overflow-hidden bg-background-light dark:bg-[#0a0c16]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
