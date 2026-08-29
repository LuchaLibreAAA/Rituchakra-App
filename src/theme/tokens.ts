export const tokens = {
  colors: {
    background: '#e0f2fe',
    card: '#ffffff',
    text: {
      primary: '#1e293b',
      secondary: '#475569',
    },
    primary: '#0369a1',
    cardBackgrounds: {
      sky: '#bfdbfe',
      rain: '#99f6e4',
      riskExtreme: '#fee2e2',
      riskAlert: '#e0f2fe',
      market: '#f0fdf4',
    },
    borders: {
      default: '#cbd5e1',
      active: '#38bdf8',
      risk: '#ef4444',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    md: 12,
    lg: 16,
    xl: 24,
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
    },
  },
};
