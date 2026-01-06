import React from 'react';

export default function Controls({ isLive, onStart, onEnd, cameraActive, setCameraActive }: any) {
  return (
    <div className="flex items-center gap-4">
      <button onClick={() => setCameraActive(!cameraActive)} className="w-10 h-8 flex items-center justify-center bg-black/40 border border-white/5 rounded hover:bg-white/5 transition-all text-zinc-500 hover:text-cyan-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </button>
      <button onClick={isLive ? onEnd : onStart} className={`w-10 h-8 flex items-center justify-center bg-black/40 border border-white/5 rounded transition-all ${isLive ? 'text-red-500' : 'text-zinc-500 hover:text-cyan-400'}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
      </button>
      <button className="w-10 h-8 flex items-center justify-center bg-black/40 border border-white/5 rounded hover:bg-white/5 transition-all text-zinc-500 hover:text-cyan-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </button>
    </div>
  );
}