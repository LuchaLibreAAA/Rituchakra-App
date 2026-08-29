import { AnalyticsSnapshot } from '../types';

export const mockAnalytics: AnalyticsSnapshot = {
  metrics: [
    { id: '1', label: 'LIGHTNING', value: 'QUIET' },
    { id: '2', label: 'CLOUDBURST', value: 'QUIET', subValue: '0 mm/h' },
    { id: '3', label: 'DOWNBURST', value: 'QUIET', subValue: '18.4 km/h' },
    { id: '4', label: 'CELL RAIN', value: '0', subValue: 'mm/h \n imd-insat-ir1' },
    { id: '5', label: 'TO ONSET', value: '9m 32s' },
    { id: '6', label: 'HUGLI TIDE', value: '0.7 m' },
    { id: '7', label: 'PONDING', value: '0.0 mm' },
    { id: '8', label: 'THIS MINUTE', value: '0.00 mm/h' },
    { id: '9', label: 'PUMP SET', value: 'OK' },
    { id: '10', label: 'FIELD', value: 'Enterable' },
    { id: '11', label: 'STORM WATCH', value: 'No urgent bulletin' },
  ],
  kalman: {
    liveRate: 0.06,
    lastError: -0.07,
    updates: 643,
    nextScene: '29m 29s',
    data: Array.from({ length: 120 }, (_, i) => ({
      time: `0${Math.floor(i/60)+7}:${i%60 < 10 ? '0' : ''}${i%60} pm`,
      rate: Math.random() * 0.06,
    })),
  }
};
