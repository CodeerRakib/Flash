import React, { useState, useEffect } from 'react';
import { SystemStatus } from '../types';

export default function Header({ status }: { status: SystemStatus }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <header className="grid grid-cols-3 items-center shrink-0 h-10 px-4">
      <div className="flex items-center gap-4">
        <span className="text-xl font-hud font-black text-cyan-400 tracking-widest">F.L.A.S.H</span>
        <div className="status-badge uppercase">{status}</div>
      </div>

      <div className="flex justify-center">
        <div className="bg-black/40 border border-white/5 px-4 py-1 rounded flex items-center gap-4 font-hud text-[11px] font-bold text-zinc-400">
          <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-zinc-200">{time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <div className="w-px h-3 bg-zinc-800" />
          <span className="text-zinc-500">{time.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex justify-end items-center gap-6">
        <div className="flex items-center gap-2 text-zinc-400 font-hud text-[11px] font-bold">
           <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
           <span>25.2°C <span className="text-zinc-600 font-normal ml-1">Quezon City</span></span>
        </div>
        <button className="text-zinc-600 hover:text-cyan-400 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>
    </header>
  );
}