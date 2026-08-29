import React from 'react';
import { Clock, Umbrella, Wind, Droplets } from 'lucide-react';
import { HourlyForecast, UnitSystem } from '../types';
import { formatTemp, formatSpeed, getWeatherConditionInfo } from '../lib/weatherUtils';

interface HourlyForecastSliderProps {
  hourly: HourlyForecast[];
  unit: UnitSystem;
}

export function HourlyForecastSlider({ hourly, unit }: HourlyForecastSliderProps) {
  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">24-Hour Forecast Timeline</h3>
            <span className="text-xs text-slate-400">Hourly weather and precipitation probability</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent -mx-1 px-1">
        {hourly.map((item, idx) => {
          const condition = getWeatherConditionInfo(item.weatherCode, item.isDay);
          const isNow = idx === 0;

          return (
            <div
              key={idx}
              className={`flex-none w-28 rounded-2xl p-3.5 flex flex-col items-center justify-between text-center transition border shadow-md ${
                isNow
                  ? 'bg-gradient-to-b from-sky-500/20 via-sky-600/10 to-slate-900/90 border-sky-400/50 shadow-sky-500/10 scale-105'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/50'
              }`}
            >
              <span className={`text-xs font-bold ${isNow ? 'text-sky-300' : 'text-slate-300'}`}>
                {item.hourLabel}
              </span>

              {/* Weather Condition Icon */}
              <div className="my-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-sky-400 font-bold">
                <span className="text-2xl">{item.weatherCode === 0 ? (item.isDay ? '☀️' : '🌙') : item.weatherCode < 4 ? '⛅' : item.weatherCode < 70 ? '🌧️' : '❄️'}</span>
              </div>

              <div className="text-base font-extrabold text-white">
                {formatTemp(item.temp, unit)}
              </div>

              <span className="text-[10px] text-slate-400 truncate max-w-full mt-0.5 font-medium">
                {item.conditionText}
              </span>

              {/* Precipitation % */}
              <div className="mt-2.5 w-full pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1 text-[10px]">
                <Umbrella className={`w-3 h-3 ${item.pop > 30 ? 'text-sky-400' : 'text-slate-500'}`} />
                <span className={`font-semibold ${item.pop > 30 ? 'text-sky-300' : 'text-slate-400'}`}>
                  {item.pop}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
