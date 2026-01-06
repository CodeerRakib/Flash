
import React, { useEffect, useRef } from 'react';
import { TranscriptEntry } from '../types';

interface TranscriptProps {
  entries: TranscriptEntry[];
  isSpeaking?: boolean;
  isListening?: boolean;
  onRunCode?: (code: string) => void;
}

const Transcript: React.FC<TranscriptProps> = ({ entries, isSpeaking, isListening, onRunCode }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="glass-panel h-full rounded-lg flex flex-col border-white/10 bg-[#0a0a0c]/80 overflow-hidden">
      <div className="h-10 flex items-center px-4 border-b border-white/5 bg-black/60 shrink-0">
        <svg className="w-4 h-4 text-cyan-400 mr-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-300 uppercase">TRANSCRIPT</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar bg-black/10">
        {entries.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <svg className="w-8 h-8 text-zinc-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            <span className="text-[10px] tracking-widest font-bold text-zinc-500">AWAITING VOICE LINK</span>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={idx} className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[95%] px-4 py-3 rounded-2xl text-[11.5px] leading-relaxed shadow-lg ${
                entry.role === 'user' 
                ? 'bg-zinc-800/90 text-zinc-100 rounded-tr-none' 
                : 'bg-[#1a1a1e] border border-white/10 text-cyan-50/90 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap">{entry.text}</p>
              </div>
              <span className="text-[7.5px] text-zinc-600 mt-1.5 px-1 font-mono uppercase tracking-wider">
                {entry.role === 'flash' ? 'FLASH' : 'YOU'} // {entry.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-white/5 bg-black/60">
        <div className="flex items-center space-x-2.5">
           <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-cyan-500 shadow-[0_0_8px_cyan]' : (isListening ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-zinc-800')} animate-pulse`} />
           <span className="text-[8.5px] font-mono uppercase tracking-widest text-zinc-500">
             {isSpeaking ? 'FLASH SPEAKING...' : (isListening ? 'LISTENING...' : 'SYSTEM STANDBY')}
           </span>
        </div>
      </div>
    </div>
  );
};

export default Transcript;
