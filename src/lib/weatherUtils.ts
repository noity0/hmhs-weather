import { UnitSystem } from '../types';

export interface WeatherConditionInfo {
  code: number;
  label: string;
  iconName: 'Sun' | 'Moon' | 'CloudSun' | 'CloudMoon' | 'Cloud' | 'CloudFog' | 'CloudDrizzle' | 'CloudRain' | 'CloudSnow' | 'CloudLightning' | 'Zap';
  themeGradient: string;
  cardBg: string;
  effect: 'clear-day' | 'clear-night' | 'cloudy' | 'rain' | 'snow' | 'thunder' | 'fog';
}

export function getWeatherConditionInfo(code: number, isDay: number = 1): WeatherConditionInfo {
  // WMO Weather interpretation codes (Open-Meteo)
  switch (code) {
    case 0: // Clear sky
      return isDay
        ? {
            code,
            label: 'Clear & Sunny',
            iconName: 'Sun',
            themeGradient: 'from-amber-400 via-orange-500 to-sky-600',
            cardBg: 'bg-gradient-to-br from-amber-500/10 via-sky-500/5 to-amber-500/10 border-amber-500/20',
            effect: 'clear-day',
          }
        : {
            code,
            label: 'Clear Night',
            iconName: 'Moon',
            themeGradient: 'from-slate-900 via-indigo-950 to-blue-950',
            cardBg: 'bg-gradient-to-br from-indigo-900/30 to-slate-900/40 border-indigo-500/20',
            effect: 'clear-night',
          };
    case 1: // Mainly clear
    case 2: // Partly cloudy
      return isDay
        ? {
            code,
            label: 'Partly Cloudy',
            iconName: 'CloudSun',
            themeGradient: 'from-sky-400 via-blue-500 to-indigo-600',
            cardBg: 'bg-gradient-to-br from-sky-500/10 to-blue-600/10 border-sky-500/20',
            effect: 'cloudy',
          }
        : {
            code,
            label: 'Partly Cloudy',
            iconName: 'CloudMoon',
            themeGradient: 'from-slate-900 via-slate-800 to-indigo-950',
            cardBg: 'bg-gradient-to-br from-indigo-950/40 to-slate-900/40 border-indigo-500/20',
            effect: 'clear-night',
          };
    case 3: // Overcast
      return {
        code,
        label: 'Overcast',
        iconName: 'Cloud',
        themeGradient: 'from-slate-600 via-slate-700 to-slate-800',
        cardBg: 'bg-gradient-to-br from-slate-700/20 to-slate-900/30 border-slate-500/20',
        effect: 'cloudy',
      };
    case 45: // Fog
    case 48: // Depositing rime fog
      return {
        code,
        label: 'Foggy & Misty',
        iconName: 'CloudFog',
        themeGradient: 'from-zinc-500 via-slate-600 to-stone-700',
        cardBg: 'bg-gradient-to-br from-slate-500/15 to-stone-600/20 border-slate-400/20',
        effect: 'fog',
      };
    case 51: // Drizzle: Light
    case 53: // Drizzle: Moderate
    case 55: // Drizzle: Dense
    case 56: // Freezing Drizzle: Light
    case 57: // Freezing Drizzle: Dense
      return {
        code,
        label: 'Light Drizzle',
        iconName: 'CloudDrizzle',
        themeGradient: 'from-cyan-600 via-blue-700 to-slate-800',
        cardBg: 'bg-gradient-to-br from-cyan-500/15 to-blue-600/20 border-cyan-500/20',
        effect: 'rain',
      };
    case 61: // Rain: Slight
    case 63: // Rain: Moderate
    case 65: // Rain: Heavy
    case 66: // Freezing Rain: Light
    case 67: // Freezing Rain: Heavy
    case 80: // Rain showers: Slight
    case 81: // Rain showers: Moderate
    case 82: // Rain showers: Violent
      return {
        code,
        label: code >= 65 || code === 82 ? 'Heavy Rain' : 'Rain Showers',
        iconName: 'CloudRain',
        themeGradient: 'from-blue-700 via-slate-800 to-indigo-900',
        cardBg: 'bg-gradient-to-br from-blue-600/20 to-indigo-900/30 border-blue-500/25',
        effect: 'rain',
      };
    case 71: // Snow fall: Slight
    case 73: // Snow fall: Moderate
    case 75: // Snow fall: Heavy
    case 77: // Snow grains
    case 85: // Snow showers: Slight
    case 86: // Snow showers: Heavy
      return {
        code,
        label: 'Snowfall',
        iconName: 'CloudSnow',
        themeGradient: 'from-sky-300 via-indigo-400 to-slate-700',
        cardBg: 'bg-gradient-to-br from-sky-400/15 to-indigo-500/15 border-sky-300/30',
        effect: 'snow',
      };
    case 95: // Thunderstorm
    case 96: // Thunderstorm with slight hail
    case 99: // Thunderstorm with heavy hail
      return {
        code,
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
        themeGradient: 'from-indigo-900 via-purple-950 to-slate-900',
        cardBg: 'bg-gradient-to-br from-indigo-900/30 to-purple-950/40 border-purple-500/30',
        effect: 'thunder',
      };
    default:
      return {
        code,
        label: 'Varied Weather',
        iconName: 'Cloud',
        themeGradient: 'from-blue-600 via-indigo-700 to-slate-900',
        cardBg: 'bg-gradient-to-br from-blue-500/10 to-slate-800/20 border-slate-500/20',
        effect: 'cloudy',
      };
  }
}

