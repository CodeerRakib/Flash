
import React, { useEffect, useRef } from 'react';

interface CoreSystemProps {
  isProcessing?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
}

const CoreSystem: React.FC<CoreSystemProps> = ({ isProcessing, isListening, isSpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    const cw = 500;
    const ch = 500;
    canvas.width = cw;
    canvas.height = ch;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, cw, ch);
      const cx = cw / 2;
      const cy = ch / 2;
      const opacity = isListening || isSpeaking ? 1 : 0.4;

      // Concentric UI Rings
      ctx.setLineDash([]);
      ctx.lineWidth = 1;
      
      // Outer dim ring
      ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * 0.05})`;
      ctx.beginPath(); ctx.arc(cx, cy, 180, 0, Math.PI * 2); ctx.stroke();

      // Main rotating rings
      for (let i = 0; i < 3; i++) {
        const radius = 100 + i * 25;
        const speed = 0.0004 * (i + 1);
        const start = time * speed;
        ctx.strokeStyle = `rgba(34, 211, 238, ${opacity * (0.3 - i * 0.1)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, start, start + Math.PI * 1.2);
        ctx.stroke();
      }

      // Pulsing Center Glow
      const pulse = 1 + Math.sin(time * 0.003) * 0.05;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 * pulse);
      grad.addColorStop(0, `rgba(34, 211, 238, ${opacity * 0.2})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, 70 * pulse, 0, Math.PI * 2); ctx.fill();

      // Audio Bars (matching the image center)
      const barCount = 10;
      const barWidth = 4;
      const gap = 3;
      const totalW = barCount * (barWidth + gap);
      ctx.fillStyle = `rgba(34, 211, 238, ${opacity * 0.8})`;
      
      for (let i = 0; i < barCount; i++) {
        const h = (isListening || isSpeaking) 
          ? (5 + Math.random() * 25) 
          : 6;
        const x = cx - totalW / 2 + i * (barWidth + gap);
        ctx.fillRect(x, cy - h / 2, barWidth, h);
      }

      frameId = requestAnimationFrame(animate);
    };

    animate(0);
    return () => cancelAnimationFrame(frameId);
  }, [isListening, isSpeaking]);

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
      <canvas ref={canvasRef} className="w-[450px] h-[450px]" />
    </div>
  );
};

export default CoreSystem;
