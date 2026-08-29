import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Play, Pause, Layers, Maximize2, Minimize2, MapPin, RefreshCw, MousePointer } from 'lucide-react';
import { LocationInfo, CurrentWeather } from '../types';
import { reverseGeocode } from '../lib/weatherService';

interface WeatherRadarMapProps {
  location: LocationInfo;
  current: CurrentWeather;
  onSelectLocation?: (loc: LocationInfo) => void;
}

export function WeatherRadarMap({ location, current, onSelectLocation }: WeatherRadarMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<'standard' | 'satellite'>('standard');
  const [showRadar, setShowRadar] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [radarTimestamps, setRadarTimestamps] = useState<number[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoadingRadar, setIsLoadingRadar] = useState<boolean>(true);

  // Fetch RainViewer radar timestamps
  useEffect(() => {
    let isMounted = true;
    async function fetchRadarTimestamps() {
      try {
        setIsLoadingRadar(true);
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) throw new Error('Radar metadata failed');
        const data = await res.json();
        const pastFrames = data.radar?.past || [];
        const nowFrames = data.radar?.nowcast || [];
        const all = [...pastFrames, ...nowFrames].map((item: any) => item.time);
        if (isMounted && all.length > 0) {
          setRadarTimestamps(all);
          setCurrentFrameIndex(all.length - 1); // Latest frame
        }
      } catch (err) {
        console.warn('RainViewer fetch error:', err);
      } finally {
        if (isMounted) setIsLoadingRadar(false);
      }
    }
    fetchRadarTimestamps();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Map with performance options
      const map = L.map(mapContainerRef.current, {
        center: [location.lat, location.lon],
        zoom: 10,
        zoomControl: false,
        preferCanvas: true,
        wheelDebounceTime: 40,
        fadeAnimation: true,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Base Tile Layer
      const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
        updateWhenZooming: false,
        updateWhenIdle: true,
      });
      baseLayer.addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([location.lat, location.lon], mapInstanceRef.current.getZoom() || 10, {
        animate: true,
        duration: 0.8,
      });
    }

    // Click handler for pinpointing location
    if (mapInstanceRef.current && onSelectLocation) {
      mapInstanceRef.current.off('click');
      mapInstanceRef.current.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        try {
          const loc = await reverseGeocode(lat, lng);
          onSelectLocation(loc);
        } catch {
          onSelectLocation({
            name: `Pinned (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
            region: '',
            country: '',
            lat,
            lon: lng,
            isLiveLocation: false,
          });
        }
      });
    }

    // Custom Weather Marker
    if (mapInstanceRef.current) {
      if (markerRef.current) {
        markerRef.current.remove();
      }

      const customIcon = L.divIcon({
        className: 'custom-weather-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-sky-400 opacity-75"></span>
            <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 text-white border border-sky-400/50 shadow-xl text-xs font-semibold backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>${Math.round(current.temp)}°C</span>
            </div>
          </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 20],
      });

      const marker = L.marker([location.lat, location.lon], { icon: customIcon }).addTo(mapInstanceRef.current);
      marker.bindPopup(`
        <div class="p-1 font-sans text-slate-900">
          <div class="font-bold text-sm">${location.name}</div>
          <div class="text-xs text-slate-600">${location.region ? location.region + ', ' : ''}${location.country}</div>
          <div class="mt-1 text-xs font-semibold text-sky-600">${current.conditionText} • ${Math.round(current.temp)}°C</div>
        </div>
      `);
      markerRef.current = marker;
    }

    return () => {
      // Clean up map instance on complete unmount
    };
  }, [location.lat, location.lon, current.temp, current.conditionText, onSelectLocation]);

  // Update Base Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer && layer !== radarLayerRef.current) {
        mapInstanceRef.current?.removeLayer(layer);
      }
    });

    if (activeLayer === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, Maxar, Earthstar Geographics',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);
    }
  }, [activeLayer]);

  // Update Radar Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (radarLayerRef.current) {
      mapInstanceRef.current.removeLayer(radarLayerRef.current);
      radarLayerRef.current = null;
    }

    if (showRadar && radarTimestamps.length > 0) {
      const time = radarTimestamps[currentFrameIndex];
      if (time) {
        // RainViewer Tile format: https://tilecache.rainviewer.com/v2/radar/{time}/256/{z}/{x}/{y}/2/1_1.png
        const radar = L.tileLayer(`https://tilecache.rainviewer.com/v2/radar/${time}/256/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.65,
          zIndex: 100,
        });
        radar.addTo(mapInstanceRef.current);
        radarLayerRef.current = radar;
      }
    }
  }, [showRadar, radarTimestamps, currentFrameIndex]);

  // Animation Loop for Radar
  useEffect(() => {
    let interval: any = null;
    if (isAnimating && radarTimestamps.length > 0) {
      interval = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % radarTimestamps.length);
      }, 700);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAnimating, radarTimestamps.length]);

  const frameTimeFormatted =
    radarTimestamps.length > 0 && radarTimestamps[currentFrameIndex]
      ? new Date(radarTimestamps[currentFrameIndex] * 1000).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Live';

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-slate-700/50 bg-slate-900 shadow-2xl transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[380px] sm:h-[440px]'
      }`}
    >
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/60 shadow-lg text-white">
          <MapPin className="w-4 h-4 text-sky-400" />
          <div>
            <h4 className="text-xs font-semibold leading-none">{location.name} Radar</h4>
            <span className="text-[10px] text-slate-400">Precipitation & Cloud Detection</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-sky-950/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-sky-800/50 text-sky-300 text-[11px] font-medium shadow">
          <MousePointer className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Click anywhere on map to move weather pin</span>
        </div>
      </div>

      {/* Map Control Buttons Top Right */}
      <div className="absolute top-4 right-14 z-[400] flex items-center gap-1.5">
        <button
          onClick={() => setActiveLayer(activeLayer === 'standard' ? 'satellite' : 'standard')}
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/60 hover:bg-slate-800 transition shadow"
          title="Toggle Satellite Base Layer"
        >
          <Layers className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowRadar(!showRadar)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-medium backdrop-blur-md transition shadow ${
            showRadar
              ? 'bg-sky-500/20 text-sky-300 border-sky-400/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-700/60'
          }`}
        >
          {showRadar ? 'Radar Active' : 'Radar Off'}
        </button>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/60 hover:bg-slate-800 transition shadow"
          title={isExpanded ? 'Minimize Map' : 'Expand Map'}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Radar Timeline Control Bar (Bottom Overlay) */}
      {showRadar && (
        <div className="absolute bottom-4 left-4 right-4 z-[400] bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-2xl p-2.5 px-4 shadow-xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              disabled={isLoadingRadar || radarTimestamps.length === 0}
              className="w-9 h-9 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center font-bold transition shadow disabled:opacity-50"
            >
              {isAnimating ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
            <div>
              <div className="text-xs font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Precipitation Radar</span>
                <span className="text-sky-400 font-mono text-[11px] bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800/50">
                  {frameTimeFormatted}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Live Doppler sweep over {location.name}</div>
            </div>
          </div>

          {/* Radar Frame Slider */}
          {radarTimestamps.length > 0 && (
            <div className="flex-1 max-w-xs mx-2">
              <input
                type="range"
                min={0}
                max={radarTimestamps.length - 1}
                value={currentFrameIndex}
                onChange={(e) => {
                  setIsAnimating(false);
                  setCurrentFrameIndex(parseInt(e.target.value));
                }}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          )}

          {/* Radar Color Scale Legend */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-300">
            <span>Light</span>
            <div className="h-2 w-16 rounded bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 to-rose-600"></div>
            <span>Heavy</span>
          </div>
        </div>
      )}
    </div>
  );
}
