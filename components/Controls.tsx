
import React from 'react';

interface ControlsProps {
  isLive: boolean;
  onStart: () => void;
  onEnd: () => void;
  cameraActive: boolean;
  setCameraActive: (a: boolean) => void;
  micActive: boolean;
  setMicActive: (a: boolean) => void;
  handsFreeEnabled: boolean;
  onToggleHandsFree: () => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  isLive, 
  onStart, 
  onEnd, 
  cameraActive, 
  setCameraActive, 
  micActive, 
  setMicActive
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-4 bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 shadow-2xl">
      <button 
        onClick={() => setCameraActive(!cameraActive)}
        className={`p-2.5 rounded-lg transition-all ${cameraActive ? 'text-zinc-300' : 'text-zinc-600'}`}
        title="Toggle Camera"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </button>

      {!isLive ? (
        <button 
          onClick={onStart}
          className="px-10 py-2.5 bg-cyan-600/20 border border-cyan-500/40 text-cyan-400 text-[10.5px] font-black tracking-[0.3em] rounded-full hover:bg-cyan-600/30 transition-all uppercase shadow-[0_0_20px_rgba(6,182,212,0.15)]"
        >
          START
        </button>
      ) : (
        <button 
          onClick={onEnd}
          className="flex items-center space-x-2.5 px-10 py-2.5 bg-[#1a0a0c] border border-red-500/40 text-red-500 text-[10.5px] font-black tracking-[0.3em] rounded-full hover:bg-red-900/20 transition-all uppercase shadow-[0_0_20px_rgba(239,68,68,0.15)]"
        >
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14h-9v-2h9v2z"/></svg>
           <span>END</span>
        </button>
      )}

      <button 
        onClick={() => setMicActive(!micActive)}
        className={`p-2.5 rounded-lg transition-all ${micActive ? 'text-zinc-300' : 'text-zinc-600'}`}
        title="Toggle Microphone"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
      </button>
      
      <button className="p-2.5 text-zinc-600" title="Monitor Mode">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </button>
    </div>
  );
};

export default Controls;