// Unit Conversion Utilities
export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function kphToMph(kph: number): number {
  return Math.round(kph * 0.621371);
}

export function formatTemp(c: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    return `${cToF(c)}°F`;
  }
  return `${Math.round(c)}°C`;
}

export function formatSpeed(kph: number, unit: UnitSystem): string {
  if (unit === 'imperial') {
    return `${kphToMph(kph)} mph`;
  }
  return `${Math.round(kph)} km/h`;
}

// Air Quality Helpers
export function getAqiCategory(aqi: number): { name: string; color: string; badgeBg: string; textClass: string; desc: string } {
  if (aqi <= 50) {
    return {
      name: 'Good',
      color: '#10b981',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      textClass: 'text-emerald-400',
      desc: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    };
  }
  if (aqi <= 100) {
    return {
      name: 'Moderate',
      color: '#f59e0b',
      badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      textClass: 'text-amber-400',
      desc: 'Air quality is acceptable. However, sensitive individuals may experience minor symptoms.',
    };
  }
  if (aqi <= 150) {
    return {
      name: 'Unhealthy for Sensitive Groups',
      color: '#f97316',
      badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      textClass: 'text-orange-400',
      desc: 'Members of sensitive groups may experience health effects. The general public is unlikely to be affected.',
    };
  }
  if (aqi <= 200) {
    return {
      name: 'Unhealthy',
      color: '#ef4444',
      badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      textClass: 'text-rose-400',
      desc: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
    };
  }
  if (aqi <= 300) {
    return {
      name: 'Very Unhealthy',
      color: '#a855f7',
      badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      textClass: 'text-purple-400',
      desc: 'Health alert: The risk of health effects is increased for everyone.',
    };
  }
  return {
    name: 'Hazardous',
    color: '#881337',
    badgeBg: 'bg-rose-950/40 text-rose-300 border-rose-700/50',
    textClass: 'text-rose-300',
    desc: 'Health warning of emergency conditions: Everyone is more likely to be affected.',
  };
}

// Wind direction compass angle to N, NE, E, SE, S, SW, W, NW
export function getWindDirectionLabel(degree: number): string {
  const val = Math.floor(degree / 22.5 + 0.5);
  const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return arr[val % 16] || 'N';
}

// Moon phase estimation
export function getMoonPhaseName(dayOfCycle: number): string {
  if (dayOfCycle < 1.84) return 'New Moon';
  if (dayOfCycle < 5.53) return 'Waxing Crescent';
  if (dayOfCycle < 9.22) return 'First Quarter';
  if (dayOfCycle < 12.91) return 'Waxing Gibbous';
  if (dayOfCycle < 16.61) return 'Full Moon';
  if (dayOfCycle < 20.3) return 'Waning Gibbous';
  if (dayOfCycle < 23.99) return 'Last Quarter';
  if (dayOfCycle < 27.68) return 'Waning Crescent';
  return 'New Moon';
}
