import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Star } from 'lucide-react-native';
import { useForecastData } from '../../src/api/client';
import { mockForecastSummary } from '../../src/mocks/forecast.mock';
import { MockBanner } from '../../src/components/MockBanner';
import Svg, { Rect, Line, Polyline, Circle, Text as SvgText, G } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Rain / ET0 combo chart ──
function RainEt0Chart({ data }: { data: { date?: string; rain?: number; et0?: number }[] }) {
  const W = (SCREEN_W - 64) / 2;
  const H = 120;
  const maxVal = Math.max(...data.map(d => Math.max(d.rain || 0, d.et0 || 0)), 1);
  const barW = (W - 20) / data.length - 4;

  return (
    <Svg width={W} height={H + 30}>
      <SvgText x={4} y={12} fontSize={10} fill="#1e293b" fontWeight="bold">RAIN / ET₀</SvgText>
      {data.map((d, i) => {
        const x = i * (barW + 4) + 10;
        const rainH = ((d.rain || 0) / maxVal) * (H - 20);
        const et0H = ((d.et0 || 0) / maxVal) * (H - 20);
        return (
          <G key={i}>
            <Rect x={x} y={H - rainH} width={barW / 2} height={rainH} fill="#3b82f6" rx={1} />
            <Rect x={x + barW / 2} y={H - et0H} width={barW / 2} height={et0H} fill="#7c3aed" rx={1} />
            <SvgText x={x + barW / 2} y={H + 12} fontSize={7} fill="#94a3b8" textAnchor="middle">
              {d.date?.slice(5) || ''}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ── Temperature Line Chart ──
function TempChart({ data }: { data: { date?: string; maxTemp: number; minTemp?: number }[] }) {
  const W = (SCREEN_W - 64) / 2;
  const H = 120;
  const allTemps = data.flatMap(d => [d.maxTemp, d.minTemp || d.maxTemp - 3]);
  const minT = Math.min(...allTemps) - 2;
  const maxT = Math.max(...allTemps) + 2;
  const step = (W - 20) / (data.length - 1);

  const maxLine = data.map((d, i) => `${i * step + 10},${H - 20 - ((d.maxTemp - minT) / (maxT - minT)) * (H - 30)}`).join(' ');
  const minLine = data.map((d, i) => `${i * step + 10},${H - 20 - (((d.minTemp || d.maxTemp - 3) - minT) / (maxT - minT)) * (H - 30)}`).join(' ');

  return (
    <Svg width={W} height={H + 30}>
      <SvgText x={4} y={12} fontSize={10} fill="#1e293b" fontWeight="bold">°C</SvgText>
      <Polyline points={maxLine} fill="none" stroke="#f59e0b" strokeWidth={2} />
      <Polyline points={minLine} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {data.map((d, i) => (
        <SvgText key={i} x={i * step + 10} y={H + 12} fontSize={7} fill="#94a3b8" textAnchor="middle">
          {d.date?.slice(5) || ''}
        </SvgText>
      ))}
    </Svg>
  );
}

// ── Soil + Probability Chart ──
function SoilChart({ data }: { data: { soil?: number; prob?: number }[] }) {
  const W = (SCREEN_W - 64) / 2;
  const H = 120;
  const step = (W - 20) / (data.length - 1);

  const soilLine = data.map((d, i) => `${i * step + 10},${H - 20 - ((d.soil || 0) / 1) * (H - 30)}`).join(' ');
  const probLine = data.map((d, i) => `${i * step + 10},${H - 20 - ((d.prob || 0) / 100) * (H - 30)}`).join(' ');

  return (
    <Svg width={W} height={H + 30}>
      <SvgText x={4} y={12} fontSize={10} fill="#1e293b" fontWeight="bold">SOIL + PROBABILITY</SvgText>
      <Polyline points={soilLine} fill="none" stroke="#1e293b" strokeWidth={2} />
      {data.map((d, i) => (
        <Circle key={i} cx={i * step + 10} cy={H - 20 - ((d.soil || 0) / 1) * (H - 30)} r={3} fill="#1e293b" />
      ))}
      <Polyline points={probLine} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4,2" />
    </Svg>
  );
}

// ── Hourly Rain Bar Chart ──
function HourlyChart({ data }: { data: { rain?: number; date?: string }[] }) {
  const W = (SCREEN_W - 64) / 2;
  const H = 120;
  const maxRain = Math.max(...data.map(d => d.rain || 0), 0.1);
  const barW = (W - 20) / data.length - 2;

  return (
    <Svg width={W} height={H + 30}>
      <SvgText x={4} y={12} fontSize={10} fill="#1e293b" fontWeight="bold">HOURLY</SvgText>
      {data.map((d, i) => {
        const barH = ((d.rain || 0) / maxRain) * (H - 20);
        const x = i * (barW + 2) + 10;
        return (
          <G key={i}>
            <Rect x={x} y={H - barH} width={barW} height={barH} fill="#3b82f6" rx={1} />
            <SvgText x={x + barW / 2} y={H + 12} fontSize={7} fill="#94a3b8" textAnchor="middle">
              {d.date?.slice(5) || ''}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export default function DataScreen() {
  const { data } = useForecastData();

  if (!data || data.length === 0) return <View style={s.center}><Text>Loading...</Text></View>;

  const summary = mockForecastSummary;

  return (
    <SafeAreaView style={s.safe}>
      <MockBanner />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Search Bar */}
        <View style={s.searchBar}>
          <Search color="#94a3b8" size={18} />
          <TextInput style={s.searchInput} placeholder="Search city, town or district..." placeholderTextColor="#94a3b8" />
        </View>
        <View style={s.locationRow}>
          <Text style={s.locationText}>📍 Haldia, West Bengal</Text>
          <Star color="#f59e0b" size={16} fill="#f59e0b" />
        </View>

        {/* Summary Badges */}
        <Text style={s.sectionTitle}>Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.badges}>
          <View style={s.badge}><Text style={s.badgeText}>RAIN 7D: {summary.rain7d} MM</Text></View>
          <View style={s.badge}><Text style={s.badgeText}>WATER BALANCE: {summary.waterBalance} MM</Text></View>
          <View style={s.badge}><Text style={s.badgeText}>IRRIGATE: {summary.irrigate}</Text></View>
          <View style={s.badge}><Text style={s.badgeText}>FLOOD DAYS: {summary.floodDays}</Text></View>
        </ScrollView>

        {/* Forecast Table */}
        <View style={s.tableCard}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 0.9 }]}>Date</Text>
            <Text style={[s.th, { flex: 0.7 }]}>Rain (mm)</Text>
            <Text style={[s.th, { flex: 0.6 }]}>Prob. (%)</Text>
            <Text style={[s.th, { flex: 0.7 }]}>Tmax (°C)</Text>
            <Text style={[s.th, { flex: 0.6 }]}>ET₀ (mm)</Text>
            <Text style={[s.th, { flex: 0.7 }]}>Soil (m³/m³)</Text>
            <Text style={[s.th, { flex: 0.6 }]}>WB (mm)</Text>
          </View>
          {data.map((d, i) => (
            <View key={i} style={[s.tableRow, d.alert ? s.tableRowAlert : null]}>
              <Text style={[s.td, { flex: 0.9 }]}>{d.date}</Text>
              <Text style={[s.td, { flex: 0.7 }]}>{d.rain} mm</Text>
              <Text style={[s.td, { flex: 0.6 }]}>{d.prob}%</Text>
              <Text style={[s.td, { flex: 0.7 }]}>{d.maxTemp} °C</Text>
              <Text style={[s.td, { flex: 0.6 }]}>{d.et0} mm</Text>
              <Text style={[s.td, { flex: 0.7 }]}>{d.soil}</Text>
              <Text style={[s.td, { flex: 0.6 }]}>{d.wb} mm</Text>
              {d.alert && <Text style={s.floodBadge}>{d.alert}</Text>}
            </View>
          ))}
        </View>

        {/* Charts 2x2 */}
        <View style={s.chartRow}>
          <View style={s.chartCard}><RainEt0Chart data={data} /></View>
          <View style={s.chartCard}><TempChart data={data} /></View>
        </View>
        <View style={s.chartRow}>
          <View style={s.chartCard}><SoilChart data={data} /></View>
          <View style={s.chartCard}><HourlyChart data={data} /></View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1e293b' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  locationText: { fontSize: 14, fontWeight: '600', color: '#0369a1' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 8 },

  badges: { marginBottom: 12, flexGrow: 0 },
  badge: { backgroundColor: '#1e293b', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  tableCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#cbd5e1', paddingBottom: 6, marginBottom: 4 },
  th: { fontSize: 9, fontWeight: '700', color: '#475569' },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  tableRowAlert: { backgroundColor: '#fef2f2' },
  td: { fontSize: 10, color: '#1e293b' },
  floodBadge: { position: 'absolute', right: 0, backgroundColor: '#fecaca', color: '#991b1b', fontSize: 8, fontWeight: '700', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },

  chartRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  chartCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' },
});
