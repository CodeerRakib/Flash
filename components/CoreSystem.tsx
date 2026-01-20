
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
    const cw = 800;
    const ch = 800;
    canvas.width = cw;
    canvas.height = ch;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, cw, ch);
      const cx = cw / 2;
      const cy = ch / 2;
      
      const active = isListening || isSpeaking || isProcessing;
      const baseOpacity = active ? 1 : 0.4;
      const color = active ? 'rgba(34, 211, 238, ' : 'rgba(148, 163, 184, ';

      // Global Rotation for the entire stack
      const globalRot = time * 0.0001;

      // 1. External Orbiting Geometry (Large Arcs)
      for (let i = 0; i < 8; i++) {
        const radius = 120 + i * 28;
        const speed = 0.0005 * (i + 1);
        const rotation = time * speed * (i % 2 === 0 ? 1 : -1) + globalRot;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);
        
        ctx.strokeStyle = `${color}${baseOpacity * (0.4 - i * 0.04)})`;
        ctx.lineWidth = i % 2 === 0 ? 2 : 1;
        
        // Broken dash pattern
        ctx.setLineDash([20, 40, 10, 80]);
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Decorative triangular markers
        if (i % 3 === 0 && active) {
            ctx.fillStyle = `rgba(34, 211, 238, ${baseOpacity * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(radius, -4);
            ctx.lineTo(radius + 8, 0);
            ctx.lineTo(radius, 4);
            ctx.fill();
        }
        
        ctx.restore();
      }

      // 2. The Core "Reactor" Center
      const pulseSpeed = isProcessing ? 0.012 : isSpeaking ? 0.008 : 0.003;
      const pulse = 1 + Math.sin(time * pulseSpeed) * 0.08;
      
      // Outer Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140 * pulse);
      glowGrad.addColorStop(0, `${color}${active ? 0.3 : 0.1})`);
      glowGrad.addColorStop(0.5, `${color}0.05)`);
      glowGrad.addColorStop(1, `${color}0)`);
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 140 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Inner Core Ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-time * 0.001);
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 15]);
      ctx.beginPath();
      ctx.arc(0, 0, 80 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 3. Dynamic Visualizer Frequency Bars (Circular)
      if (active) {
          ctx.save();
          ctx.translate(cx, cy);
          const barCount = 64;
          const innerR = 85 * pulse;
          
          for (let i = 0; i < barCount; i++) {
            const angle = (i / barCount) * Math.PI * 2;
            let magnitude = 10;
            
            if (isSpeaking) magnitude = 15 + Math.random() * 45;
            else if (isListening) magnitude = 10 + Math.random() * 25;
            else if (isProcessing) magnitude = 12 + Math.sin(time * 0.02 + i) * 10;

            const x1 = Math.cos(angle) * innerR;
            const y1 = Math.sin(angle) * innerR;
            const x2 = Math.cos(angle) * (innerR + magnitude);
            const y2 = Math.sin(angle) * (innerR + magnitude);

            ctx.strokeStyle = `rgba(34, 211, 238, ${0.4 + (magnitude / 60)})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
          ctx.restore();
      }

      // 4. Floating Particles (Data Bits)
      if (active) {
        ctx.fillStyle = '#22d3ee';
        for(let i=0; i<12; i++) {
           const angle = (time * 0.0005 + (i * 0.52)) % (Math.PI * 2);
           const dist = 220 + Math.sin(time * 0.002 + i) * 30;
           const px = cx + Math.cos(angle) * dist;
           const py = cy + Math.sin(angle) * dist;
           const size = 1 + Math.random() * 2;
           ctx.globalAlpha = 0.5 + Math.sin(time * 0.01 + i) * 0.4;
           ctx.fillRect(px, py, size, size);
        }
        ctx.globalAlpha = 1;
      }

      frameId = requestAnimationFrame(animate);
    };

    animate(0);
    return () => cancelAnimationFrame(frameId);
  }, [isListening, isSpeaking, isProcessing]);

  return (
    <div className="relative flex items-center justify-center">
      <div className={`absolute inset-0 bg-cyan-500/10 rounded-full blur-[180px] transition-opacity duration-1000 ${isListening || isSpeaking ? 'opacity-50' : 'opacity-15'}`} />
      <canvas ref={canvasRef} className="w-[600px] h-[600px] pointer-events-none scale-110" />
    </div>
  );
};

export default CoreSystem;
