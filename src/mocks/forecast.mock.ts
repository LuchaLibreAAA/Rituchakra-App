import { DailyForecast } from '../types';

export const mockForecast: DailyForecast[] = [
  { day: 'Wed', date: '2026-08-28', rain: 5.4, prob: 99, maxTemp: 33.5, et0: 3.7, soil: 0.45, wb: 1.7, condition: 'rain' },
  { day: 'Thu', date: '2026-08-29', rain: 7.9, prob: 99, maxTemp: 32.0, et0: 3.4, soil: 0.45, wb: 4.5, condition: 'rain' },
  { day: 'Fri', date: '2026-08-30', rain: 42.5, prob: 99, maxTemp: 31.1, et0: 3.1, soil: 0.45, wb: 39.4, condition: 'rain', alert: 'FLOOD WATCH' },
  { day: 'Sat', date: '2026-08-31', rain: 11.7, prob: 99, maxTemp: 30.5, et0: 3.1, soil: 0.45, wb: 8.6, condition: 'rain' },
  { day: 'Sun', date: '2026-09-01', rain: 18.7, prob: 96, maxTemp: 30.4, et0: 3.2, soil: 0.45, wb: 15.5, condition: 'rain' },
  { day: 'Mon', date: '2026-09-02', rain: 9.3, prob: 83, maxTemp: 31.1, et0: 3.6, soil: 0.45, wb: 5.7, condition: 'rain' },
  { day: 'Tue', date: '2026-09-03', rain: 2.5, prob: 82, maxTemp: 32.0, et0: 3.9, soil: 0.43, wb: -1.4, condition: 'rain' },
];

export const mockForecastSummary = {
  rain7d: 93.5,
  waterBalance: 69.5,
  irrigate: 0,
  floodDays: 1,
};
