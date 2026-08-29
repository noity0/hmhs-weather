import React from 'react';
import { Wind, ShieldAlert, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { AirQualityData } from '../types';
import { getAqiCategory } from '../lib/weatherUtils';

interface AirQualityCardProps {
  airQuality: AirQualityData;
}

export function AirQualityCard({ airQuality }: AirQualityCardProps) {
  const categoryInfo = getAqiCategory(airQuality.usAqi);
  // AQI progress percentage capped at 300
  const progressPercent = Math.min(100, Math.max(0, (airQuality.usAqi / 300) * 100));

  const pollutants = [
    { label: 'PM2.5', value: airQuality.pm2_5, unit: 'µg/m³', desc: 'Fine particles' },
    { label: 'PM10', value: airQuality.pm10, unit: 'µg/m³', desc: 'Inhalable particles' },
    { label: 'Ozone (O₃)', value: airQuality.o3, unit: 'µg/m³', desc: 'Ground-level ozone' },
    { label: 'NO₂', value: airQuality.no2, unit: 'µg/m³', desc: 'Nitrogen dioxide' },
    { label: 'CO', value: airQuality.co, unit: 'µg/m³', desc: 'Carbon monoxide' },
    { label: 'SO₂', value: airQuality.so2, unit: 'µg/m³', desc: 'Sulfur dioxide' },
  ];

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl relative overflow-hidden">
      {/* Subtle Glow */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full filter blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: categoryInfo.color }}
      />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Live Air Quality Detector</h3>
            <span className="text-xs text-slate-400">Real-time atmospheric pollutants</span>
          </div>
        </div>

        <div className={`px-3.5 py-1.5 rounded-2xl border text-xs font-semibold ${categoryInfo.badgeBg}`}>
          {categoryInfo.name}
        </div>
      </div>

      {/* Main AQI Score Meter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6 bg-slate-950/40 border border-slate-800/60 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-bold shadow-lg border"
            style={{
              backgroundColor: `${categoryInfo.color}15`,
              borderColor: `${categoryInfo.color}40`,
              color: categoryInfo.color,
            }}
          >
            <span className="text-3xl font-black leading-none">{airQuality.usAqi}</span>
            <span className="text-[10px] font-medium opacity-80 uppercase tracking-wider mt-1">US AQI</span>
          </div>

          <div>
            <div className={`text-base font-bold ${categoryInfo.textClass}`}>{categoryInfo.name}</div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 max-w-xs">{categoryInfo.desc}</p>
          </div>
        </div>

        {/* AQI Gradient Bar */}
        <div className="md:col-span-2 flex flex-col justify-center">
          <div className="flex justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>0 Good</span>
            <span>100 Moderate</span>
            <span>200 Unhealthy</span>
            <span>300+</span>
          </div>
          <div className="relative w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 to-rose-600 rounded-full" />
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-white border-2 border-slate-900 rounded-full shadow-lg transform -translate-x-1/2 transition-all duration-500"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pollutant Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {pollutants.map((item) => (
          <div
            key={item.label}
            className="bg-slate-950/50 border border-slate-800/70 hover:border-slate-700/80 rounded-2xl p-3 transition"
          >
            <span className="text-xs font-semibold text-slate-300 block">{item.label}</span>
            <div className="text-lg font-bold text-white mt-1">
              {item.value}{' '}
              <span className="text-[10px] font-normal text-slate-400">{item.unit}</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5 truncate">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* Pollen Tracker if available */}
      {(airQuality.grassPollen !== undefined || airQuality.treePollen !== undefined) && (
        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Pollen Count: Grass: {airQuality.grassPollen ?? 0} | Tree: {airQuality.treePollen ?? 0}</span>
          </div>
          <span className="text-slate-500 text-[11px]">Updated live from air quality sensors</span>
        </div>
      )}
    </div>
  );
}
