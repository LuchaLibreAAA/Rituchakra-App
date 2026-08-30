import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { UrlTile, WMSTile, Polygon } from 'react-native-maps';
import { Layers, CloudRain, Map as MapIcon, X } from 'lucide-react-native';
import { useMapLayers, useMapRadar, useMapWeatherGrid } from '../../src/api/client';
import { useLocation } from '../../src/context/LocationContext';

export default function MapsScreen() {
  const { location } = useLocation();
  const { data: layersData, isLoading: layersLoading } = useMapLayers();
  const { data: radarData } = useMapRadar();
  
  const [selectedBasemap, setSelectedBasemap] = useState<string>('dark');
  const [selectedWeather, setSelectedWeather] = useState<string>('none');
  const [selectedOverlay, setSelectedOverlay] = useState<string>('none');
  const [showMenu, setShowMenu] = useState(false);

  // Fetch weather grid if a weather layer (not radar/none) is selected
  const isGridWeather = selectedWeather !== 'none' && selectedWeather !== 'radar' && selectedWeather !== 'satellite';
  const { data: gridData, isLoading: gridLoading } = useMapWeatherGrid(isGridWeather ? selectedWeather : 'none');

  // Determine active basemap URL
  const activeBasemap = layersData?.basemaps.find(b => b.id === selectedBasemap);
  const basemapUrl = activeBasemap?.url || 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

  // Determine active WMS overlay
  const activeWms = layersData?.overlays.find(o => o.id === selectedOverlay);

  // Radar URL
  const latestRadar = radarData?.radar?.[radarData.radar.length - 1];
  const radarUrl = latestRadar ? `${radarData.host}${latestRadar.path}/256/{z}/{x}/{y}/2/1_1.png` : null;

  // Grid rendering logic
  const renderGridPolygons = () => {
    if (!gridData || !gridData.ok || !gridData.fields[selectedWeather]) return null;
    const lats = gridData.lats;
    const lons = gridData.lons;
    const values = gridData.fields[selectedWeather];
    const polys = [];
    
    let minVal = Math.min(...values);
    let maxVal = Math.max(...values);
    if (minVal === maxVal) maxVal = minVal + 1; // Prevent div by 0

    const latStep = (lats[lats.length - 1] - lats[0]) / (lats.length - 1);
    const lonStep = (lons[lons.length - 1] - lons[0]) / (lons.length - 1);

    for (let y = 0; y < lats.length - 1; y++) {
      for (let x = 0; x < lons.length - 1; x++) {
        const idx = y * lons.length + x;
        const val = values[idx];
        if (val == null) continue;

        // Normalize value between 0 and 1
        const norm = (val - minVal) / (maxVal - minVal);
        
        // Color scale (Blue -> Yellow -> Red)
        const r = Math.floor(255 * norm);
        const g = Math.floor(255 * (1 - Math.abs(norm - 0.5) * 2));
        const b = Math.floor(255 * (1 - norm));
        const color = `rgba(${r}, ${g}, ${b}, 0.35)`;

        polys.push(
          <Polygon
            key={`grid-${x}-${y}`}
            coordinates={[
              { latitude: lats[y], longitude: lons[x] },
              { latitude: lats[y + 1], longitude: lons[x] },
              { latitude: lats[y + 1], longitude: lons[x + 1] },
              { latitude: lats[y], longitude: lons[x + 1] },
            ]}
            fillColor={color}
            strokeWidth={0}
          />
        );
      }
    }
    return polys;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map View */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.lat || 22.5,
          longitude: location.lon || 88.3,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
        mapType="none" // Custom basemap using UrlTile
      >
        {/* Basemap */}
        <UrlTile urlTemplate={basemapUrl} maximumZ={19} zIndex={-1} />

        {/* WMS Overlay */}
        {activeWms && activeWms.type === 'wms' && (
          <WMSTile
            urlTemplate={`${activeWms.url}?service=WMS&request=GetMap&layers=${activeWms.layers}&styles=&format=image/png&transparent=true&version=1.1.1&height=256&width=256&srs=EPSG:3857&bbox={minX},{minY},{maxX},{maxY}`}
            zIndex={1}
            opacity={0.7}
          />
        )}

        {/* Radar Overlay */}
        {selectedWeather === 'radar' && radarUrl && (
          <UrlTile urlTemplate={radarUrl} zIndex={2} opacity={0.6} />
        )}

        {/* Weather Grid Overlay */}
        {isGridWeather && renderGridPolygons()}
      </MapView>

      {/* Loading Indicator */}
      {(layersLoading || gridLoading) && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0284c7" />
        </View>
      )}

      {/* Floating Menu Button */}
      <TouchableOpacity style={styles.menuBtn} onPress={() => setShowMenu(true)}>
        <Layers color="#fff" size={24} />
      </TouchableOpacity>

      {/* Side Menu */}
      {showMenu && (
        <View style={styles.menuPanel}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Map Layers</Text>
            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <X color="#64748b" size={24} />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.menuScroll}>
            {/* BASEMAPS */}
            <Text style={styles.sectionTitle}>BASEMAP</Text>
            <View style={styles.pillContainer}>
              {layersData?.basemaps.map(b => (
                <TouchableOpacity 
                  key={b.id} 
                  style={[styles.pill, selectedBasemap === b.id && styles.pillActive]}
                  onPress={() => setSelectedBasemap(b.id)}
                >
                  <Text style={[styles.pillText, selectedBasemap === b.id && styles.pillTextActive]}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* WEATHER */}
            <Text style={styles.sectionTitle}>WEATHER</Text>
            <View style={styles.pillContainer}>
              <TouchableOpacity 
                style={[styles.pill, selectedWeather === 'none' && styles.pillActive]}
                onPress={() => setSelectedWeather('none')}
              >
                <Text style={[styles.pillText, selectedWeather === 'none' && styles.pillTextActive]}>None</Text>
              </TouchableOpacity>
              {layersData?.weather.map(w => (
                <TouchableOpacity 
                  key={w.id} 
                  style={[styles.pill, selectedWeather === w.id && styles.pillActive]}
                  onPress={() => setSelectedWeather(w.id)}
                >
                  <Text style={[styles.pillText, selectedWeather === w.id && styles.pillTextActive]}>{w.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* OVERLAYS */}
            <Text style={styles.sectionTitle}>OVERLAYS</Text>
            <View style={styles.pillContainer}>
              <TouchableOpacity 
                style={[styles.pill, selectedOverlay === 'none' && styles.pillActive]}
                onPress={() => setSelectedOverlay('none')}
              >
                <Text style={[styles.pillText, selectedOverlay === 'none' && styles.pillTextActive]}>None</Text>
              </TouchableOpacity>
              {layersData?.overlays.map(o => (
                <TouchableOpacity 
                  key={o.id} 
                  style={[styles.pill, selectedOverlay === o.id && styles.pillActive]}
                  onPress={() => setSelectedOverlay(o.id)}
                >
                  <Text style={[styles.pillText, selectedOverlay === o.id && styles.pillTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  map: { ...StyleSheet.absoluteFillObject },
  loader: {
    position: 'absolute', top: '50%', left: '50%',
    marginLeft: -20, marginTop: -20,
    backgroundColor: '#fff', padding: 10, borderRadius: 20, elevation: 5,
  },
  menuBtn: {
    position: 'absolute', bottom: 30, right: 20,
    backgroundColor: '#0284c7', width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  menuPanel: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 300, backgroundColor: '#f8fafc',
    borderLeftWidth: 1, borderColor: '#e2e8f0',
    elevation: 10,
    shadowColor: '#000', shadowOffset: { width: -2, height: 0 }, shadowOpacity: 0.1, shadowRadius: 8,
  },
  menuHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 1, borderColor: '#e2e8f0',
  },
  menuTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  menuScroll: { padding: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', marginTop: 10, marginBottom: 12, letterSpacing: 1 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  pill: {
    backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1',
  },
  pillActive: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  pillText: { fontSize: 14, color: '#334155', fontWeight: '500' },
  pillTextActive: { color: '#fff', fontWeight: '600' },
});
