import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Layers, X, MapPin } from 'lucide-react-native';
import { useLocation } from '../../src/context/LocationContext';
import { useMapLayers, useMapRadar } from '../../src/api/client';
import { MapLayer } from '../../src/types';

export default function MapsScreen() {
  const { location } = useLocation();
  const { data: layersData } = useMapLayers();
  const { data: radarData } = useMapRadar();

  const webViewRef = useRef<WebView>(null);
  const [layersMenuVisible, setLayersMenuVisible] = useState(false);
  
  const [selectedBasemap, setSelectedBasemap] = useState<MapLayer | null>(null);
  const [selectedWeather, setSelectedWeather] = useState<MapLayer | null>(null);
  const [selectedOverlay, setSelectedOverlay] = useState<MapLayer | null>(null);

  const lat = location?.lat ?? 22.0667;
  const lon = location?.lon ?? 88.0698;

  // Derive URLs for the layers
  const getBasemapUrl = () => {
    if (selectedBasemap?.url) return selectedBasemap.url.replace('{s}', 'a');
    return 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'; // Default OSM
  };

  const getRadarUrl = () => {
    if (selectedWeather?.id === 'radar' && radarData?.radar?.length) {
      const latest = radarData.radar[radarData.radar.length - 1];
      return `${radarData.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;
    }
    return null;
  };

  const getOverlayConfig = () => {
    if (selectedOverlay?.type === 'wms' && selectedOverlay.url) {
      return {
        url: selectedOverlay.url,
        layers: selectedOverlay.layers
      };
    }
    return null;
  };

  // Sync state to WebView
  useEffect(() => {
    const basemapUrl = getBasemapUrl();
    const radarUrl = getRadarUrl();
    const overlay = getOverlayConfig();

    const js = `
      if (typeof updateLayers === 'function') {
        updateLayers(
          "${basemapUrl}", 
          ${radarUrl ? \`"\${radarUrl}"\` : 'null'}, 
          ${overlay ? JSON.stringify(overlay) : 'null'}
        );
      }
      if (typeof updateLocation === 'function') {
        updateLocation(${lat}, ${lon}, "${location.label}");
      }
      true;
    `;
    
    webViewRef.current?.injectJavaScript(js);
  }, [selectedBasemap, selectedWeather, selectedOverlay, radarData, lat, lon, location.label]);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { padding: 0; margin: 0; }
        html, body, #map { height: 100%; width: 100%; }
        .leaflet-control-attribution { display: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lon}], 10);
        
        var marker = L.marker([${lat}, ${lon}]).addTo(map);
        marker.bindPopup("${location.label}");

        var basemapLayer = null;
        var radarLayer = null;
        var wmsLayer = null;

        function updateLocation(lat, lon, label) {
          map.setView([lat, lon], 10);
          marker.setLatLng([lat, lon]);
          marker.bindPopup(label);
        }

        function updateLayers(basemapUrl, radarUrl, overlayConfig) {
          // Update Basemap
          if (basemapLayer) map.removeLayer(basemapLayer);
          basemapLayer = L.tileLayer(basemapUrl, { maxZoom: 19 }).addTo(map);

          // Update WMS Overlay
          if (wmsLayer) map.removeLayer(wmsLayer);
          if (overlayConfig) {
            wmsLayer = L.tileLayer.wms(overlayConfig.url, {
              layers: overlayConfig.layers,
              format: 'image/png',
              transparent: true,
              version: '1.1.1',
              zIndex: 2,
              opacity: 0.7
            }).addTo(map);
          }

          // Update Radar
          if (radarLayer) map.removeLayer(radarLayer);
          if (radarUrl) {
            radarLayer = L.tileLayer(radarUrl, {
              zIndex: 3,
              opacity: 0.6
            }).addTo(map);
          }
        }
        
        // Initial setup
        updateLayers("${getBasemapUrl()}", null, null);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={s.container}>
      <WebView 
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={StyleSheet.absoluteFillObject}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />

      <SafeAreaView style={s.safeOverlay} pointerEvents="box-none">
        <View style={s.topBar} pointerEvents="none">
          <View style={s.locationPill}>
            <MapPin size={16} color="#0f172a" />
            <Text style={s.locationText}>{location.label}</Text>
          </View>
        </View>

        <TouchableOpacity style={s.fab} onPress={() => setLayersMenuVisible(true)}>
          <Layers color="#fff" size={24} />
        </TouchableOpacity>
      </SafeAreaView>

      <Modal visible={layersMenuVisible} animationType="fade" transparent={true}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Map Layers</Text>
              <TouchableOpacity onPress={() => setLayersMenuVisible(false)} style={s.closeBtn}>
                <X color="#475569" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <Text style={s.sectionTitle}>Basemap</Text>
              <View style={s.grid}>
                <TouchableOpacity 
                  style={[s.layerBtn, !selectedBasemap && s.layerBtnActive]} 
                  onPress={() => setSelectedBasemap(null)}
                >
                  <Text style={[s.layerTxt, !selectedBasemap && s.layerTxtActive]}>Default (Street)</Text>
                </TouchableOpacity>
                {layersData?.basemaps?.map(b => (
                  <TouchableOpacity 
                    key={b.id} 
                    style={[s.layerBtn, selectedBasemap?.id === b.id && s.layerBtnActive]}
                    onPress={() => setSelectedBasemap(b)}
                  >
                    <Text style={[s.layerTxt, selectedBasemap?.id === b.id && s.layerTxtActive]}>{b.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.sectionTitle}>Weather (Rainviewer)</Text>
              <View style={s.grid}>
                <TouchableOpacity 
                  style={[s.layerBtn, !selectedWeather && s.layerBtnActive]} 
                  onPress={() => setSelectedWeather(null)}
                >
                  <Text style={[s.layerTxt, !selectedWeather && s.layerTxtActive]}>None</Text>
                </TouchableOpacity>
                {layersData?.weather?.filter(w => w.id === 'radar').map(w => (
                  <TouchableOpacity 
                    key={w.id} 
                    style={[s.layerBtn, selectedWeather?.id === w.id && s.layerBtnActive]}
                    onPress={() => setSelectedWeather(w)}
                  >
                    <Text style={[s.layerTxt, selectedWeather?.id === w.id && s.layerTxtActive]}>{w.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.sectionTitle}>Overlays (WMS)</Text>
              <View style={s.grid}>
                <TouchableOpacity 
                  style={[s.layerBtn, !selectedOverlay && s.layerBtnActive]} 
                  onPress={() => setSelectedOverlay(null)}
                >
                  <Text style={[s.layerTxt, !selectedOverlay && s.layerTxtActive]}>None</Text>
                </TouchableOpacity>
                {layersData?.overlays?.map(o => (
                  <TouchableOpacity 
                    key={o.id} 
                    style={[s.layerBtn, selectedOverlay?.id === o.id && s.layerBtnActive]}
                    onPress={() => setSelectedOverlay(o)}
                  >
                    <Text style={[s.layerTxt, selectedOverlay?.id === o.id && s.layerTxtActive]}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={{height: 40}} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#b3d4e9' },
  safeOverlay: { flex: 1, justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  topBar: { padding: 16, alignItems: 'center' },
  locationPill: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignItems: 'center', gap: 6, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  locationText: { fontWeight: '700', color: '#0f172a' },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#0369a1', padding: 16, borderRadius: 32, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#f8fafc', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%', elevation: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: -4 } },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  closeBtn: { padding: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 16, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  layerBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  layerBtnActive: { backgroundColor: '#e0f2fe', borderColor: '#0284c7' },
  layerTxt: { fontSize: 13, fontWeight: '600', color: '#475569' },
  layerTxtActive: { color: '#0369a1' },
});
