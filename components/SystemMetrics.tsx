import React from 'react';

export default function SystemMetrics({ cpu, ram }: { cpu: number; ram: number }) {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
          <span>System Stats</span>
        </div>
        <button className="text-zinc-600">↺</button>
      </div>
      <div className="p-3 space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>CPU Usage</span>
            <span>{cpu.toFixed(0)}%</span>
          </div>
          <div className="h-1 bg-zinc-900 border border-white/5 p-[1px]"><div className="h-full bg-cyan-500 shadow-[0_0_5px_#22d3ee]" style={{ width: `${cpu}%` }} /></div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>RAM Usage</span>
            <span>{ram}GB</span>
          </div>
          <div className="h-1 bg-zinc-900 border border-white/5 p-[1px]"><div className="h-full bg-cyan-500 shadow-[0_0_5px_#22d3ee]" style={{ width: `${(ram / 16) * 100}%` }} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="bg-black/30 p-2 text-center border border-white/5">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">CPU</div>
            <div className="text-[10px] font-hud text-white">{cpu.toFixed(0)}%</div>
          </div>
          <div className="bg-black/30 p-2 text-center border border-white/5">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Memory</div>
            <div className="text-[10px] font-hud text-white">44%</div>
          </div>
          <div className="bg-black/30 p-2 text-center border border-white/5">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Disk</div>
            <div className="text-[9px] font-hud text-white">439/475 GB</div>
          </div>
        </div>
      </div>
    </div>
  );
}