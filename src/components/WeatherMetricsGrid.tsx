import React from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Gauge,
  Eye,
  Cloud,
  Sunrise,
  Sunset,
  Navigation,
  Compass,
  Thermometer,
} from 'lucide-react';
import { CurrentWeather, SunMoonData, UnitSystem } from '../types';
import { formatSpeed, formatTemp, getWindDirectionLabel } from '../lib/weatherUtils';

interface WeatherMetricsGridProps {
  current: CurrentWeather;
  sunMoon: SunMoonData;
  unit: UnitSystem;
}

export function WeatherMetricsGrid({ current, sunMoon, unit }: WeatherMetricsGridProps) {
  const windDirLabel = getWindDirectionLabel(current.windDirection);

  const getUvLevel = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/30' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/30' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-400', badge: 'bg-orange-500/10 border-orange-500/30' };
    if (uv <= 10) return { text: 'Very High', color: 'text-rose-400', badge: 'bg-rose-500/10 border-rose-500/30' };
    return { text: 'Extreme', color: 'text-purple-400', badge: 'bg-purple-500/10 border-purple-500/30' };
  };

  const uvInfo = getUvLevel(current.uvIndex);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Wind & Gusts Card */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-sky-400" />
            Wind & Gusts
          </span>
          <span className="text-xs font-semibold text-sky-400 flex items-center gap-1">
            <Navigation className="w-3 h-3 transform" style={{ transform: `rotate(${current.windDirection}deg)` }} />
            {windDirLabel}
          </span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white">{formatSpeed(current.windSpeed, unit)}</div>
          <p className="text-xs text-slate-400 mt-1">
            Gusts up to <span className="font-semibold text-slate-200">{formatSpeed(current.windGust, unit)}</span>
          </p>
        </div>
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Direction: {current.windDirection}°</span>
          <span>Breeze</span>
        </div>
      </div>

      {/* Humidity & Dew Point */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-cyan-400" />
            Humidity
          </span>
          <span className="text-xs text-slate-400 font-mono">{current.humidity}%</span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white">{current.humidity}%</div>
          <p className="text-xs text-slate-400 mt-1">
            The dew point is <span className="font-semibold text-slate-200">{formatTemp(current.dewPoint, unit)}</span>
          </p>
        </div>
        {/* Humidity Progress */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${current.humidity}%` }} />
        </div>
      </div>

      {/* UV Index Card */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            UV Index
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${uvInfo.badge} ${uvInfo.color}`}>
            {uvInfo.text}
          </span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white">{current.uvIndex} <span className="text-xs font-normal text-slate-400">/ 12</span></div>
          <p className="text-xs text-slate-400 mt-1">
            {current.uvIndex >= 6 ? 'Sun protection recommended.' : 'Low risk of solar harm.'}
          </p>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 via-rose-500 to-purple-600 rounded-full"
            style={{ width: `${Math.min(100, (current.uvIndex / 11) * 100)}%` }}
          />
        </div>
      </div>

      {/* Atmospheric Pressure */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-emerald-400" />
            Air Pressure
          </span>
          <span className="text-xs font-semibold text-emerald-400">Steady</span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white">{current.pressure} <span className="text-xs font-normal text-slate-400">hPa</span></div>
          <p className="text-xs text-slate-400 mt-1">
            Standard sea-level barometric density
          </p>
        </div>
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Normal range</span>
          <span>1013 hPa avg</span>
        </div>
      </div>

      {/* Cloud Cover */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Cloud className="w-4 h-4 text-sky-400" />
            Cloud Cover
          </span>
          <span className="text-xs text-slate-400 font-mono">{current.cloudCover}%</span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white">{current.cloudCover}%</div>
          <p className="text-xs text-slate-400 mt-1">
            {current.cloudCover > 80 ? 'Heavy cloud blanket' : current.cloudCover > 30 ? 'Partly cloudy sky' : 'Clear sky'}
          </p>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
          <div className="h-full bg-sky-400 rounded-full" style={{ width: `${current.cloudCover}%` }} />
        </div>
      </div>

      {/* Visibility */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-400" />
            Visibility
          </span>
          <span className="text-xs text-emerald-400 font-semibold">Clear</span>
        </div>
        <div className="my-2">
          <div className="text-2xl font-black text-white">{current.visibility} <span className="text-xs font-normal text-slate-400">km</span></div>
          <p className="text-xs text-slate-400 mt-1">
            Excellent horizon line visibility for driving
          </p>
        </div>
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
          Unobstructed clear view
        </div>
      </div>

      {/* Sunrise & Sunset */}
      <div className="sm:col-span-2 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-amber-400" />
            Sun & Moon Cycle
          </span>
          <span className="text-xs text-amber-300 font-medium">Moon: {sunMoon.moonPhase}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 my-2">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sunrise className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sunrise</span>
              <span className="text-sm font-bold text-white font-mono">{sunMoon.sunrise}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sunset className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sunset</span>
              <span className="text-sm font-bold text-white font-mono">{sunMoon.sunset}</span>
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Daylight: {sunMoon.dayLength}</span>
          <span>Solar Noon: {sunMoon.solarNoon}</span>
        </div>
      </div>
    </div>
  );
}
