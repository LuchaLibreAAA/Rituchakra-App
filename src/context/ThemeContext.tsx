import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#F8FAFC',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  primary: '#0369a1',
  skyCard: '#E0F2FE',
  skyBorder: '#BAE6FD',
  rainCard: '#CCFBF1',
  rainBorder: '#99F6E4',
  windCard: '#DCFCE7',
  windBorder: '#BBF7D0',
  alertCard: '#FFEDD5',
  alertBorder: '#FED7AA',
  backgroundGradient: ['#e0f2fe', '#bae6fd'], // light sky gradient
};

const darkColors = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
  primary: '#38bdf8',
  skyCard: '#075985',
  skyBorder: '#0369a1',
  rainCard: '#115e59',
  rainBorder: '#0f766e',
  windCard: '#166534',
  windBorder: '#15803d',
  alertCard: '#9a3412',
  alertBorder: '#c2410c',
  backgroundGradient: ['#0f172a', '#1e293b'], // dark slate gradient
};

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(systemTheme === 'dark' ? 'dark' : 'light');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
