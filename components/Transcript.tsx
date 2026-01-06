
import React, { useEffect, useRef } from 'react';
import { TranscriptEntry } from '../types';

export default function Transcript({ entries }: { entries: TranscriptEntry[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [entries]);

  return (
    <div className="glass-panel h-full flex flex-col overflow-hidden border-cyan-500/10">
      <div className="h-12 flex items-center justify-between px-4 widget-header shrink-0">
        <span className="text-zinc-200">Conversation</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-black/40 border border-white/10 rounded-md text-[9px] font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> 
            Clear
          </button>
          <button className="px-3 py-1 bg-black/40 border border-white/10 rounded-md text-[9px] font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> 
            Extract Conversation
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-black/20">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-[#0b141a]/80 border border-cyan-900/30 p-6 rounded-2xl max-w-[90%] shadow-2xl">
              <p className="text-[12px] text-cyan-50/80 leading-relaxed font-medium">
                Hello, I am FLASH. FLASH backend is online. Some features may be limited. How can I assist you today sir?
              </p>
              <div className="text-[8px] text-zinc-600 mt-3 text-right font-mono">2:44 PM</div>
            </div>
          </div>
        ) : (
          entries.map((e, idx) => (
            <div key={idx} className={`flex flex-col ${e.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-[12px] leading-relaxed shadow-lg ${
                e.role === 'user' 
                ? 'bg-[#1c1f21] text-zinc-100 rounded-tr-none' 
                : 'bg-[#0b141a] border border-cyan-900/40 text-cyan-50/90 rounded-tl-none'
              }`}>
                {e.text}
                <div className="text-[7px] text-zinc-600 mt-2.5 font-mono uppercase tracking-widest">
                  {e.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-black/40">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="w-full bg-[#0a0d0f] border border-white/5 rounded-lg pl-5 pr-12 py-3.5 text-[12px] text-zinc-300 outline-none focus:border-cyan-500/30 transition-all placeholder:text-zinc-700 shadow-inner" 
          />
          <button className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-cyan-600/10 text-cyan-400 rounded-md border border-cyan-500/20 hover:bg-cyan-600/20 transition-all shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
