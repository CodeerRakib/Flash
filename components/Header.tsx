import React from 'react';
import { SystemStatus } from '../types';

interface HeaderProps {
  status: SystemStatus;
  activeTab: string;
  setActiveTab: (t: string) => void;
}

const Header: React.FC<HeaderProps> = ({ status, activeTab, setActiveTab }) => {
  // Synchronized tabs with App.tsx conditional rendering logic
  const tabs = ['DASHBOARD', 'VISION', 'METRICS', 'PYTHON', 'LOG'];
  
  return (
    <header className="flex items-center justify-between px-2 h-12 bg-black/40 border-b border-white/10 shrink-0 z-50">
      <div className="flex items-center h-full">
        <div className="flex items-center space-x-0 h-full overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`h-full px-5 text-[10px] font-bold tracking-widest transition-all whitespace-nowrap border-b-2 flex items-center ${
                activeTab === tab 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500' 
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-6 pr-4">
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${status === SystemStatus.ONLINE ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
          <span className={`text-[10px] font-bold tracking-widest uppercase ${status === SystemStatus.ONLINE ? 'text-emerald-500' : 'text-amber-500'}`}>{status}</span>
        </div>
        
        <div className="hidden lg:flex items-center space-x-4 text-zinc-500 font-mono text-[9px]">
          <span className="tracking-widest flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            FLASH_CORE
          </span>
          <span className="tracking-widest flex items-center gap-2">
             <svg className="w-3.5 h-3.5 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
             SYNC_ACTIVE
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;