import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  AlertCircle,
  Loader2,
  RefreshCw,
  Layers,
  Calendar,
  Wind,
  Bot,
  ArrowLeftRight,
  ShieldAlert,
} from 'lucide-react';
import { WeatherData, LocationInfo, UnitSystem, SavedLocation } from './types';
import { fetchWeatherForLocation } from './lib/weatherService';
import { HeaderNav } from './components/HeaderNav';
import { WeatherHeroBanner } from './components/WeatherHeroBanner';
import { WeatherRadarMap } from './components/WeatherRadarMap';
import { HourlyForecastSlider } from './components/HourlyForecastSlider';
import { DailyForecastList } from './components/DailyForecastList';
import { AirQualityCard } from './components/AirQualityCard';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { AIWeatherInsightsCard } from './components/AIWeatherInsightsCard';
import { WeatherComparison } from './components/WeatherComparison';
import { RefineLocationModal } from './components/RefineLocationModal';
import { CelestialDome } from './components/CelestialDome';
import { WindAeroCompass } from './components/WindAeroCompass';

export default function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState<boolean>(false);

  // Unit system (stored in localStorage)
  const [unit, setUnit] = useState<UnitSystem>(() => {
    return (localStorage.getItem('weather_unit') as UnitSystem) || 'metric';
  });

  // Saved Favorite Locations
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(() => {
    try {
      const saved = localStorage.getItem('weather_saved_locations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'airQuality' | 'aiAdvisor' | 'compare'>(
    'overview'
  );

  // Load weather for a specific lat/lon
  const loadWeather = useCallback(
    async (lat: number, lon: number, locationOverride?: { name?: string; region?: string; country?: string; isLive?: boolean; accuracy?: number }) => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const data = await fetchWeatherForLocation(lat, lon, locationOverride);
        setWeatherData(data);
      } catch (err: any) {
        console.error('Failed to load weather:', err);
        setErrorMessage('Unable to retrieve live weather data. Please check connection and retry.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Detect live location via GPS browser navigator
  const handleDetectLiveLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setErrorMessage('Geolocation is not supported by your browser.');
      // Fallback to default city London
      loadWeather(51.5074, -0.1278, { name: 'London', country: 'United Kingdom', isLive: false });
      return;
    }

    setIsLoadingLocation(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        loadWeather(latitude, longitude, { isLive: true, accuracy });
        setIsLoadingLocation(false);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setIsLoadingLocation(false);
        // Fallback default city (London)
        loadWeather(51.5074, -0.1278, { name: 'London', region: 'England', country: 'United Kingdom', isLive: false });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [loadWeather]);

  // Initial Load: Detect GPS or fallback
  useEffect(() => {
    handleDetectLiveLocation();
  }, [handleDetectLiveLocation]);

  // Unit Toggle
  const handleToggleUnit = () => {
    const nextUnit = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(nextUnit);
    localStorage.setItem('weather_unit', nextUnit);
  };

  // Add/Remove Saved Locations
  const handleSaveLocation = (loc: LocationInfo) => {
    const exists = savedLocations.some((s) => s.name === loc.name && Math.abs(s.lat - loc.lat) < 0.01);
    if (exists) return;

    const newSaved: SavedLocation = {
      id: `${loc.name}-${Date.now()}`,
      name: loc.name,
      region: loc.region,
      country: loc.country,
      lat: loc.lat,
      lon: loc.lon,
      addedAt: Date.now(),
    };

    const updated = [newSaved, ...savedLocations];
    setSavedLocations(updated);
    localStorage.setItem('weather_saved_locations', JSON.stringify(updated));
  };

  const handleRemoveSavedLocation = (id: string) => {
    const updated = savedLocations.filter((s) => s.id !== id);
    setSavedLocations(updated);
    localStorage.setItem('weather_saved_locations', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
      {/* Navigation Header */}
      <HeaderNav
        currentLocation={
          weatherData?.location || { name: 'Detecting Location...', region: '', country: '', lat: 0, lon: 0 }
        }
        onSelectLocation={(loc) => loadWeather(loc.lat, loc.lon, { name: loc.name, region: loc.region, country: loc.country, isLive: false })}
        onDetectLiveLocation={handleDetectLiveLocation}
        isLoadingLocation={isLoadingLocation}
        unit={unit}
        onToggleUnit={handleToggleUnit}
        savedLocations={savedLocations}
        onSaveLocation={handleSaveLocation}
        onRemoveSavedLocation={handleRemoveSavedLocation}
        onOpenRefineLocation={() => setIsRefineModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Error Banner if any */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={handleDetectLiveLocation}
              className="px-3 py-1 rounded-xl bg-rose-900 hover:bg-rose-800 text-rose-100 font-semibold"
            >
              Retry GPS
            </button>
          </div>
        )}

        {/* Global Loading Screen */}
        {isLoading && !weatherData ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8">
            <div className="p-4 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4 animate-pulse">
              <Compass className="w-10 h-10 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Detecting Live Weather Data...</h2>
            <p className="text-xs text-slate-400 max-w-sm">
              Connecting to global meteorological sensors, Doppler radar networks, and air quality stations.
            </p>
          </div>
        ) : weatherData ? (
          <>
            {/* Hero Banner Section */}
            <WeatherHeroBanner
              weatherData={weatherData}
              unit={unit}
              onRefresh={() => loadWeather(weatherData.location.lat, weatherData.location.lon, { name: weatherData.location.name, isLive: weatherData.location.isLiveLocation })}
              isRefreshing={isLoading}
              onOpenRefineLocation={() => setIsRefineModalOpen(true)}
            />

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Overview & Radar</span>
              </button>

              <button
                onClick={() => setActiveTab('aiAdvisor')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'aiAdvisor'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Bot className="w-4 h-4 text-amber-300" />
                <span>Gemini AI Advisor</span>
              </button>

              <button
                onClick={() => setActiveTab('forecast')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'forecast'
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>10-Day & Hourly</span>
              </button>

              <button
                onClick={() => setActiveTab('airQuality')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'airQuality'
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Wind className="w-4 h-4" />
                <span>Air Quality</span>
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'compare'
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Weather Compare</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW & RADAR */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 24-Hour Slider */}
                <HourlyForecastSlider hourly={weatherData.hourly} unit={unit} />

                {/* Radar Map & Gemini AI Box Side-by-Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <WeatherRadarMap
                    location={weatherData.location}
                    current={weatherData.current}
                    onSelectLocation={(loc) => loadWeather(loc.lat, loc.lon, loc)}
                  />
                  <AIWeatherInsightsCard weatherData={weatherData} />
                </div>

                {/* Aerodynamic Wind Vector & Barometer */}
                <WindAeroCompass current={weatherData.current} unit={unit} />

                {/* Celestial Track & Astronomy */}
                <CelestialDome sunMoon={weatherData.sunMoon} isDay={weatherData.current.isDay} />

                {/* Weather Metrics Grid */}
                <WeatherMetricsGrid current={weatherData.current} sunMoon={weatherData.sunMoon} unit={unit} />

                {/* Air Quality Card */}
                <AirQualityCard airQuality={weatherData.airQuality} />

                {/* 100-Day Forecast Horizon List */}
                <DailyForecastList daily={weatherData.daily} unit={unit} />
              </div>
            )}

            {/* TAB 2: GEMINI AI ADVISOR */}
            {activeTab === 'aiAdvisor' && (
              <div className="space-y-6">
                <AIWeatherInsightsCard weatherData={weatherData} />
                <HourlyForecastSlider hourly={weatherData.hourly} unit={unit} />
                <WindAeroCompass current={weatherData.current} unit={unit} />
              </div>
            )}

            {/* TAB 3: DETAILED FORECAST */}
            {activeTab === 'forecast' && (
              <div className="space-y-6">
                <HourlyForecastSlider hourly={weatherData.hourly} unit={unit} />
                <CelestialDome sunMoon={weatherData.sunMoon} isDay={weatherData.current.isDay} />
                <DailyForecastList daily={weatherData.daily} unit={unit} />
              </div>
            )}

            {/* TAB 4: AIR QUALITY */}
            {activeTab === 'airQuality' && (
              <div className="space-y-6">
                <AirQualityCard airQuality={weatherData.airQuality} />
                <WindAeroCompass current={weatherData.current} unit={unit} />
                <WeatherMetricsGrid current={weatherData.current} sunMoon={weatherData.sunMoon} unit={unit} />
              </div>
            )}

            {/* TAB 5: WEATHER COMPARE */}
            {activeTab === 'compare' && (
              <div className="space-y-6">
                <WeatherComparison currentWeatherData={weatherData} unit={unit} />
              </div>
            )}
          </>
        ) : null}
      </main>

      {/* Refine Location Modal */}
      {weatherData && (
        <RefineLocationModal
          isOpen={isRefineModalOpen}
          onClose={() => setIsRefineModalOpen(false)}
          currentLocation={weatherData.location}
          onSelectLocation={(loc) => {
            loadWeather(loc.lat, loc.lon, {
              name: loc.name,
              region: loc.region,
              country: loc.country,
              isLive: loc.isLiveLocation ?? false,
            });
            setIsRefineModalOpen(false);
          }}
          onDetectLiveLocation={handleDetectLiveLocation}
          isLoadingLocation={isLoadingLocation}
        />
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-300">Live Weather Detector & Intelligence</span>
          </div>
          <span>Powered by Open-Meteo Meteorological APIs & Gemini AI</span>
        </div>
      </footer>
    </div>
  );
}
