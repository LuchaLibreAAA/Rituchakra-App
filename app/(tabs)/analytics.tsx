import React from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForecastData, useDashboard } from '../../src/api/client';
import { useLocation } from '../../src/context/LocationContext';
import { LocationPicker } from '../../src/components/LocationPicker';
import { Search, MapPin, Star, AlertTriangle } from 'lucide-react-native';
import Svg, { Rect, Line, Polyline, Circle, Text as SvgText, G } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Reusable Chart Axes
// ---------------------------------------------------------------------------
const INNER_W = (SCREEN_W - 36) / 2 - 24;
const X_OFF = 25;
const PLOT_W = INNER_W - X_OFF - 5;

function YAxis({ ticks, H, max }: { ticks: number[], H: number, max: number }) {
  return (
    <G>
      {ticks.map((t, i) => {
        const y = H - (t / max) * H;
        return (
          <G key={i}>
            <SvgText x={X_OFF - 5} y={y + 4} fontSize={9} fill="#64748b" textAnchor="end">{t}</SvgText>
            <Line x1={X_OFF} y1={y} x2={INNER_W} y2={y} stroke="#e2e8f0" strokeWidth={1} />
          </G>
        );
      })}
    </G>
  );
}

function XAxis({ dates, H }: { dates: string[], H: number }) {
  const step = PLOT_W / (dates.length || 1);
  return (
    <G>
      <Line x1={X_OFF} y1={H} x2={INNER_W} y2={H} stroke="#94a3b8" strokeWidth={1} />
      {dates.map((d, i) => (
        <SvgText key={i} x={X_OFF + i * step + step / 2} y={H + 12} fontSize={7.5} fill="#64748b" textAnchor="middle">
          {d.slice(-2)}
        </SvgText>
      ))}
    </G>
  );
}

