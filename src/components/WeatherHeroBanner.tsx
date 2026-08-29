import React from 'react';
import {
  MapPin,
  RefreshCw,
  Wind,
  Droplets,
  Sun,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  Clock,
  Sparkles,
  Sliders,
  Target,
} from 'lucide-react';
import { WeatherData, UnitSystem } from '../types';
import {
  formatTemp,
  formatSpeed,
  getWeatherConditionInfo,
  getAqiCategory,
} from '../lib/weatherUtils';
import { RealisticAtmosphericCanvas } from './RealisticAtmosphericCanvas';
import { AtmosphericSoundscape } from './AtmosphericSoundscape';

interface WeatherHeroBannerProps {
  weatherData: WeatherData;
  unit: UnitSystem;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenRefineLocation?: () => void;
}

export function WeatherHeroBanner({
  weatherData,
  unit,
  onRefresh,
  isRefreshing,
  onOpenRefineLocation,
}: WeatherHeroBannerProps) {
  const { location, current, daily, airQuality, lastUpdated } = weatherData;
  const condition = getWeatherConditionInfo(current.weatherCode, current.isDay);
  const aqiInfo = getAqiCategory(airQuality.usAqi);

  const todayForecast = daily[0] || { tempMax: current.temp + 2, tempMin: current.temp - 4 };

  return (
    <div
      className={`relative rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/15 text-white overflow-hidden bg-gradient-to-br ${condition.themeGradient} transition-all duration-700`}
    >
      {/* Ultra-Realistic 60fps Hardware-Accelerated Atmosphere Physics Canvas */}
      <RealisticAtmosphericCanvas
        effect={condition.effect}
        windSpeed={current.windSpeed}
        windDirection={current.windDirection}
        isDay={current.isDay}
      />

      {/* Background Weather Atmosphere Layer */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] pointer-events-none" />

      {/* Decorative Atmosphere Ambient Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-black/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between gap-8">
        {/* Top Location & Last Updated Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md shadow-inner">
              <MapPin className="w-6 h-6 text-sky-200 animate-bounce-slow" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{location.name}</h2>
                {location.isLiveLocation && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/40 text-emerald-200 text-[10px] font-extrabold tracking-wider uppercase backdrop-blur-md shadow">
                    Live GPS
                  </span>
                )}
                <button
                  onClick={onOpenRefineLocation}
                  className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-md transition shadow"
                  title="Fix or Refine Exact Location"
                >
                  <Target className="w-3.5 h-3.5 text-sky-200" />
                  <span>Refine Location</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-medium flex items-center gap-2 mt-0.5">
                <span>{location.region ? `${location.region}, ` : ''}{location.country}</span>
                <span className="text-[10px] font-mono text-slate-300/80">
                  ({location.lat.toFixed(3)}°, {location.lon.toFixed(3)}°)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Nature Audio Soundscape Player */}
            <AtmosphericSoundscape effect={condition.effect} />

            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-200 uppercase font-semibold block">Last Sensor Sync</span>
              <span className="text-xs font-mono font-bold text-sky-100">{lastUpdated}</span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md text-white transition shadow-lg active:scale-95 disabled:opacity-50"
              title="Refresh Live Weather Data"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero Middle Section: Huge Temp & Weather Condition Badge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl sm:text-8xl font-black tracking-tighter drop-shadow-xl leading-none">
                {Math.round(unit === 'imperial' ? (current.temp * 9) / 5 + 32 : current.temp)}°
              </span>

              <div>
                <div className="text-lg sm:text-xl font-bold text-sky-100 flex items-center gap-1.5">
                  Feels like {formatTemp(current.feelsLike, unit)}
                </div>
                {/* Today High and Low */}
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-200 mt-1 font-mono">
                  <span className="flex items-center text-rose-200">
                    <ArrowUp className="w-3.5 h-3.5" />
                    H: {formatTemp(todayForecast.tempMax, unit)}
                  </span>
                  <span className="flex items-center text-sky-200">
                    <ArrowDown className="w-3.5 h-3.5" />
                    L: {formatTemp(todayForecast.tempMin, unit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                {condition.label}
              </span>
            </div>
          </div>

          {/* Dynamic Animated Weather Graphic Display */}
          <div className="flex justify-start md:justify-end">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center gap-6">
              <div className="text-6xl sm:text-7xl transform hover:scale-110 transition duration-300">
                {current.weatherCode === 0
                  ? current.isDay
                    ? '☀️'
                    : '🌙'
                  : current.weatherCode < 4
                  ? '⛅'
                  : current.weatherCode < 50
                  ? '🌫️'
                  : current.weatherCode < 70
                  ? '🌧️'
                  : current.weatherCode < 85
                  ? '❄️'
                  : '🌩️'}
              </div>

              <div className="space-y-1.5">
                <div className="text-xs uppercase tracking-wider text-slate-200 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Live Atmospheric Index
                </div>
                <div className="text-sm font-bold text-white">
                  {current.cloudCover}% Cloudiness
                </div>
                <div className="text-xs text-slate-200">
                  Humidity: {current.humidity}% • UV: {current.uvIndex}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Key Quick Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-3">
            <Wind className="w-5 h-5 text-sky-200" />
            <div>
              <span className="text-[10px] text-slate-200 uppercase font-semibold block">Wind Speed</span>
              <span className="text-xs font-bold text-white">{formatSpeed(current.windSpeed, unit)}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-3">
            <Droplets className="w-5 h-5 text-cyan-200" />
            <div>
              <span className="text-[10px] text-slate-200 uppercase font-semibold block">Humidity</span>
              <span className="text-xs font-bold text-white">{current.humidity}%</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-3">
            <Sun className="w-5 h-5 text-amber-200" />
            <div>
              <span className="text-[10px] text-slate-200 uppercase font-semibold block">UV Index</span>
              <span className="text-xs font-bold text-white">{current.uvIndex} / 12</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-200" />
            <div>
              <span className="text-[10px] text-slate-200 uppercase font-semibold block">Air Quality</span>
              <span className="text-xs font-bold text-white">{airQuality.usAqi} ({aqiInfo.name})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
