
import React, { useEffect, useRef, useState } from 'react';

interface VisualInputProps {
  active: boolean;
}

const VisualInput: React.FC<VisualInputProps> = ({ active }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (active) {
      setError(null);
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(() => setError('OFFLINE'));
    } else if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
  }, [active]);

  return (
    <div className="glass-panel rounded-lg overflow-hidden flex flex-col flex-1 min-h-[180px]">
      <div className="h-8 flex items-center justify-between px-3 border-b border-white/5 bg-black/40">
        <div className="flex items-center space-x-2">
          <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span className="text-[9px] font-bold tracking-widest text-zinc-400">VISUAL INPUT</span>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      </div>
      <div className="flex-1 bg-black relative">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover brightness-90 contrast-110" />
        {(!active || error) && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 font-mono text-[9px] text-zinc-600">
            {error || 'FEED_PAUSED'}
          </div>
        )}
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-white/20" />
      </div>
    </div>
  );
};

export default VisualInput;
