import React from 'react';

export default function UptimeWidget({ uptime }: { uptime: number }) {
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  return (
    <div className="glass-panel overflow-hidden flex-1">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>System Uptime</span>
        </div>
        <span className="text-[8px] text-zinc-600 font-mono tracking-tighter">00:07:12 [ ]</span>
      </div>
      <div className="p-3 space-y-3">
        <div className="flex justify-between items-end border-b border-white/5 pb-2">
          <span className="text-[9px] text-zinc-500 font-bold uppercase">System Running For:</span>
          <span className="text-sm font-hud text-white">{formatTime(uptime)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 p-2 border border-white/5 text-center">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Session</div>
            <div className="text-sm font-hud text-cyan-500">1</div>
          </div>
          <div className="bg-black/30 p-2 border border-white/5 text-center">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Commands</div>
            <div className="text-sm font-hud text-cyan-500">6</div>
          </div>
        </div>
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[8px] font-bold text-zinc-500 uppercase">
            <span>System Load</span>
            <span className="text-cyan-500">Moderate</span>
            <span>25%</span>
          </div>
          <div className="h-1 bg-zinc-900"><div className="h-full bg-cyan-500" style={{ width: '25%' }} /></div>
        </div>
      </div>
    </div>
  );
}