import React from 'react';
import { Wind, Compass, Gauge, Navigation, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { CurrentWeather, UnitSystem } from '../types';
import { formatSpeed, getWindDirectionLabel } from '../lib/weatherUtils';

interface WindAeroCompassProps {
  current: CurrentWeather;
  unit: UnitSystem;
}

export function WindAeroCompass({ current, unit }: WindAeroCompassProps) {
  const windDirLabel = getWindDirectionLabel(current.windDirection);

  // Beaufort Wind Scale calculation
  const getBeaufortScale = (speedKph: number) => {
    if (speedKph < 1) return { num: 0, label: 'Calm', desc: 'Smoke rises vertically' };
    if (speedKph <= 5) return { num: 1, label: 'Light Air', desc: 'Direction shown by smoke drift' };
    if (speedKph <= 11) return { num: 2, label: 'Light Breeze', desc: 'Wind felt on face; leaves rustle' };
    if (speedKph <= 19) return { num: 3, label: 'Gentle Breeze', desc: 'Leaves and small twigs in motion' };
    if (speedKph <= 28) return { num: 4, label: 'Moderate Breeze', desc: 'Dust and loose paper raised' };
    if (speedKph <= 38) return { num: 5, label: 'Fresh Breeze', desc: 'Small trees in leaf begin to sway' };
    if (speedKph <= 49) return { num: 6, label: 'Strong Breeze', desc: 'Large branches in motion' };
    if (speedKph <= 61) return { num: 7, label: 'High Wind / Near Gale', desc: 'Whole trees in motion' };
    if (speedKph <= 74) return { num: 8, label: 'Gale', desc: 'Twigs break off trees' };
    if (speedKph <= 88) return { num: 9, label: 'Strong Gale', desc: 'Slight structural damage' };
    return { num: 10, label: 'Storm / Violent Storm', desc: 'Trees uprooted; considerable damage' };
  };

  const beaufort = getBeaufortScale(current.windSpeed);

  // Barometric Pressure Tendency
  const getPressureStatus = (pressureHpa: number) => {
    if (pressureHpa > 1022) return { status: 'High Pressure', trend: 'Fair & Settled', color: 'text-emerald-400' };
    if (pressureHpa >= 1008) return { status: 'Normal Sea-Level', trend: 'Stable Weather', color: 'text-sky-400' };
    if (pressureHpa >= 995) return { status: 'Low Pressure', trend: 'Cloudy / Unsettled', color: 'text-amber-400' };
    return { status: 'Deep Low', trend: 'Storm Approaching', color: 'text-rose-400' };
  };

  const pressureInfo = getPressureStatus(current.pressure);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 3D Aerodynamic Wind Compass */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Aerodynamic Wind Vector</h3>
              <span className="text-xs text-slate-400">Real-time azimuth bearing and force</span>
            </div>
          </div>

          <div className="px-3 py-1 rounded-xl bg-sky-950/80 border border-sky-800/60 text-xs font-bold text-sky-300">
            Beaufort {beaufort.num}
          </div>
        </div>

        {/* Compass Rose SVG Dial */}
        <div className="relative flex items-center justify-center my-3">
          <div className="relative w-44 h-44 rounded-full border-2 border-slate-700/80 bg-slate-950/80 flex items-center justify-center shadow-inner">
            {/* Cardinal Markers */}
            <span className="absolute top-1.5 text-xs font-black text-rose-400 tracking-wider">N</span>
            <span className="absolute right-2 text-xs font-bold text-slate-400">E</span>
            <span className="absolute bottom-1.5 text-xs font-bold text-slate-400">S</span>
            <span className="absolute left-2 text-xs font-bold text-slate-400">W</span>

            {/* Minor Tick Marks */}
            <div className="absolute inset-2 rounded-full border border-slate-800/80 pointer-events-none" />

            {/* Aerodynamic Rotating Needle */}
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            >
              <div className="flex flex-col items-center h-full justify-between py-3 pointer-events-none">
                {/* Arrowhead pointing to wind origin */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[20px] border-b-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                <div className="w-0.5 h-12 bg-slate-600" />
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[14px] border-t-slate-500" />
              </div>
            </div>

            {/* Center Dial Hub */}
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 flex flex-col items-center justify-center shadow-lg z-10 text-center">
              <span className="text-xs font-extrabold text-white leading-none">{windDirLabel}</span>
              <span className="text-[10px] font-mono text-sky-400 font-bold mt-0.5">{current.windDirection}°</span>
            </div>
          </div>
        </div>

        {/* Beaufort & Gusts Info */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Sustained Speed</span>
            <span className="font-extrabold text-white text-sm">{formatSpeed(current.windSpeed, unit)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max Gust Force</span>
            <span className="font-extrabold text-amber-300 text-sm">{formatSpeed(current.windGust, unit)}</span>
          </div>
        </div>
      </div>

      {/* Barometric Pressure & Atmospheric Density */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Barometer & Atmospheric Pressure</h3>
              <span className="text-xs text-slate-400">Sea-level pressure and frontal boundary</span>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold ${pressureInfo.color}`}>
            {pressureInfo.status}
          </div>
        </div>

        {/* Barometer Gauge Visualizer */}
        <div className="my-auto py-4">
          <div className="flex items-baseline justify-between">
            <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {current.pressure}
              <span className="text-base font-normal text-slate-400 ml-1.5 font-sans">hPa</span>
            </span>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-200 block">{pressureInfo.trend}</span>
              <span className="text-[11px] text-slate-400">{(current.pressure * 0.02953).toFixed(2)} inHg</span>
            </div>
          </div>

          {/* Precision Pressure Level Meter */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span>970 (Deep Low)</span>
              <span>1013 (Standard)</span>
              <span>1045 (High)</span>
            </div>
            <div className="relative w-full h-3 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 to-sky-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(5, Math.min(100, ((current.pressure - 970) / (1045 - 970)) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Barometric Diagnostics footer */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Dew Point</span>
            <span className="font-bold text-cyan-300 font-mono">{current.dewPoint.toFixed(1)}°C</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Air Density</span>
            <span className="font-bold text-white font-mono">1.225 kg/m³</span>
          </div>
        </div>
      </div>
    </div>
  );
}
