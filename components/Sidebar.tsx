
import React, { useState, useEffect } from 'react';
import { ModuleType, Project } from '../types';

interface SidebarProps {
  activeTab: ModuleType;
  onProjectSelect?: (project: Project) => void;
  currentProjectData?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onProjectSelect, currentProjectData }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ads_studio_projects');
    if (saved) {
      setProjects(JSON.parse(saved));
    }
  }, []);

  const saveProject = () => {
    const timestamp = new Date().toLocaleString();
    const defaultName = `Untitled ${activeTab} - ${timestamp}`;
    const projectName = window.prompt("Enter a name for your project:", defaultName);
    
    if (projectName === null) return;

    const finalName = projectName.trim() || defaultName;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: finalName,
      type: activeTab,
      updatedAt: timestamp,
      icon: activeTab === ModuleType.LOGOS ? 'draw' : activeTab === ModuleType.INFOGRAPHICS ? 'account_tree' : 'description',
      data: currentProjectData || {}
    };

    const updated = [newProject, ...projects].slice(0, 10);
    setProjects(updated);
    localStorage.setItem('ads_studio_projects', JSON.stringify(updated));
  };

  const deleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('ads_studio_projects', JSON.stringify(updated));
  };

  return (
    <>
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 size-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center"
      >
        <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
      </button>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform bg-background-light dark:bg-background-dark border-r border-slate-200 dark:border-[#222949] p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="flex flex-col">
            <h1 className="text-slate-900 dark:text-white text-base font-semibold">
              {activeTab === ModuleType.SETTINGS ? 'Configuration' : 'Workspace'}
            </h1>
            <p className="text-slate-500 dark:text-[#909acb] text-xs">ADS Studio v1.2</p>
          </div>

          <button 
            onClick={saveProject}
            title="Save your current configuration to local storage"
            className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all font-bold text-sm transform active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            Save Design
          </button>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-[60vh] pr-2">
            <p className="px-3 pb-2 text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-600">Archived History</p>
            {projects.length === 0 ? (
              <p className="px-3 py-4 text-xs text-slate-400 italic font-medium">No saved snapshots</p>
            ) : (
              projects.map((project) => (
                <div 
                  key={project.id} 
                  onClick={() => onProjectSelect?.(project)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#222949]/50 cursor-pointer transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="size-9 rounded-lg bg-slate-200 dark:bg-[#181d34] flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-700 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">{project.icon}</span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-slate-900 dark:text-white text-[13px] font-bold truncate tracking-tight">{project.name}</p>
                    <p className="text-slate-500 dark:text-[#909acb] text-[9px] font-medium">{project.updatedAt}</p>
                  </div>
                  <button 
                    onClick={(e) => deleteProject(e, project.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-200 dark:border-[#222949]">
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em]">Cache Capacity</p>
              <p className="text-[9px] text-primary/60 font-bold">{projects.length}/10</p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-[#222949] h-1.5 rounded-full mb-1">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500" 
                style={{ width: `${(projects.length / 10) * 100}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-slate-500 font-medium">Local Snapshots Active</p>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
