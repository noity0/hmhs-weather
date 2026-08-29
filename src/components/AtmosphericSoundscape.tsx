import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { weatherAudio } from '../lib/audioSynthesizer';

interface AtmosphericSoundscapeProps {
  effect: 'clear-day' | 'clear-night' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'fog';
}

export function AtmosphericSoundscape({ effect }: AtmosphericSoundscapeProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.6);
  const [showSlider, setShowSlider] = useState<boolean>(false);

  useEffect(() => {
    if (isPlaying) {
      weatherAudio.setWeatherMode(effect);
    }
  }, [effect, isPlaying]);

  const handleToggle = () => {
    const active = weatherAudio.togglePlay(effect);
    setIsPlaying(active);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    weatherAudio.setVolume(val);
  };

  const getEffectSoundLabel = () => {
    switch (effect) {
      case 'rain':
        return 'Binaural Rain Soundscape';
      case 'thunder':
        return 'Thunderstorm & Rainscape';
      case 'snow':
        return 'Subtle Winter Wind';
      case 'clear-night':
        return 'Night Sky & Crickets';
      case 'clear-day':
      default:
        return 'Natural Ambient Breeze';
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 bg-white/15 hover:bg-white/20 border border-white/20 rounded-2xl p-1 px-2.5 backdrop-blur-md transition shadow-md">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 text-xs font-semibold text-white focus:outline-none"
          title="Toggle Procedural Atmospheric Soundscape"
        >
          {isPlaying ? (
            <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <Volume2 className="w-4 h-4 animate-pulse" />
              <span className="text-[11px] hidden sm:inline">{getEffectSoundLabel()}</span>
              <span className="text-[11px] sm:hidden">Audio On</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-200">
              <VolumeX className="w-4 h-4 text-slate-300" />
              <span className="text-[11px] hidden sm:inline">Nature Audio</span>
            </div>
          )}
        </button>

        {isPlaying && (
          <button
            onClick={() => setShowSlider(!showSlider)}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition ml-1"
            title="Adjust Volume"
          >
            <Sliders className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Volume Popup Slider */}
      {showSlider && isPlaying && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-xl flex items-center gap-2 min-w-[150px]">
          <VolumeX className="w-3 h-3 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <Volume2 className="w-3 h-3 text-emerald-400" />
        </div>
      )}
    </div>
  );
}
