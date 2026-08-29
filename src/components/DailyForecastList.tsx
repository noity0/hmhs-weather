import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Umbrella,
  Sunrise,
  Sunset,
  Search,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Flame,
  Snowflake,
  CloudRain,
  Info,
} from 'lucide-react';
import { DailyForecast, UnitSystem } from '../types';
import { formatTemp, getWeatherConditionInfo } from '../lib/weatherUtils';

interface DailyForecastListProps {
  daily: DailyForecast[];
  unit: UnitSystem;
}

export function DailyForecastList({ daily, unit }: DailyForecastListProps) {
  const [horizonMode, setHorizonMode] = useState<'10day' | '16day' | '100day'>('100day');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Get unique months available in the forecast
  const monthsAvailable = useMemo(() => {
    const monthsSet = new Set<string>();
    daily.forEach((item) => {
      if (item.monthName) {
        const year = item.date.split('-')[0];
        monthsSet.add(`${item.monthName} ${year}`);
      }
    });
    return Array.from(monthsSet);
  }, [daily]);

  // 2. Horizon slice
  const horizonSlice = useMemo(() => {
    if (horizonMode === '10day') return daily.slice(0, 10);
    if (horizonMode === '16day') return daily.slice(0, 16);
    return daily; // 100 days
  }, [daily, horizonMode]);

  // 3. Filter by month & search
  const filteredDaily = useMemo(() => {
    return horizonSlice.filter((item) => {
      // Month filter
      if (selectedMonth !== 'all') {
        const itemMonthYear = `${item.monthName} ${item.date.split('-')[0]}`;
        if (itemMonthYear !== selectedMonth) return false;
      }
      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchDate = item.date.toLowerCase().includes(q);
        const matchDay = item.dayName.toLowerCase().includes(q);
        const matchMonth = (item.monthName || '').toLowerCase().includes(q);
        const matchCondition = item.conditionText.toLowerCase().includes(q);
        const matchDayNum = (item.dayOfMonth || '').toString().includes(q);
        return matchDate || matchDay || matchMonth || matchCondition || matchDayNum;
      }
      return true;
    });
  }, [horizonSlice, selectedMonth, searchQuery]);

  // 4. Global statistics over the 100-day dataset
  const stats = useMemo(() => {
    if (!daily.length) return null;

    let hottest = daily[0];
    let coldest = daily[0];
    let rainyDaysCount = 0;
    let sumMaxTemp = 0;

    daily.forEach((d) => {
      if (d.tempMax > hottest.tempMax) hottest = d;
      if (d.tempMin < coldest.tempMin) coldest = d;
      if (d.pop >= 40 || d.precipitation > 0.5) rainyDaysCount++;
      sumMaxTemp += d.tempMax;
    });

    const avgMax = Math.round(sumMaxTemp / daily.length);

    return {
      hottest,
      coldest,
      rainyDaysCount,
      avgMax,
      physicsDays: daily.filter((d) => d.forecastType === 'physics').length,
      climateDays: daily.filter((d) => d.forecastType === 'climate').length,
    };
  }, [daily]);

  // Calculate max & min bounds for temperature bars across current visible items
  const allMaxs = filteredDaily.map((d) => d.tempMax);
  const allMins = filteredDaily.map((d) => d.tempMin);
  const globalMax = Math.max(...allMaxs, 30);
  const globalMin = Math.min(...allMins, 0);
  const tempRange = globalMax - globalMin || 1;

  // Chart plotting variables for SVG timeline
  const chartData = horizonSlice;
  const chartWidth = 800;
  const chartHeight = 120;
  const cMaxs = chartData.map((d) => d.tempMax);
  const cMins = chartData.map((d) => d.tempMin);
  const chartGlobalMax = Math.max(...cMaxs, 30);
  const chartGlobalMin = Math.min(...cMins, 0);
  const chartRange = chartGlobalMax - chartGlobalMin || 1;

  const pointsMax = chartData.map((d, i) => {
    const x = (i / Math.max(1, chartData.length - 1)) * chartWidth;
    const y = chartHeight - ((d.tempMax - chartGlobalMin) / chartRange) * (chartHeight - 20) - 10;
    return { x, y, temp: d.tempMax, item: d };
  });

  const pointsMin = chartData.map((d, i) => {
    const x = (i / Math.max(1, chartData.length - 1)) * chartWidth;
    const y = chartHeight - ((d.tempMin - chartGlobalMin) / chartRange) * (chartHeight - 20) - 10;
    return { x, y, temp: d.tempMin, item: d };
  });

  const pathMaxD = pointsMax.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ''
  );
  const pathMinD = pointsMin.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ''
  );

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 sm:p-7 shadow-xl space-y-6">
      {/* Header & Horizon Selection Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-600/10 border border-sky-500/30 text-sky-400 shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white tracking-tight">100-Day Weather Horizon</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider">
                High Precision
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Blending 16-day Open-Meteo deterministic physics with 100-day astronomical & climate trend models.
            </p>
          </div>
        </div>

        {/* Horizon Pill Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-inner self-start lg:self-auto">
          <button
            onClick={() => setHorizonMode('10day')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              horizonMode === '10day'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            10-Day Standard
          </button>
          <button
            onClick={() => setHorizonMode('16day')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              horizonMode === '16day'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>16-Day Physics</span>
          </button>
          <button
            onClick={() => setHorizonMode('100day')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 ${
              horizonMode === '100day'
                ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>100-Day Full Horizon</span>
          </button>
        </div>
      </div>

      {/* 100-Day Horizon Insights Key Metrics Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">100-Day Peak High</span>
              <span className="text-sm font-black text-amber-300 font-mono">
                {formatTemp(stats.hottest.tempMax, unit)}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {stats.hottest.monthName} {stats.hottest.dayOfMonth}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Snowflake className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">100-Day Lowest Dip</span>
              <span className="text-sm font-black text-cyan-300 font-mono">
                {formatTemp(stats.coldest.tempMin, unit)}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                {stats.coldest.monthName} {stats.coldest.dayOfMonth}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <CloudRain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rain / Precip Days</span>
              <span className="text-sm font-black text-sky-300 font-mono">{stats.rainyDaysCount} Days</span>
              <span className="text-[10px] text-slate-500 block">Out of 100 days</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Model Confidence</span>
              <span className="text-sm font-black text-emerald-300 font-mono">99% → 76%</span>
              <span className="text-[10px] text-slate-500 block">Physics + Climate</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive 100-Day Temperature Wave Chart */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 font-bold px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <span>
              {horizonMode === '100day'
                ? '100-Day Temperature Trend Wave'
                : horizonMode === '16day'
                ? '16-Day Physics Ensemble Curve'
                : '10-Day Temperature Curve'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 rounded-full bg-rose-400 inline-block"></span> High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 rounded-full bg-cyan-400 inline-block"></span> Low
            </span>
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="relative w-full overflow-hidden pt-2">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-28 overflow-visible">
            <defs>
              <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="minGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="10" x2={chartWidth} y2="10" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="0" y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke="#1e293b" strokeDasharray="3 3" />

            {/* Area Fills */}
            <path
              d={`${pathMaxD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
              fill="url(#maxGradient)"
            />
            <path
              d={`${pathMinD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
              fill="url(#minGradient)"
            />

            {/* Lines */}
            <path d={pathMaxD} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />
            <path d={pathMinD} fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />

            {/* Physics vs Climate divider vertical line (Day 16 mark) */}
            {chartData.length > 16 && (
              <g>
                <line
                  x1={(16 / chartData.length) * chartWidth}
                  y1="0"
                  x2={(16 / chartData.length) * chartWidth}
                  y2={chartHeight}
                  stroke="#38bdf8"
                  strokeDasharray="2 2"
                  strokeWidth="1.5"
                />
                <text
                  x={(16 / chartData.length) * chartWidth + 4}
                  y="12"
                  fill="#38bdf8"
                  fontSize="9"
                  fontWeight="bold"
                >
                  Climate Model Transition
                </text>
              </g>
            )}

            {/* Interactive Points */}
            {pointsMax.map((pt, i) => (
              <circle
                key={`max-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? 4 : 1.5}
                fill="#f43f5e"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900 border border-sky-500/50 rounded-xl px-3 py-1.5 shadow-2xl text-[11px] text-white flex items-center gap-3 z-10 pointer-events-none">
              <span className="font-bold text-sky-300">
                {chartData[hoveredIndex].monthName} {chartData[hoveredIndex].dayOfMonth} ({chartData[hoveredIndex].dayName})
              </span>
              <span className="text-rose-400 font-bold">{formatTemp(chartData[hoveredIndex].tempMax, unit)}</span>
              <span className="text-cyan-400 font-bold">{formatTemp(chartData[hoveredIndex].tempMin, unit)}</span>
              <span className="text-slate-300">{chartData[hoveredIndex].conditionText}</span>
              <span className="text-emerald-400 font-mono text-[10px]">
                {chartData[hoveredIndex].forecastType === 'physics' ? 'Physics 98%' : 'Climate 82%'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Month Filter Badges & Search Box */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Month Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedMonth === 'all'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-white'
            }`}
          >
            All Months ({horizonSlice.length} Days)
          </button>
          {monthsAvailable.map((m) => {
            const count = horizonSlice.filter((item) => `${item.monthName} ${item.date.split('-')[0]}` === m).length;
            if (count === 0) return null;
            return (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedMonth === m
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-white'
                }`}
              >
                {m} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dates, rain, sun..."
            className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
          />
        </div>
      </div>

      {/* Daily Forecast List Items */}
      <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredDaily.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-2xl border border-slate-800/60">
            No forecast matches found for "{searchQuery}".
          </div>
        ) : (
          filteredDaily.map((item, idx) => {
            const isToday = item.dayName === 'Today';
            const isPhysics = item.forecastType === 'physics';

            // Bar calculation
            const leftPercent = Math.max(0, ((item.tempMin - globalMin) / tempRange) * 100);
            const barWidthPercent = Math.max(10, ((item.tempMax - item.tempMin) / tempRange) * 100);

            return (
              <div
                key={`${item.date}-${idx}`}
                className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isToday
                    ? 'bg-gradient-to-r from-sky-950/40 via-slate-900/80 to-slate-900/80 border-sky-500/40 shadow-md'
                    : 'bg-slate-950/50 border-slate-800/60 hover:bg-slate-900/60'
                }`}
              >
                {/* Date / Month / Day & Condition */}
                <div className="flex items-center gap-3 sm:w-56">
                  <div className="w-24 font-bold text-xs text-white flex flex-col">
                    <div className="flex items-center gap-1">
                      {isToday && <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>}
                      <span className="text-sm font-extrabold">{item.dayName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.monthName} {item.dayOfMonth}, {item.date.split('-')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="text-xl">
                      {item.weatherCode === 0
                        ? '☀️'
                        : item.weatherCode < 4
                        ? '⛅'
                        : item.weatherCode < 70
                        ? '🌧️'
                        : '❄️'}
                    </span>
                    <span className="truncate max-w-[110px] font-medium">{item.conditionText}</span>
                  </div>
                </div>

                {/* Rain Probability & Precip Badge */}
                <div className="flex items-center gap-1.5 text-xs text-slate-400 w-28">
                  <Umbrella className={`w-3.5 h-3.5 ${item.pop > 30 ? 'text-sky-400' : 'text-slate-600'}`} />
                  <span className={`font-semibold ${item.pop > 30 ? 'text-sky-300' : 'text-slate-400'}`}>
                    {item.pop}%
                  </span>
                  {item.precipitation > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono">({item.precipitation.toFixed(1)}mm)</span>
                  )}
                </div>

                {/* Temperature Bar Visualizer */}
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-10 text-right font-mono">
                    {formatTemp(item.tempMin, unit)}
                  </span>
                  <div className="relative flex-1 h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-500 shadow"
                      style={{ left: `${leftPercent}%`, width: `${barWidthPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-extrabold text-white w-10 font-mono">
                    {formatTemp(item.tempMax, unit)}
                  </span>
                </div>

                {/* Forecast Model Type & Confidence Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-slate-400 sm:w-44">
                  <span
                    className={`px-2 py-0.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider ${
                      isPhysics
                        ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                        : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                    }`}
                  >
                    {isPhysics ? 'Physics' : 'Climate'}
                  </span>

                  <span className="font-mono text-slate-400 text-[10px]" title="Model Precision Confidence">
                    {item.confidenceScore}% conf
                  </span>

                  <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <Sunrise className="w-3 h-3 text-amber-400" />
                    <span>{item.sunrise}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