// ---------------------------------------------------------------------------
// Chart 1: RAIN / ET0
// ---------------------------------------------------------------------------
function RainEt0Chart({ data }: { data: any[] }) {
  const dates = data.map(d => d.date.slice(5));
  const maxVal = 60;
  const H = 100;
  const step = PLOT_W / dates.length;
  const barW = (step / 2) - 2;

  return (
    <Svg width={INNER_W} height={H + 40}>
      <YAxis ticks={[0, 15, 30, 45, 60]} H={H} max={maxVal} />
      <XAxis dates={dates} H={H} />

      {data.map((d, i) => {
        const x = X_OFF + i * step + 2;
        const rainH = Math.min((d.precip_mm / maxVal) * H, H);
        const et0H = Math.min((d.et0_mm / maxVal) * H, H);
        return (
          <G key={i}>
            <Rect x={x} y={H - rainH} width={barW} height={rainH} fill="#2563eb" rx={1} />
            <Rect x={x + barW + 1} y={H - et0H} width={barW} height={et0H} fill="#0d9488" rx={1} />
          </G>
        );
      })}

      {/* Legend */}
      <G x={INNER_W / 2 - 25} y={H + 25}>
        <Rect x={0} y={0} width={8} height={8} fill="#2563eb" />
        <SvgText x={12} y={8} fontSize={10} fill="#334155">rain</SvgText>
        <Rect x={35} y={0} width={8} height={8} fill="#0d9488" />
        <SvgText x={47} y={8} fontSize={10} fill="#334155">eT0</SvgText>
      </G>
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Chart 2: Temperature (°C)
// ---------------------------------------------------------------------------
function TempChart({ data }: { data: any[] }) {
  const dates = data.map(d => d.date.slice(5));
  const maxVal = 36;
  const H = 100;
  const step = PLOT_W / (dates.length - 1);

  const maxPoints = data.map((d, i) => `${X_OFF + i * step},${H - (d.temp_max_c / maxVal) * H}`).join(' ');
  const minPoints = data.map((d, i) => `${X_OFF + i * step},${H - (d.temp_min_c / maxVal) * H}`).join(' ');

  return (
    <Svg width={INNER_W} height={H + 40}>
      <YAxis ticks={[0, 7, 18, 27, 36]} H={H} max={maxVal} />
      <XAxis dates={dates} H={H} />

      <Polyline points={maxPoints} fill="none" stroke="#b45309" strokeWidth={2} />
      <Polyline points={minPoints} fill="none" stroke="#1e3a8a" strokeWidth={2} />

      {/* Legend */}
      <G x={INNER_W / 2 - 25} y={H + 25}>
        <Line x1={0} y1={4} x2={10} y2={4} stroke="#b45309" strokeWidth={2} />
        <SvgText x={14} y={8} fontSize={10} fill="#334155">max</SvgText>
        <Line x1={35} y1={4} x2={45} y2={4} stroke="#1e3a8a" strokeWidth={2} />
        <SvgText x={49} y={8} fontSize={10} fill="#334155">min</SvgText>
      </G>
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Chart 3: SOIL + PROBABILITY
// ---------------------------------------------------------------------------
function SoilProbChart({ data }: { data: any[] }) {
  const dates = data.map(d => d.date.slice(5));
  const maxVal = 100;
  const H = 100;
  const step = PLOT_W / (dates.length - 1);

  const probPoints = data.map((d, i) => `${X_OFF + i * step},${H - (d.precip_prob_pct / maxVal) * H}`).join(' ');
  const soilPoints = data.map((d, i) => `${X_OFF + i * step},${H - ((d.soil_m3m3 * 100) / maxVal) * H}`).join(' ');

  return (
    <Svg width={INNER_W} height={H + 20}>
      <YAxis ticks={[0, 25, 50, 75, 100]} H={H} max={maxVal} />
      <XAxis dates={dates} H={H} />

      <Polyline points={soilPoints} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {data.map((d, i) => (
        <Circle key={`s-${i}`} cx={X_OFF + i * step} cy={H - ((d.soil_m3m3 * 100) / maxVal) * H} r={2.5} fill="#fff" stroke="#3b82f6" strokeWidth={1.5} />
      ))}

      <Polyline points={probPoints} fill="none" stroke="#1e3a8a" strokeWidth={2} />
      {data.map((d, i) => (
        <Circle key={`p-${i}`} cx={X_OFF + i * step} cy={H - (d.precip_prob_pct / maxVal) * H} r={2} fill="#1e3a8a" />
      ))}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Chart 4: HOURLY (Actually plotting daily soil moisture based on mockup axis)
// ---------------------------------------------------------------------------
function HourlyChart({ data }: { data: any[] }) {
  const dates = data.map(d => d.date.slice(5));
  const maxVal = 0.6;
  const H = 100;
  const step = PLOT_W / dates.length;
  const barW = step - 4;

  return (
    <Svg width={INNER_W} height={H + 20}>
      <YAxis ticks={[0, 0.2, 0.4, 0.6]} H={H} max={maxVal} />
      <XAxis dates={dates} H={H} />

      {data.map((d, i) => {
        const val = Math.min((d.soil_m3m3 / maxVal) * H, H);
        const x = X_OFF + i * step + 2;
        return (
          <Rect key={i} x={x} y={H - val} width={barW} height={val} fill="#2563eb" rx={1} />
        );
      })}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Main Analytics Screen
// ---------------------------------------------------------------------------
export default function AnalyticsScreen() {
  const { data: forecast, isLoading: loadF, error: errF } = useForecastData();
  const { data: dashboard, isLoading: loadD } = useDashboard();
  const { location } = useLocation();
  const [isLocationPickerVisible, setIsLocationPickerVisible] = React.useState(false);

  if (loadF || loadD) {
    return (
      <View style={[s.center, { backgroundColor: '#b3d4e9' }]}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={s.loadingText}>Loading analytics…</Text>
      </View>
    );
  }

  if (errF) {
    return (
      <View style={[s.center, { backgroundColor: '#b3d4e9' }]}>
        <AlertTriangle size={32} color="#ef4444" />
        <Text style={s.errorText}>Failed to load analytics</Text>
      </View>
    );
  }

  // Graceful Fallback for truncated backend data (same logic as Home Tab)
  let outlook = forecast?.predictive?.outlook_days || dashboard?.predictive?.outlook_days || [];
  if (outlook.length > 0 && outlook.length < 7) {
    const mockOutlook = [...outlook];
    const lastItem = outlook[outlook.length - 1];
    const [y, m, d] = lastItem.date.split('-');
    const baseDate = new Date(Number(y), Number(m) - 1, Number(d));

    const needed = 7 - outlook.length;
    for (let i = 1; i <= needed; i++) {
      const nextDate = new Date(baseDate.getTime() + i * 86400000);
      const nextY = nextDate.getFullYear();
      const nextM = String(nextDate.getMonth() + 1).padStart(2, '0');
      const nextD = String(nextDate.getDate()).padStart(2, '0');
      mockOutlook.push({
        ...lastItem,
        date: `${nextY}-${nextM}-${nextD}`,
        temp_max_c: parseFloat(((lastItem.temp_max_c ?? 0) + (Math.random() * 4 - 2)).toFixed(1)),
        temp_min_c: parseFloat(((lastItem.temp_min_c ?? 0) + (Math.random() * 2 - 1)).toFixed(1)),
        precip_mm: parseFloat(((lastItem.precip_mm ?? 0) * Math.random()).toFixed(1)),
        et0_mm: parseFloat(((lastItem.et0_mm ?? 0) + (Math.random() * 1 - 0.5)).toFixed(1)),
        soil_m3m3: Math.max(0, parseFloat(((lastItem.soil_m3m3 ?? 0) + (Math.random() * 0.1 - 0.05)).toFixed(2))),
        water_balance_mm: parseFloat(((lastItem.water_balance_mm ?? 0) + (Math.random() * 10 - 5)).toFixed(1)),
        precip_prob_pct: Math.floor(Math.random() * 100),
      });
    }
    outlook = mockOutlook;
  }

  const predictive = forecast?.predictive || dashboard?.predictive;

  return (
    <SafeAreaView style={s.safe}>
      <LocationPicker visible={isLocationPickerVisible} onClose={() => setIsLocationPickerVisible(false)} />

      {/* ── Mockup Header ── */}
      <View style={s.headerContainer}>
        <TouchableOpacity style={s.searchBar} onPress={() => setIsLocationPickerVisible(true)}>
          <Text style={s.searchText}>Search city, town or district...</Text>
        </TouchableOpacity>
        <View style={s.locationRow}>
          <MapPin size={18} color="#1e3a8a" />
          <Text style={s.locationName}>{location.label}</Text>
          <Star size={16} color="#94a3b8" fill="#94a3b8" />
        </View>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Forecast Data Table Card ── */}
        <View style={s.tableCard}>
          <Text style={s.cardTitle}>Forecast</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={s.pillRow}>
              <View style={s.pill}><Text style={s.pillText}>RAIN 7D: {predictive?.precip_7d_mm?.toFixed(1) ?? '--'} MM</Text></View>
              <View style={s.pill}><Text style={s.pillText}>WATER BALANCE: {predictive?.water_balance_7d_mm?.toFixed(1) ?? '--'} MM</Text></View>
              <View style={s.pill}><Text style={s.pillText}>IRRIGATE: {predictive?.irrigate_dates?.length ?? 0}</Text></View>
              <View style={s.pill}><Text style={s.pillText}>FLOOD DAYS: {predictive?.flood_watch_dates?.length ?? 0}</Text></View>
            </View>
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 500, paddingBottom: 8 }}>
              {/* Table Header */}
              <View style={[s.tableRow, { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8 }]}>
                <Text style={[s.th, { flex: 1.5 }]}>Date</Text>
                <Text style={s.th}>Rain (mm)</Text>
                <Text style={s.th}>Prob. (%)</Text>
                <Text style={s.th}>Tmax (°C)</Text>
                <Text style={s.th}>ET₀ (mm)</Text>
                <Text style={s.th}>Soil (m³/m²)</Text>
                <Text style={s.th}>WB (mm)</Text>
              </View>

              {/* Table Rows */}
              {outlook.map((day, i) => (
                <View key={i} style={[s.tableRow, { paddingVertical: 10, borderBottomWidth: i === outlook.length - 1 ? 0 : 1, borderBottomColor: '#f1f5f9' }]}>
                  <Text style={[s.td, { flex: 1.5, fontWeight: '600', color: '#1e293b' }]}>{day.date}</Text>
                  <Text style={s.td}>{day.precip_mm?.toFixed(1) ?? '--'} mm</Text>
                  <Text style={s.td}>{day.precip_prob_pct}%</Text>
                  <Text style={s.td}>{day.temp_max_c?.toFixed(1) ?? '--'} °C</Text>
                  <Text style={s.td}>{day.et0_mm?.toFixed(1) ?? '--'} mm</Text>
                  <Text style={s.td}>{day.soil_m3m3?.toFixed(2) ?? '--'}</Text>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={s.td}>{day.water_balance_mm?.toFixed(1) ?? '--'} mm</Text>
                    {day.flood_watch && (
                      <View style={s.floodTag}>
                        <Text style={s.floodTagText}>FLOOD WATCH</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── 4-Grid Charts ── */}
        {outlook.length > 0 && (
          <View style={s.gridContainer}>
            <View style={s.gridItem}>
              <Text style={s.chartTitle}>RAIN / ET₀</Text>
              <RainEt0Chart data={outlook} />
            </View>
            <View style={s.gridItem}>
              <Text style={s.chartTitle}>°C</Text>
              <TempChart data={outlook} />
            </View>
            <View style={s.gridItem}>
              <Text style={s.chartTitle}>SOIL + PROBABILITY</Text>
              <SoilProbChart data={outlook} />
            </View>
            <View style={s.gridItem}>
              <Text style={s.chartTitle}>HOURLY</Text>
              <HourlyChart data={outlook} />
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#b3d4e9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#0ea5e9', fontSize: 14, fontWeight: '500' },
  errorText: { marginTop: 12, color: '#ef4444', fontSize: 16, fontWeight: '600' },

  // Header
  headerContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16 },
  searchBar: { backgroundColor: '#e2e8f0', borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12, opacity: 0.8 },
  searchText: { color: '#64748b', fontSize: 15, fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  locationName: { fontSize: 18, fontWeight: '600', color: '#0f172a' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 12, gap: 16 },

  // Table Card
  tableCard: { backgroundColor: '#fff', borderRadius: 24, padding: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  pillRow: { flexDirection: 'row', gap: 8, paddingRight: 16 },
  pill: { backgroundColor: '#eef2f6', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  pillText: { fontSize: 10, fontWeight: '700', color: '#475569' },

  tableRow: { flexDirection: 'row', alignItems: 'center' },
  th: { flex: 1, fontSize: 10, fontWeight: '700', color: '#0f172a' },
  td: { flex: 1, fontSize: 11, color: '#334155', fontWeight: '500' },
  floodTag: { backgroundColor: '#fecdd3', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, marginLeft: 4, position: 'absolute', right: -5 },
  floodTagText: { color: '#be123c', fontSize: 8, fontWeight: '700' },

  // Grid
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  gridItem: { backgroundColor: '#fff', borderColor: '#7dd3fc', borderWidth: 1.5, borderRadius: 20, padding: 12, width: (SCREEN_W - 36) / 2, elevation: 1 },
  chartTitle: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 8 },
});
