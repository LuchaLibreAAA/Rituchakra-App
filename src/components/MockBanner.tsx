import { View, Text, StyleSheet } from 'react-native';
import { lastDataSource } from '../api/client';

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

export function MockBanner() {
  if (!USE_MOCKS && lastDataSource === 'live') return null;

  const label = USE_MOCKS
    ? 'MOCK DATA'
    : lastDataSource === 'fallback'
      ? 'OFFLINE — FALLBACK DATA'
      : 'MOCK DATA';

  const bgColor = lastDataSource === 'fallback' ? '#f59e0b' : '#ef4444';

  return (
    <View style={[styles.banner, { backgroundColor: bgColor }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  text: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
