import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Map, Construction } from 'lucide-react-native';

export default function MapsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Map color="#0ea5e9" size={64} />
          <Construction color="#f59e0b" size={32} style={styles.badge} />
        </View>
        <Text style={styles.title}>Maps</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.description}>
          Interactive weather maps with radar overlays,{'\n'}
          satellite imagery, and Bhuvan WMS layers{'\n'}
          are being built for this tab.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b3d4e9' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0ea5e9',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
  },
});
