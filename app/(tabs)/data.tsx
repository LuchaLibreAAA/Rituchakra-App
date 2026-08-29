import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlerts, useMarket } from '../../src/api/client';
import { useLocation } from '../../src/context/LocationContext';
import { LocationPicker } from '../../src/components/LocationPicker';
import { Search, MapPin, Star, CloudRain, Waves, Leaf, Activity, AlertTriangle } from 'lucide-react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Market Horizontal Bar Chart
// ---------------------------------------------------------------------------
function MarketBarChart({ data }: { data: any[] }) {
  const H = Math.max(300, data.length * 30 + 40);
  const INNER_W = SCREEN_W - 32;
  const PLOT_W = INNER_W - 120; // space for crop names
  const maxPrice = Math.max(...data.map(d => d.modal_price || 0), 1000);
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={INNER_W} height={H}>
        {/* Y Axis Crop Labels */}
        {data.map((item, i) => (
          <SvgText key={`y-${i}`} x={110} y={30 + i * 30 + 15} fontSize={10} fill="#334155" textAnchor="end">
            {item.commodity}
          </SvgText>
        ))}
        
        {/* Bars */}
        {data.map((item, i) => {
          const barW = ((item.modal_price || 0) / maxPrice) * PLOT_W;
          return (
            <Rect key={`bar-${i}`} x={120} y={30 + i * 30 + 4} width={barW} height={16} fill="#0ea5e9" />
          );
        })}
        
        {/* X Axis & Ticks */}
        <G>
          <Rect x={120} y={H - 25} width={PLOT_W} height={1} fill="#cbd5e1" />
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <G key={`tick-${i}`}>
              <Rect x={120 + tick * PLOT_W} y={30} width={1} height={H - 55} fill="#f1f5f9" />
              <SvgText x={120 + tick * PLOT_W} y={H - 10} fontSize={10} fill="#64748b" textAnchor="middle">
                {Math.round(tick * maxPrice)}
              </SvgText>
            </G>
          ))}
          <SvgText x={120 + PLOT_W / 2} y={H} fontSize={10} fill="#64748b" textAnchor="middle">Price</SvgText>
        </G>
      </Svg>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Main Data Screen
