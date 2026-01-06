
import React from 'react';
import { ProcessInfo } from '../types';

interface SystemMetricsProps {
  cpu: number;
  ram: number;
  processes: ProcessInfo[];
}

const SystemMetrics: React.FC<SystemMetricsProps> = ({ cpu, ram, processes }) => {
  return (
    <div className="glass-panel rounded-lg flex flex-col flex-1 min-h-[300px] overflow-hidden">
      <div className="h-8 flex items-center justify-between px-3 border-b border-white/5 bg-black/40">
        <div className="flex items-center space-x-2">
           <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
           <span className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">System Metrics</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Online</span>
        </div>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3 bg-black/20 border-b border-white/5">
        <div className="bg-zinc-900/40 p-3 rounded border border-white/5 flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1 z-10">
             <div className="flex items-center gap-1.5">
               <svg className="w-3.5 h-3.5 text-cyan-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">CPU LOAD</span>
             </div>
          </div>
          <div className="flex items-end justify-between z-10 mt-1">
             <span className="text-2xl font-black text-white leading-none">{cpu.toFixed(1)}%</span>
             <span className="text-[8px] text-zinc-600 font-mono uppercase">0.5%</span>
          </div>
          <div className="mt-2 h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-cyan-500" style={{ width: `${cpu}%` }} />
          </div>
        </div>
        
        <div className="bg-zinc-900/40 p-3 rounded border border-white/5 flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1 z-10">
             <div className="flex items-center gap-1.5">
               <svg className="w-3.5 h-3.5 text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 2a10 10 0 1010 10H12V2z" /><path d="M12 2a10 10 0 0110 10h-2a8 8 0 00-8-8V2z" /></svg>
               <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">RAM USAGE</span>
             </div>
          </div>
          <div className="flex items-end justify-between z-10 mt-1">
             <span className="text-2xl font-black text-white leading-none">{ram.toFixed(0)}%</span>
             <span className="text-[8px] text-zinc-600 font-mono uppercase">2.7 GB</span>
          </div>
          <div className="mt-2 h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
             <div className="h-full bg-purple-500" style={{ width: `${ram}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-3 overflow-hidden bg-black/30">
        <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/5">
          <span className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase">TOP PROCESSES</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
          <div className="grid grid-cols-12 text-[7px] font-bold text-zinc-600 uppercase mb-1">
            <div className="col-span-8">APP NAME</div>
            <div className="col-span-2 text-right">CPU</div>
            <div className="col-span-2 text-right">MEM</div>
          </div>
          {processes.map((p, i) => (
            <div key={i} className="grid grid-cols-12 items-center text-[9px] font-mono py-0.5">
              <div className="col-span-8 text-zinc-400 truncate tracking-tight">{p.name}</div>
              <div className="col-span-2 text-right text-cyan-400/90">{p.cpu.toFixed(1)}%</div>
              <div className="col-span-2 text-right text-zinc-500">{p.mem.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemMetrics;
