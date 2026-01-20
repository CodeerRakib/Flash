
import React from 'react';

export default function WeatherWidget() {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
          <span>Weather</span>
        </div>
        <button className="text-zinc-600">↺</button>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-hud font-black text-white">28.5°C</div>
            <div className="text-[10px] text-zinc-400 font-bold">Dhaka, Bangladesh</div>
            <div className="text-[8px] text-zinc-600 italic">clear sky</div>
          </div>
          <svg className="w-10 h-10 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/30 p-2 text-center border border-white/5">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Humidity</div>
            <div className="text-[9px] font-hud text-cyan-400">65%</div>
          </div>
          <div className="bg-black/30 p-2 text-center border border-white/5">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Wind</div>
            <div className="text-[9px] font-hud text-cyan-400">3.2 m/s</div>
          </div>
          <div className="bg-black/30 p-2 text-center border border-white/5">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Feels Like</div>
            <div className="text-[9px] font-hud text-cyan-400">31.0°C</div>
          </div>
        </div>
      </div>
    </div>
  );
}