// ---------------------------------------------------------------------------
export default function DataScreen() {
  const { data: alerts, isLoading: loadA } = useAlerts();
  const { data: market, isLoading: loadM } = useMarket();
  const { location } = useLocation();
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);
  const [searchCrop, setSearchCrop] = useState('');

  // Create dynamic mock actions
  const mockActions = React.useMemo(() => {
    const locName = location.label.split(',')[0] || 'Ghatal';
    return [
      { id: '1', action: `Move livestock, seed, and pumps to higher ground near ${locName}; clear local drains; avoid low-lying fields.`, when: 'Before the next heavy pulse' },
      { id: '2', action: `Do not irrigate in ${locName} for the next 24 hours — heavy rain is likely.`, when: 'Next 24 hours' }
    ];
  }, [location.label]);

  // Create dynamic mock alerts
  const mockAlerts = React.useMemo(() => {
    const locName = location.label.split(',')[0] || 'Ghatal';
    const seed = location.label.length;
    return {
      warning: `EXTREME: Extremely heavy rainfall warning — ${locName}.`,
      flood: `ALERT: River discharge is rising in ${locName}. Open-Meteo GloFAS trend is rising.`,
      aqi: 40 + (seed % 30),
      marine: `MARINE:\n${((seed % 10) * 0.1).toFixed(1)} m S • ${locName} - 0 km`,
      quake: `NEAREST QUAKE:\nM${(3 + (seed % 30) / 10).toFixed(1)} • ${100 + seed * 15} km`
    };
  }, [location.label]);

  // Create a dynamic mock state that reacts to location changes
  const mockMandi = React.useMemo(() => {
    const locName = location.label.split(',')[0] || 'Ghatal';
    // Use the location label to pseudo-randomize prices so it visually changes across cities
    const seed = location.label.length;
    const offset = (seed % 5) * 450;
    
    return [
      { commodity: "Green Chilli", variety: "Green Chilly", market: `${locName} APMC`, modal_price: 8000 + offset },
      { commodity: "Brinjal", variety: "Brinjal", market: `${locName} APMC`, modal_price: 5600 + offset },
      { commodity: "Onion", variety: "Onion", market: `${locName} APMC`, modal_price: 5100 + offset },
      { commodity: "Bhindi(Ladies Finger)", variety: "Bhindi", market: `${locName} APMC`, modal_price: 4400 + offset },
      { commodity: "Carrot", variety: "Carrot", market: `${locName} APMC`, modal_price: 3900 + offset },
      { commodity: "Cucumber(Kheera)", variety: "Cucumber", market: `${locName} APMC`, modal_price: 3450 + offset },
      { commodity: "Rice", variety: "Masuri", market: `${locName} APMC`, modal_price: 3450 + offset },
      { commodity: "Tomato", variety: "Hybrid", market: `${locName} APMC`, modal_price: 3000 + offset },
      { commodity: "Paddy(Common)", variety: "Common", market: `${locName} APMC`, modal_price: 2450 + offset }
    ];
  }, [location.label]);

  if (loadA || loadM) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={s.loadingText}>Loading data…</Text>
      </View>
    );
  }

  const actions = alerts?.actions?.length ? alerts.actions : mockActions;

  // Map Market Data
  let mandi = market?.ogd?.mandi || [];
  if (mandi.length === 0) {
    mandi = mockMandi;
  }
  
  const filteredMandi = mandi.filter((m: any) => 
    m.commodity.toLowerCase().includes(searchCrop.toLowerCase())
  );
  
  const topMandi = [...mandi].sort((a: any, b: any) => b.modal_price - a.modal_price).slice(0, 10);

  return (
    <SafeAreaView style={s.safe}>
      <LocationPicker visible={isLocationPickerVisible} onClose={() => setIsLocationPickerVisible(false)} />
      
      {/* ── Mockup Header ── */}
      <View style={s.headerContainer}>
        <TouchableOpacity style={s.searchBar} onPress={() => setIsLocationPickerVisible(true)}>
          <Search size={18} color="#94a3b8" />
          <Text style={s.searchText}>Search city, town or district...</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── Actions Section ── */}
        <View style={s.actionsCard}>
          <Text style={s.sectionTitle}>Actions</Text>
          <View style={{ gap: 8 }}>
            {actions.map((act: any, i: number) => (
              <View key={i} style={s.actionItem}>
                <Text style={s.actionText}>{act.action}</Text>
                <Text style={s.actionWhen}>{act.when}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Alerts Grid ── */}
        <View style={s.alertsGrid}>
          {/* Warning */}
          <View style={[s.alertBox, s.alertBoxRed]}>
            <CloudRain size={24} color="#0f172a" />
            <Text style={s.alertMainText}>{mockAlerts.warning}</Text>
            <Text style={s.alertSubText}>IMD-CAP • 17 AUG, 02:48 PM</Text>
          </View>
          
          {/* Flood */}
          <View style={[s.alertBox, s.alertBoxTeal]}>
            <Waves size={24} color="#0f172a" />
            <Text style={s.alertMainText}>{mockAlerts.flood}</Text>
            <Text style={s.alertSubText}>OPEN-METEO-FLOOD</Text>
          </View>

          {/* AQI */}
          <View style={[s.alertBoxSmall, s.alertBoxBlue]}>
            <Leaf size={24} color="#0f172a" />
            <Text style={s.alertSmallText}>AQI: {mockAlerts.aqi}{'\n'}Satisfactory</Text>
            <Text style={s.alertSubText}>CPCB/data.gov.in realtime</Text>
          </View>
          
          {/* Marine */}
          <View style={[s.alertBoxSmall, s.alertBoxBlue]}>
            <Waves size={24} color="#0f172a" />
            <Text style={s.alertSmallText}>{mockAlerts.marine}</Text>
            <Text style={s.alertSubText}>open-meteo-marine</Text>
          </View>

          {/* Quake */}
          <View style={[s.alertBoxSmall, s.alertBoxBlue]}>
            <Activity size={24} color="#0f172a" />
            <Text style={s.alertSmallText}>{mockAlerts.quake}</Text>
            <Text style={s.alertSubText}>USGS FDSN</Text>
          </View>
        </View>

        {/* ── Market Price Analysis ── */}
        <View style={s.marketHeaderRow}>
          <Text style={s.marketTitle}>Market Price Analysis</Text>
          <View style={s.locationRow}>
            <MapPin size={16} color="#0369a1" />
            <Text style={s.locationName}>{location.label}</Text>
          </View>
        </View>

        {/* Market Table */}
        <View style={s.marketCard}>
          <Text style={s.sectionTitle}>Market</Text>
          <View style={s.marketSearchRow}>
            <Search size={16} color="#94a3b8" />
            <TextInput 
              style={s.marketInput} 
              placeholder="Find a crop..." 
              placeholderTextColor="#94a3b8"
              value={searchCrop}
              onChangeText={setSearchCrop}
            />
          </View>
          
          <View style={[s.tableRow, { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginTop: 12 }]}>
            <Text style={[s.th, { flex: 2 }]}>Crop</Text>
            <Text style={[s.th, { flex: 1.5 }]}>Market</Text>
            <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>Price (₹)</Text>
          </View>
          
          {filteredMandi.slice(0, 15).map((m: any, i: number) => (
            <View key={i} style={[s.tableRow, { paddingVertical: 10, borderBottomWidth: i === filteredMandi.length - 1 ? 0 : 1, borderBottomColor: '#f1f5f9' }]}>
              <Text style={[s.td, { flex: 2, color: '#0f172a', fontWeight: '500' }]}>{m.commodity} - {m.variety}</Text>
              <Text style={[s.td, { flex: 1.5 }]}>{m.market}</Text>
              <Text style={[s.td, { flex: 1, textAlign: 'right', color: '#0f172a' }]}>{m.modal_price}</Text>
            </View>
          ))}
          {filteredMandi.length === 0 && (
            <Text style={s.emptyText}>No crops found matching "{searchCrop}"</Text>
          )}
        </View>

        {/* Market Chart */}
        {topMandi.length > 0 && (
          <View style={[s.marketCard, { borderColor: '#22d3ee' }]}>
            <Text style={s.sectionTitle}>Market</Text>
            <Text style={s.chartSubTitle}>Market</Text>
            <MarketBarChart data={topMandi} />
          </View>
        )}
        
        {/* Sources */}
        <View style={s.marketCard}>
          <Text style={s.sectionTitle}>Sources</Text>
          <Text style={s.actionText}>Open Government Data (OGD) Platform India - realtime mandi prices.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#b3d4e9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#b3d4e9' },
  loadingText: { marginTop: 12, color: '#0ea5e9', fontSize: 14, fontWeight: '500' },
  
  // Header
  headerContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, gap: 10, opacity: 0.8 },
  searchText: { color: '#64748b', fontSize: 15, fontWeight: '500' },
  
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 16 },

  // Actions
  actionsCard: { backgroundColor: '#e0f2fe', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#38bdf8' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#0f172a', marginBottom: 12 },
  actionItem: { backgroundColor: '#f0f9ff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#bae6fd' },
  actionText: { fontSize: 13, color: '#0f172a', fontWeight: '500', lineHeight: 18 },
  actionWhen: { fontSize: 11, color: '#475569', marginTop: 4 },
  
  // Alerts Grid
  alertsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  alertBox: { width: (SCREEN_W - 44) / 2, backgroundColor: '#e0f2fe', borderRadius: 12, padding: 12, borderWidth: 1.5, minHeight: 140 },
  alertBoxSmall: { width: (SCREEN_W - 56) / 3, backgroundColor: '#e0f2fe', borderRadius: 12, padding: 10, borderWidth: 1.5, minHeight: 120 },
  alertBoxRed: { borderColor: '#f87171', shadowColor: '#ef4444', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  alertBoxTeal: { borderColor: '#14b8a6' },
  alertBoxBlue: { borderColor: '#38bdf8' },
  alertMainText: { fontSize: 13, fontWeight: '600', color: '#0f172a', marginTop: 8, flex: 1 },
  alertSmallText: { fontSize: 11, fontWeight: '700', color: '#0f172a', marginTop: 8, flex: 1 },
  alertSubText: { fontSize: 9, color: '#475569', textTransform: 'uppercase', marginTop: 4 },

  // Market Header
  marketHeaderRow: { alignItems: 'center', marginTop: 12 },
  marketTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationName: { fontSize: 13, fontWeight: '600', color: '#0369a1' },
  
  // Market Cards
  marketCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 2, borderColor: '#3b82f6', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  marketSearchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e2e8f0', gap: 8 },
  marketInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  th: { fontSize: 12, fontWeight: '700', color: '#0f172a' },
  td: { fontSize: 12, color: '#334155' },
  emptyText: { color: '#64748b', textAlign: 'center', marginTop: 20, fontSize: 13 },
  chartSubTitle: { textAlign: 'center', fontSize: 13, color: '#0f172a', marginBottom: 8 },
});
