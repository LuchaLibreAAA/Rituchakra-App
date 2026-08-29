import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MockBanner } from '../../src/components/MockBanner';

export default function MapsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <MockBanner />
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>🗺️</Text>
          <Text style={styles.mapLabel}>Map View</Text>
          <Text style={styles.mapSub}>Haldia, West Bengal</Text>
          <Text style={styles.mapNote}>
            Map requires native build (react-native-maps).{'\n'}
            Stubbed for Expo Go compatibility.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e0f2fe' },
  mapContainer: { flex: 1 },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  mapPlaceholderText: { fontSize: 64 },
  mapLabel: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginTop: 8 },
  mapSub: { fontSize: 14, color: '#475569', marginTop: 4 },
  mapNote: { fontSize: 12, color: '#94a3b8', marginTop: 16, textAlign: 'center', paddingHorizontal: 32 },
});
