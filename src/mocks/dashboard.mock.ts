import { DashboardSnapshot, HazardRisk, WeatherAction } from '../types';

export const mockActions: WeatherAction[] = [
  {
    id: '1',
    description: 'Move livestock, seed, and pumps to higher ground; clear local drains; avoid low-lying fields.',
    timeframe: 'Before the next heavy pulse',
  },
  {
    id: '2',
    description: 'Do not irrigate in the next 24 hours — heavy rain is likely.',
    timeframe: 'Next 24 hours',
  }
];

export const mockRisks: HazardRisk[] = [
  {
    id: '1',
    type: 'extreme',
    title: 'EXTREME: Extremely heavy rainfall warning — Haldia.',
    description: 'IMD-CAP • 17 AUG, 02:48 PM',
    source: 'IMD-CAP',
  },
  {
    id: '2',
    type: 'alert',
    title: 'ALERT: River discharge is rising.',
    description: 'Open-Meteo GloFAS trend is rising.',
    source: 'OPEN-METEO-FLOOD',
  },
  {
    id: '3',
    type: 'aqi',
    title: 'AQI: 56',
    description: 'Satisfactory',
    source: 'CPCB/data.gov.in realtime',
  },
  {
    id: '4',
    type: 'marine',
    title: 'MARINE: 0.3 m S',
    description: 'Haldia - 0 km',
    source: 'open-meteo-marine',
  },
  {
    id: '5',
    type: 'quake',
    title: 'NEAREST QUAKE:',
    description: 'M4.2 • 736 km',
    source: 'USGS FDSN',
  }
];

export const mockDashboard: DashboardSnapshot = {
  location: 'Haldia, West Bengal',
  time: '07:49 pm',
  sky: {
    temp: 27.1,
    condition: 'Light drizzle',
    nightTemp: 31.7,
    visibility: 4.1,
    rainThisHour: 0.1,
  },
  todayRain: {
    amount: 5.4,
    probDay1: 98,
    probDay2: 99,
  },
  hourly: [
    { time: '17:00', rain: 0.1, condition: 'rain' },
    { time: '19:00', rain: 0.2, condition: 'rain' },
    { time: '21:00', rain: 0.1, condition: 'rain' },
    { time: '23:00', rain: 0.7, condition: 'rain' },
    { time: '25:00', rain: 0.3, condition: 'rain' },
    { time: '27:00', rain: 0.3, condition: 'rain' },
    { time: '00:00', rain: 0.2, condition: 'rain' },
    { time: '01:00', rain: 0.1, condition: 'rain' },
  ],
  daily: [
    { day: 'Fri', maxTemp: 33.5, minTemp: 31.7, condition: 'partly-cloudy', alert: 'High/low' },
    { day: 'Sat', maxTemp: 32.0, minTemp: 31.5, condition: 'partly-cloudy', alert: 'High/low' },
    { day: 'Sun', maxTemp: 31.1, minTemp: 30.5, condition: 'partly-cloudy', alert: 'High/low' },
    { day: 'Mon', maxTemp: 30.5, minTemp: 29.5, condition: 'partly-cloudy', alert: 'High/low' },
    { day: 'Tue', maxTemp: 30.0, minTemp: 29.0, condition: 'partly-cloudy', alert: 'High/low' },
    { day: 'Wed', maxTemp: 30.5, minTemp: 29.5, condition: 'partly-cloudy', alert: 'High/low' },
    { day: 'Thu', maxTemp: 32.5, minTemp: 31.0, condition: 'partly-cloudy', alert: 'High/low' },
  ],
  actions: mockActions,
  risks: mockRisks,
};
