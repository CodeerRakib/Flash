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
            <div className="text-2xl font-hud font-black text-white">25.2°C</div>
            <div className="text-[10px] text-zinc-400 font-bold">Quezon City, PH</div>
            <div className="text-[8px] text-zinc-600 italic">overcast clouds</div>
          </div>
          <svg className="w-10 h-10 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/30 p-2 text-center border border-white/5">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Humidity</div>
            <div className="text-[9px] font-hud text-cyan-400">94%</div>
          </div>
          <div className="bg-black/30 p-2 text-center border border-white/5">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Wind</div>
            <div className="text-[9px] font-hud text-cyan-400">5.8 m/s</div>
          </div>
          <div className="bg-black/30 p-2 text-center border border-white/5">
            <div className="text-[7px] text-zinc-600 font-bold uppercase mb-1">Feels Like</div>
            <div className="text-[9px] font-hud text-cyan-400">26.3°C</div>
          </div>
        </div>
      </div>
    </div>
  );
}