import React, { useState } from 'react';
import { ArrowLeftRight, Search, MapPin, Loader2, Sparkles } from 'lucide-react';
import { WeatherData, UnitSystem, LocationInfo } from '../types';
import { fetchWeatherForLocation, searchLocations } from '../lib/weatherService';
import { formatTemp, formatSpeed } from '../lib/weatherUtils';

interface WeatherComparisonProps {
  currentWeatherData: WeatherData;
  unit: UnitSystem;
}

export function WeatherComparison({ currentWeatherData, unit }: WeatherComparisonProps) {
  const [compareQuery, setCompareQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [targetWeatherData, setTargetWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingTarget, setIsLoadingTarget] = useState<boolean>(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareQuery.trim()) return;
    setIsSearching(true);
    const results = await searchLocations(compareQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectCompareCity = async (city: LocationInfo) => {
    try {
      setIsLoadingTarget(true);
      setSearchResults([]);
      setCompareQuery('');
      const data = await fetchWeatherForLocation(city.lat, city.lon, {
        name: city.name,
        region: city.region,
        country: city.country,
      });
      setTargetWeatherData(data);
    } catch (err) {
      console.error('Compare fetch error:', err);
    } finally {
      setIsLoadingTarget(false);
    }
  };

  const loc1 = currentWeatherData;
  const loc2 = targetWeatherData;

  return (
    <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">Live Weather Comparison Tool</h3>
            <span className="text-xs text-slate-400">Compare your live location against any city worldwide</span>
          </div>
        </div>

        {/* Search City to Compare */}
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <input
            type="text"
            value={compareQuery}
            onChange={(e) => setCompareQuery(e.target.value)}
            placeholder="Search city to compare..."
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          {isSearching && <Loader2 className="absolute right-3 top-2.5 w-3.5 h-3.5 text-sky-400 animate-spin" />}

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50">
              {searchResults.map((city, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectCompareCity(city)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs text-white flex items-center justify-between border-b border-slate-800/50 last:border-none"
                >
                  <span className="font-semibold">{city.name}</span>
                  <span className="text-[10px] text-slate-400">{city.country}</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {isLoadingTarget ? (
        <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin mb-2" />
          <span>Fetching comparison weather metrics...</span>
        </div>
      ) : loc2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location 1 (Current) */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-sky-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Location 1 (Live)</span>
                <h4 className="text-lg font-black text-white">{loc1.location.name}</h4>
                <span className="text-xs text-slate-400">{loc1.location.country}</span>
              </div>
              <div className="text-3xl font-black text-white">{formatTemp(loc1.current.temp, unit)}</div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-800/80 pt-2">
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Condition</span>
                <span className="font-semibold">{loc1.current.conditionText}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Feels Like</span>
                <span className="font-semibold">{formatTemp(loc1.current.feelsLike, unit)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Humidity</span>
                <span className="font-semibold">{loc1.current.humidity}%</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Wind Speed</span>
                <span className="font-semibold">{formatSpeed(loc1.current.windSpeed, unit)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Air Quality (US AQI)</span>
                <span className="font-semibold">{loc1.airQuality.usAqi} ({loc1.airQuality.category})</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>UV Index</span>
                <span className="font-semibold">{loc1.current.uvIndex} / 12</span>
              </div>
            </div>
          </div>

          {/* Location 2 (Comparison Target) */}
          <div className="p-5 rounded-2xl bg-slate-950/50 border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Location 2 (Compared)</span>
                <h4 className="text-lg font-black text-white">{loc2.location.name}</h4>
                <span className="text-xs text-slate-400">{loc2.location.country}</span>
              </div>
              <div className="text-3xl font-black text-white">{formatTemp(loc2.current.temp, unit)}</div>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-800/80 pt-2">
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Condition</span>
                <span className="font-semibold">{loc2.current.conditionText}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Feels Like</span>
                <span className="font-semibold">{formatTemp(loc2.current.feelsLike, unit)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Humidity</span>
                <span className="font-semibold">{loc2.current.humidity}%</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Wind Speed</span>
                <span className="font-semibold">{formatSpeed(loc2.current.windSpeed, unit)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>Air Quality (US AQI)</span>
                <span className="font-semibold">{loc2.airQuality.usAqi} ({loc2.airQuality.category})</span>
              </div>
              <div className="flex justify-between py-1.5 text-slate-300">
                <span>UV Index</span>
                <span className="font-semibold">{loc2.current.uvIndex} / 12</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
          Search and pick any target city above to compare temperature, wind, air quality, and UV metrics side-by-side!
        </div>
      )}
    </div>
  );
}
