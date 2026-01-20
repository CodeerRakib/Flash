
import React, { useEffect, useRef, useState } from 'react';
import { TranscriptEntry } from '../types';

interface TranscriptProps {
  entries: TranscriptEntry[];
  onSend?: (text: string) => void;
}

export default function Transcript({ entries, onSend }: TranscriptProps) {
  const [inputValue, setInputValue] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSend) {
      onSend(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="glass-panel h-full flex flex-col overflow-hidden !rounded-2xl !clip-none border-white/5 bg-[#02080c]/60">
      <div className="h-10 flex items-center justify-between px-5 widget-header shrink-0 !bg-transparent border-none">
        <div className="flex items-center gap-3">
          <span className="font-hud tracking-widest text-[9px] uppercase text-zinc-500">Secure Neural Stream</span>
        </div>
        <div className="flex gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/20" />
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" />
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {entries.map((e, idx) => (
          <div key={idx} className={`flex flex-col ${e.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`group relative max-w-[85%] px-4 py-2.5 rounded-2xl transition-all ${
              e.role === 'user' 
              ? 'bg-zinc-800/40 border border-white/5 text-zinc-300 rounded-tr-none' 
              : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50 rounded-tl-none'
            }`}>
              <div className={`text-[7px] mb-1 font-mono font-bold uppercase tracking-widest ${e.role === 'user' ? 'text-zinc-600 text-right' : 'text-cyan-600'}`}>
                {e.role === 'user' ? 'LOCAL USER' : 'SHREE CORE'}
              </div>
              
              <p className="text-[12px] leading-relaxed tracking-wide font-sans font-medium whitespace-pre-wrap">
                {e.text}
              </p>

              {e.links && e.links.length > 0 && (
                <div className="mt-3 pt-2 border-t border-cyan-500/10 flex flex-wrap gap-1.5">
                  {e.links.map((link, lIdx) => (
                    <a 
                      key={lIdx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[8px] bg-cyan-500/10 px-1.5 py-0.5 text-cyan-400 flex items-center gap-1 font-mono border border-cyan-500/10 rounded"
                    >
                      {link.title || 'Source'}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-3 bg-black/40 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Neural input..." 
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-2 text-[11px] text-zinc-300 outline-none focus:border-cyan-500/40 transition-all font-sans" 
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
