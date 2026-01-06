
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
      
      // Opacity logic for rings
      const baseOpacity = isListening || isSpeaking || isProcessing ? 1 : 0.3;

      // Rotating Rings
      for (let i = 0; i < 4; i++) {
        const radius = 90 + i * 30;
        const rotationSpeed = isProcessing ? 0.002 : (0.0005 * (i + 1));
        const start = time * rotationSpeed * (i % 2 === 0 ? 1 : -1);
        
        ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.strokeStyle = `rgba(34, 211, 238, ${baseOpacity * (0.4 - i * 0.1)})`;
        
        ctx.beginPath();
        ctx.arc(cx, cy, radius, start, start + Math.PI * (0.5 + i * 0.25));
        ctx.stroke();
        
        // Secondary arcs for more detail
        ctx.beginPath();
        ctx.arc(cx, cy, radius, start + Math.PI, start + Math.PI * 1.2);
        ctx.stroke();
      }

      // Center Pulsing Glow
      const pulse = 1 + Math.sin(time * (isProcessing ? 0.01 : 0.003)) * 0.08;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * pulse);
      grad.addColorStop(0, `rgba(34, 211, 238, ${baseOpacity * (isProcessing ? 0.4 : 0.2)})`);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, 60 * pulse, 0, Math.PI * 2); ctx.fill();

      // Localized Audio Bars (Central HUD Component)
      const barCount = 12;
      const barWidth = 3;
      const gap = 4;
      const totalW = barCount * (barWidth + gap);
      
      ctx.fillStyle = isSpeaking ? '#22d3ee' : isProcessing ? 'rgba(34, 211, 238, 0.4)' : 'rgba(34, 211, 238, 0.1)';
      
      for (let i = 0; i < barCount; i++) {
        let h = 4; // Flatline
        if (isSpeaking) {
          h = 10 + Math.sin(time * 0.01 + i) * 20;
        } else if (isListening) {
          h = 6 + Math.random() * 8;
        } else if (isProcessing) {
          h = 4 + Math.sin(time * 0.005 + i) * 6;
        }
        
        const x = cx - totalW / 2 + i * (barWidth + gap);
        ctx.fillRect(x, cy - h / 2, barWidth, h);
      }

      frameId = requestAnimationFrame(animate);
    };

    animate(0);
    return () => cancelAnimationFrame(frameId);
  }, [isListening, isSpeaking, isProcessing]);

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <canvas ref={canvasRef} className="w-[400px] h-[400px]" />
    </div>
  );
};

export default CoreSystem;
