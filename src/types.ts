export type UnitSystem = 'metric' | 'imperial';

export interface LocationInfo {
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  timezone?: string;
  isLiveLocation?: boolean;
  accuracy?: number; // in meters
  suburb?: string;
}

export interface CurrentWeather {
  temp: number; // in C
  feelsLike: number; // in C
  humidity: number; // %
  windSpeed: number; // km/h
  windGust: number; // km/h
  windDirection: number; // degrees
  pressure: number; // hPa
  uvIndex: number;
  cloudCover: number; // %
  visibility: number; // km
  dewPoint: number; // in C
  weatherCode: number;
  isDay: number; // 1 or 0
  conditionText: string;
}

export interface HourlyForecast {
  time: string; // ISO or formatted
  hourLabel: string;
  temp: number;
  feelsLike: number;
  pop: number; // %
  precipitation: number; // mm
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  conditionText: string;
  isDay: number;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  monthName?: string;
  dayOfMonth?: number;
  tempMax: number;
  tempMin: number;
  pop: number; // %
  precipitation: number; // mm
  uvIndexMax: number;
  weatherCode: number;
  conditionText: string;
  sunrise: string;
  sunset: string;
  forecastType?: 'physics' | 'climate';
  confidenceScore?: number; // %
  humidityAvg?: number;
  windSpeedMax?: number;
}

export interface AirQualityData {
  usAqi: number; // 0 - 500
  euAqi: number;
  pm2_5: number;
  pm10: number;
  o3: number;
  no2: number;
  co: number;
  so2: number;
  grassPollen?: number;
  treePollen?: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  categoryColor: string;
}

export interface SunMoonData {
  sunrise: string;
  sunset: string;
  dayLength: string;
  solarNoon: string;
  moonPhase: string;
}

export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  airQuality: AirQualityData;
  sunMoon: SunMoonData;
  lastUpdated: string;
}

export interface AIOutfit {
  top: string;
  bottom: string;
  footwear: string;
  accessories: string[];
}

export interface AIActivity {
  name: string;
  score: number; // 1 to 10
  reason: string;
}

export interface AIWeatherInsights {
  summary: string;
  outfit: AIOutfit;
  activities: AIActivity[];
  healthTip: string;
  aiAnswer?: string;
}

export interface SavedLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  addedAt: number;
}
