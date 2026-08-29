import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Star,
  Trash2,
  Plus,
  Loader2,
  Globe,
  Sliders,
  Check,
  Target,
} from 'lucide-react';
import { LocationInfo, UnitSystem, SavedLocation } from '../types';
import { searchLocations } from '../lib/weatherService';

interface HeaderNavProps {
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  onDetectLiveLocation: () => void;
  isLoadingLocation: boolean;
  unit: UnitSystem;
  onToggleUnit: () => void;
  savedLocations: SavedLocation[];
  onSaveLocation: (loc: LocationInfo) => void;
  onRemoveSavedLocation: (id: string) => void;
  onOpenRefineLocation?: () => void;
}

export function HeaderNav({
  currentLocation,
  onSelectLocation,
  onDetectLiveLocation,
  isLoadingLocation,
  unit,
  onToggleUnit,
  savedLocations,
  onSaveLocation,
  onRemoveSavedLocation,
  onOpenRefineLocation,
}: HeaderNavProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Quick preset locations
  const popularCities: LocationInfo[] = [
    { name: 'Tokyo', region: 'Kanto', country: 'Japan', lat: 35.6762, lon: 139.6503 },
    { name: 'London', region: 'England', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', region: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
    { name: 'Paris', region: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
    { name: 'Sydney', region: 'New South Wales', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  ];

  // Debounced Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setIsDropdownOpen(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCurrentSaved = savedLocations.some(
    (loc) => loc.name === currentLocation.name && Math.abs(loc.lat - currentLocation.lat) < 0.01
  );

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Live Detector Badge */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white leading-none">
                  Live Weather<span className="text-sky-400">Detector</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE GPS
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:block mt-0.5">Real-Time Atmospheric Intelligence</span>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onToggleUnit}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-sky-400"
            >
              {unit === 'metric' ? '°C' : '°F'}
            </button>
            <button
              onClick={onDetectLiveLocation}
              disabled={isLoadingLocation}
              className="p-2 rounded-xl bg-sky-500 text-slate-950 font-bold"
              title="Detect Live GPS Location"
            >
              <Compass className={`w-4 h-4 ${isLoadingLocation ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center: Search & Location Autocomplete */}
        <div ref={dropdownRef} className="relative w-full md:max-w-md">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search any city or address in the world..."
              className="w-full bg-slate-900/90 border border-slate-700/70 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-inner"
            />
            {isSearching && (
              <Loader2 className="absolute right-3.5 w-4 h-4 text-sky-400 animate-spin" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
              <div className="p-2 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-800">
                Matching Global Locations
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                {searchResults.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectLocation(loc);
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-800/80 transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
                      <div>
                        <span className="text-xs font-bold text-white block">{loc.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {loc.region ? `${loc.region}, ` : ''}{loc.country}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Controls: Detect Live GPS + Refine Location + Units Toggle + Favorite Button */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onDetectLiveLocation}
            disabled={isLoadingLocation}
            className="px-3 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition flex items-center gap-1.5 shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            {isLoadingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Compass className="w-4 h-4 text-slate-950" />
            )}
            <span>Live GPS</span>
          </button>

          <button
            onClick={onOpenRefineLocation}
            className="px-3 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-sky-400 font-bold text-xs transition flex items-center gap-1.5 shadow"
            title="Refine or Fix Exact GPS Coordinates"
          >
            <Target className="w-4 h-4 text-sky-400" />
            <span>Refine Pin</span>
          </button>

          <button
            onClick={() => onSaveLocation(currentLocation)}
            className={`p-2.5 rounded-2xl border transition shadow flex items-center gap-1.5 text-xs font-semibold ${
              isCurrentSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800'
            }`}
            title={isCurrentSaved ? 'Saved in favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isCurrentSaved ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
          </button>

          {/* Unit System Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-2xl p-1 shadow-inner">
            <button
              onClick={onToggleUnit}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                unit === 'metric' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={onToggleUnit}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                unit === 'imperial' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {/* Quick Location Chips */}
      <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          Quick Cities:
        </span>
        {popularCities.map((city, idx) => (
          <button
            key={idx}
            onClick={() => onSelectLocation(city)}
            className={`px-3 py-1 rounded-full border text-[11px] font-medium transition whitespace-nowrap ${
              currentLocation.name === city.name
                ? 'bg-sky-500/20 text-sky-300 border-sky-400/50 font-bold'
                : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
            }`}
          >
            {city.name}
          </button>
        ))}

        {/* Favorite Locations List */}
        {savedLocations.length > 0 && (
          <>
            <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider ml-2 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Saved:
            </span>
            {savedLocations.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 rounded-full px-2.5 py-0.5 text-[11px] text-amber-200"
              >
                <button
                  onClick={() =>
                    onSelectLocation({
                      name: fav.name,
                      region: fav.region,
                      country: fav.country,
                      lat: fav.lat,
                      lon: fav.lon,
                    })
                  }
                  className="font-semibold hover:underline"
                >
                  {fav.name}
                </button>
                <button
                  onClick={() => onRemoveSavedLocation(fav.id)}
                  className="p-0.5 hover:text-rose-400 transition"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </header>
  );
}
