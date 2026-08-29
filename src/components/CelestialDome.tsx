import React from 'react';
import { Sun, Moon, Sunrise, Sunset, Clock, Sparkles } from 'lucide-react';
import { SunMoonData } from '../types';

interface CelestialDomeProps {
  sunMoon: SunMoonData;
  isDay?: number;
}

export function CelestialDome({ sunMoon, isDay = 1 }: CelestialDomeProps) {
  // Parse sunrise & sunset to calculate current sun progress percentage (0 - 100)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseTimeToMinutes = (timeStr: string) => {
    try {
      const [hours, mins] = timeStr.split(':').map((n) => parseInt(n, 10));
      return (hours || 0) * 60 + (mins || 0);
    } catch {
      return 360; // 6:00 AM default
    }
  };

  const sunriseMin = parseTimeToMinutes(sunMoon.sunrise);
  const sunsetMin = parseTimeToMinutes(sunMoon.sunset);

  let sunProgress = 0;
  let isCurrentlyDaylight = false;

  if (currentMinutes >= sunriseMin && currentMinutes <= sunsetMin) {
    sunProgress = ((currentMinutes - sunriseMin) / (sunsetMin - sunriseMin)) * 100;
    isCurrentlyDaylight = true;
  } else if (currentMinutes > sunsetMin) {
    sunProgress = 100;
  } else {
    sunProgress = 0;
  }

  // Calculate arc position: angle between PI (left/sunrise) and 0 (right/sunset)
  const angleRad = Math.PI - (sunProgress / 100) * Math.PI;
  const radius = 110;
  const centerX = 150;
  const centerY = 130;
  const sunX = centerX + radius * Math.cos(angleRad);
  const sunY = centerY - radius * Math.sin(angleRad);

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            {isDay ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Celestial Track & Astronomy</h3>
            <span className="text-xs text-slate-400">Solar zenith arc and lunar phase illumination</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-amber-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{sunMoon.moonPhase}</span>
        </div>
      </div>

      {/* Solar Arc Track SVG Visualization */}
      <div className="relative flex items-center justify-center my-2">
        <svg viewBox="0 0 300 150" className="w-full max-w-xs overflow-visible">
          <defs>
            <linearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
            </linearGradient>

            <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            </filter>
          </defs>

          {/* Horizon Ground Line */}
          <line x1="20" y1="130" x2="280" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

          {/* Diurnal Sun Arc */}
          <path
            d="M 40 130 A 110 110 0 0 1 260 130"
            fill="none"
            stroke="url(#sunArcGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Golden Hour zones */}
          <circle cx="40" cy="130" r="4" fill="#f59e0b" />
          <circle cx="260" cy="130" r="4" fill="#ea580c" />
          <circle cx="150" cy="20" r="3" fill="#38bdf8" />

          {/* Real-time Sun Position Marker */}
          {isCurrentlyDaylight ? (
            <g transform={`translate(${sunX}, ${sunY})`}>
              <circle cx="0" cy="0" r="14" fill="#fbbf24" opacity="0.3" filter="url(#sunGlow)" />
              <circle cx="0" cy="0" r="8" fill="#fef08a" stroke="#f59e0b" strokeWidth="2" />
              {/* Pulsing solar rays */}
              <line x1="-12" y1="0" x2="-9" y2="0" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="0" x2="12" y2="0" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="-12" x2="0" y2="-9" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="0" y1="9" x2="0" y2="12" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ) : (
            <g transform={`translate(150, 65)`}>
              <circle cx="0" cy="0" r="12" fill="#818cf8" opacity="0.25" filter="url(#sunGlow)" />
              <circle cx="0" cy="0" r="8" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
            </g>
          )}

          {/* Labels on SVG */}
          <text x="35" y="145" fill="#94a3b8" fontSize="10" fontWeight="bold">
            {sunMoon.sunrise}
          </text>
          <text x="245" y="145" fill="#94a3b8" fontSize="10" fontWeight="bold">
            {sunMoon.sunset}
          </text>
          <text x="150" y="145" fill="#64748b" fontSize="9" textAnchor="middle">
            Solar Noon ({sunMoon.solarNoon})
          </text>
        </svg>
      </div>

      {/* Celestial Information Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800/80 text-xs">
        <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Daylight Span</span>
          <span className="font-bold text-white font-mono">{sunMoon.dayLength}</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Golden Hour</span>
          <span className="font-bold text-amber-300 font-mono">
            {sunMoon.sunset ? `${parseInt(sunMoon.sunset.split(':')[0]) - 1}:${sunMoon.sunset.split(':')[1]}` : '--'}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Solar Zenith</span>
          <span className="font-bold text-sky-300">{isCurrentlyDaylight ? `${Math.round(sunProgress)}% Day Elapsed` : 'Night Cycle'}</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Moon Phase</span>
          <span className="font-bold text-indigo-300 truncate block">{sunMoon.moonPhase}</span>
        </div>
      </div>
    </div>
  );
}
