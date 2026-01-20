
import React, { useState, useEffect } from 'react';
import { SystemStatus } from '../types';

export default function Header({ status }: { status: SystemStatus }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <header className="flex items-center justify-between shrink-0 h-12 px-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-900 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
           <span className="text-white font-hud text-xs font-black">S</span>
        </div>
        <span className="text-lg font-hud font-black text-white tracking-[0.2em]">SHREE</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex bg-black/40 border border-white/5 px-3 py-1 rounded-md items-center gap-2 font-hud text-[10px] font-bold text-zinc-400">
          <span className="text-zinc-200">{time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className={`status-badge uppercase !text-[8px] !px-2 ${status === SystemStatus.ONLINE ? '!bg-emerald-500/10 !text-emerald-500' : status === SystemStatus.PROCESSING ? '!bg-yellow-500/10 !text-yellow-500' : '!bg-red-500/10 !text-red-500'}`}>
          {status}
        </div>
      </div>
    </header>
  );
}
