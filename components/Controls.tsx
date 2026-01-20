
import React from 'react';

export default function Controls({ isLive, onStart, onEnd, cameraActive, setCameraActive }: any) {
  return (
    <div className="flex items-center gap-8 relative py-2">
      {isLive && (
        <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full animate-pulse" />
      )}

      <button 
        onClick={() => setCameraActive(!cameraActive)} 
        className={`w-12 h-12 flex items-center justify-center bg-black/40 border-2 rounded-lg transition-all ${
          cameraActive ? 'text-cyan-400 border-cyan-500 shadow-lg' : 'text-zinc-700 border-white/5'
        }`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </button>

      <button 
        onClick={isLive ? onEnd : onStart} 
        className={`relative w-20 h-20 flex items-center justify-center bg-black/60 border-2 rounded-full transition-all active:scale-95 shadow-2xl ${
          isLive ? 'border-red-500 text-red-500' : 'border-cyan-500/40 text-cyan-400 hover:border-cyan-400'
        }`}
      >
        <div className={`absolute inset-0 rounded-full border-2 border-current opacity-10 ${isLive ? 'animate-ping' : ''}`} />
        {isLive ? (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
        ) : (
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zM17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
        )}
      </button>

      <button className="w-12 h-12 flex items-center justify-center bg-black/40 border-2 border-white/5 rounded-lg text-zinc-700 hover:text-cyan-400">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
      </button>
    </div>
  );
}
