
import React, { useEffect, useRef } from 'react';

interface CoreSystemProps {
  isProcessing: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
}

const CoreSystem: React.FC<CoreSystemProps> = ({ isProcessing, isListening, isSpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const setSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };
    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);

    const particles: any[] = [];
    const count = 1800; // Denser particles like the image
    for (let i = 0; i < count; i++) {
      particles.push({
        phi: Math.acos(-1 + (2 * i) / count),
        theta: Math.sqrt(count * Math.PI) * Math.acos(-1 + (2 * i) / count),
        r: 100,
        baseR: 100,
        opacity: Math.random() * 0.5 + 0.3,
        size: Math.random() * 1.8 + 0.2
      });
    }

    const animate = (time: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const cx = cw / 2;
      const cy = ch / 2;
      ctx.clearRect(0, 0, cw, ch);

      const scale = Math.min(cw, ch) * 0.0035;
      const rotX = time * 0.0002;
      const rotY = time * 0.0003;

      const baseColor = isProcessing ? [239, 68, 68] : (isListening || isSpeaking ? [245, 158, 11] : [255, 230, 200]);

      particles.forEach((p) => {
        // 3D rotation
        let x = p.r * Math.sin(p.phi + rotX) * Math.cos(p.theta + rotY);
        let y = p.r * Math.sin(p.phi + rotX) * Math.sin(p.theta + rotY);
        let z = p.r * Math.cos(p.phi + rotX);

        const dist = z + 200;
        const s = 400 / dist;
        const px = cx + x * s * scale;
        const py = cy + y * s * scale;

        const alpha = Math.max(0, (z + 100) / 200) * p.opacity;
        ctx.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
        
        const dynamicSize = p.size * (isSpeaking ? 1.4 : 1);
        ctx.beginPath();
        ctx.arc(px, py, dynamicSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [isProcessing, isListening, isSpeaking]);

  return (
    <div ref={containerRef} className="flex-1 glass-panel rounded-lg m-1 relative overflow-hidden bg-black/20 border border-white/5 flex flex-col">
      <div className="absolute top-4 left-5 flex items-center gap-2 z-10">
        <div className="flex items-center gap-1.5 opacity-60">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-bold text-zinc-400 tracking-[0.4em] uppercase">CORE SYSTEM</span>
        </div>
      </div>
      
      <div className="absolute top-4 right-5 text-right z-10 opacity-60">
        <span className="text-[8.5px] font-mono text-zinc-500 tracking-widest">FREQ: 16-24KHZ</span>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      
      {/* Decorative Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[50%] h-[50%] border border-cyan-500/5 rounded-full" />
        <div className="absolute w-[65%] h-[65%] border border-white/[0.02] rounded-full" />
      </div>
    </div>
  );
};

export default CoreSystem;
