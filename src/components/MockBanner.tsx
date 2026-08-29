import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { lastDataSource } from '../api/client';

export function MockBanner() {
  if (lastDataSource === 'live') return null; // Don't show banner for live data
  
  const isError = lastDataSource === 'error';
  
  return (
    <View style={[styles.banner, isError ? styles.errorBanner : styles.fallbackBanner]}>
      <Text style={styles.bannerText}>
        {isError ? '⚠️ Connection error — showing cached data' : '🔄 Loading from backend…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { paddingVertical: 4, paddingHorizontal: 12, alignItems: 'center' },
  fallbackBanner: { backgroundColor: '#fef3c7' },
  errorBanner: { backgroundColor: '#fee2e2' },
  bannerText: { fontSize: 11, fontWeight: '500', color: '#92400e' },
});
