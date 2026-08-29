export interface HourlyForecast {
  time: string;
  rain: number;
  condition: string;
}

export interface DailyForecast {
  day: string;
  date?: string;
  maxTemp: number;
  minTemp?: number;
  condition: string;
  rain?: number;
  prob?: number;
  et0?: number;
  soil?: number;
  wb?: number;
  alert?: string;
}

export interface WeatherAction {
  id: string;
  description: string;
  timeframe: string;
}

export interface HazardRisk {
  id: string;
  type: 'extreme' | 'alert' | 'aqi' | 'marine' | 'quake';
  title: string;
  description: string;
  source: string;
}

export interface DashboardSnapshot {
  location: string;
  time: string;
  sky: {
    temp: number;
    condition: string;
    nightTemp: number;
    visibility: number;
    rainThisHour: number;
  };
  todayRain: {
    amount: number;
    probDay1: number;
    probDay2: number;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  risks: HazardRisk[];
  actions: WeatherAction[];
}

export interface LiveStormMetric {
  id: string;
  label: string;
  value: string | number;
  subValue?: string;
}

export interface KalmanDataPoint {
  time: string;
  rate: number;
}

export interface AnalyticsSnapshot {
  metrics: LiveStormMetric[];
  kalman: {
    liveRate: number;
    lastError: number;
    updates: number;
    nextScene: string;
    data: KalmanDataPoint[];
  };
}

export interface MarketPrice {
  id: string;
  crop: string;
  market: string;
  price: number;
}

export interface GeoLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  isFavorite?: boolean;
}

