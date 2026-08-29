import React, { useState } from 'react';
import { MapPin, Search, Compass, Check, X, Sliders, Target, Loader2 } from 'lucide-react';
import { LocationInfo } from '../types';
import { searchLocations, reverseGeocode } from '../lib/weatherService';

interface RefineLocationModalProps {
  currentLocation: LocationInfo;
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationInfo) => void;
  onDetectLiveLocation: () => void;
  isLoadingLocation: boolean;
}

export function RefineLocationModal({
  currentLocation,
  isOpen,
  onClose,
  onSelectLocation,
  onDetectLiveLocation,
  isLoadingLocation,
}: RefineLocationModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Manual Coordinates State
  const [customLat, setCustomLat] = useState<string>(currentLocation.lat.toString());
  const [customLon, setCustomLon] = useState<string>(currentLocation.lon.toString());
  const [customName, setCustomName] = useState<string>(currentLocation.name);
  const [isGeocodingCoords, setIsGeocodingCoords] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchLocations(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleApplyCoordinates = async () => {
    const parsedLat = parseFloat(customLat);
    const parsedLon = parseFloat(customLon);

    if (isNaN(parsedLat) || isNaN(parsedLon) || parsedLat < -90 || parsedLat > 90 || parsedLon < -180 || parsedLon > 180) {
      alert('Please enter valid Latitude (-90 to 90) and Longitude (-180 to 180).');
      return;
    }

    setIsGeocodingCoords(true);
    try {
      const geoLoc = await reverseGeocode(parsedLat, parsedLon);
      onSelectLocation({
        name: customName.trim() || geoLoc.name,
        region: geoLoc.region,
        country: geoLoc.country,
        lat: parsedLat,
        lon: parsedLon,
        isLiveLocation: false,
      });
      onClose();
    } catch {
      onSelectLocation({
        name: customName.trim() || `Pin (${parsedLat.toFixed(3)}°, ${parsedLon.toFixed(3)}°)`,
        region: '',
        country: '',
        lat: parsedLat,
        lon: parsedLon,
        isLiveLocation: false,
      });
      onClose();
    } finally {
      setIsGeocodingCoords(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-white space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Refine Location Precision</h3>
              <p className="text-xs text-slate-400">Pinpoint exact GPS, enter coordinates, or search address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live GPS Re-Detect Section */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Detect Device High-Accuracy GPS</span>
              {currentLocation.accuracy && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full font-mono">
                  ±{Math.round(currentLocation.accuracy)}m Accuracy
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Current: {currentLocation.name} ({currentLocation.lat.toFixed(4)}°, {currentLocation.lon.toFixed(4)}°)
            </span>
          </div>

          <button
            onClick={() => {
              onDetectLiveLocation();
              onClose();
            }}
            disabled={isLoadingLocation}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
          >
            {isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
            <span>Re-Detect</span>
          </button>
        </div>

        {/* Option A: Search precise location/address */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Search Address, City, or Postal Code
          </label>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Manhattan NY, 90210, Shoreditch London..."
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-10 pr-24 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2 top-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-sky-400 font-semibold"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search Results List */}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 divide-y divide-slate-800/80">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectLocation(result);
                    onClose();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800 text-xs text-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <div>
                      <span className="font-bold">{result.name}</span>
                      <span className="text-[10px] text-slate-400 ml-1">
                        ({result.region ? `${result.region}, ` : ''}{result.country})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {result.lat.toFixed(2)}°, {result.lon.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Option B: Enter Exact Coordinates Directly */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Set Precise Latitude & Longitude
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Latitude</span>
              <input
                type="number"
                step="any"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                placeholder="e.g. 51.5074"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Longitude</span>
              <input
                type="number"
                step="any"
                value={customLon}
                onChange={(e) => setCustomLon(e.target.value)}
                placeholder="e.g. -0.1278"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 block mb-1">Custom Location Name (Optional)</span>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Home Office, Beach House..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={handleApplyCoordinates}
            disabled={isGeocodingCoords}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition shadow-lg flex items-center justify-center gap-2"
          >
            {isGeocodingCoords ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Apply Coordinates & Update Weather</span>
          </button>
        </div>

        {/* Tip for Interactive Map */}
        <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Pro Tip: You can also click anywhere directly on the Interactive Radar Map to move your weather pin!</span>
        </div>
      </div>
    </div>
  );
}
