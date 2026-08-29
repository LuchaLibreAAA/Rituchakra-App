import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics } from '../../src/api/client';
import { MockBanner } from '../../src/components/MockBanner';
import Svg, { Line, Polyline, Rect, Text as SvgText, G } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Kalman Line Chart ──
function KalmanChart({ data }: { data: { time: string; rate: number }[] }) {
  const chartW = SCREEN_W - 64;
  const chartH = 140;
  const maxRate = Math.max(...data.map(d => d.rate), 0.01);
  const step = chartW / (data.length - 1);

  const points = data
    .map((d, i) => `${i * step},${chartH - (d.rate / maxRate) * chartH}`)
    .join(' ');

  return (
    <Svg width={chartW} height={chartH + 24} style={{ alignSelf: 'center' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
        <G key={i}>
          <Line x1={0} y1={chartH * (1 - frac)} x2={chartW} y2={chartH * (1 - frac)} stroke="#e2e8f0" strokeWidth={1} />
          <SvgText x={0} y={chartH * (1 - frac) - 2} fontSize={8} fill="#94a3b8">
            {(maxRate * frac).toFixed(2)}
          </SvgText>
        </G>
      ))}
      <Polyline points={points} fill="none" stroke="#2563eb" strokeWidth={1.5} />
      {/* X labels */}
      {[0, Math.floor(data.length * 0.25), Math.floor(data.length * 0.5), Math.floor(data.length * 0.75), data.length - 1].map((idx, i) => (
        <SvgText key={i} x={idx * step} y={chartH + 14} fontSize={8} fill="#94a3b8" textAnchor="middle">
          {data[idx]?.time?.slice(0, 8) || ''}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function AnalyticsScreen() {
  const { data } = useAnalytics();

  if (!data) return <View style={s.center}><Text>Loading...</Text></View>;

  // Separate metrics into grid groups
  const gridA = data.metrics.slice(0, 4);   // Lightning, Cloudburst, Downburst, Cell Rain
  const gridB = data.metrics.slice(4, 8);   // To Onset, Hugli Tide, Ponding, This Minute
  const gridC = data.metrics.slice(8);      // Pump Set, Field, Storm Watch

  return (
    <SafeAreaView style={s.safe}>
      <MockBanner />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.headerTitle}>Rituchakra</Text>
          <View>
            <Text style={s.headerLoc}>📍 Haldia, West Bengal</Text>
            <Text style={s.headerTime}>07:49 pm</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>LIVE STORM</Text>

        {/* Grid A - 2x2 big cards */}
        <View style={s.grid2}>
          {gridA.map(m => (
            <View key={m.id} style={s.metricCard}>
              <Text style={s.metricLabel}>{m.label}</Text>
              <Text style={s.metricValue}>{m.value}</Text>
              {m.subValue && <Text style={s.metricSub}>{m.subValue}</Text>}
            </View>
          ))}
        </View>

        {/* Grid B - 4 across */}
        <View style={s.grid4}>
          {gridB.map(m => (
            <View key={m.id} style={s.metricCardSm}>
              <Text style={s.metricLabelSm}>{m.label}</Text>
              <Text style={s.metricValueSm}>{m.value}</Text>
              {m.subValue && <Text style={s.metricSubSm}>{m.subValue}</Text>}
            </View>
          ))}
        </View>

        {/* Grid C - 3 across */}
        <View style={s.grid3}>
          {gridC.map(m => (
            <View key={m.id} style={s.metricCardMd}>
              <Text style={s.metricLabelSm}>{m.label}</Text>
              <Text style={s.metricValueMd}>{m.value}</Text>
            </View>
          ))}
        </View>

        {/* Kalman Chart */}
        <View style={s.chartCard}>
          <View style={s.chartHeader}>
            <Text style={s.chartTitle}>BETWEEN-SCENE KALMAN</Text>
          </View>
          <View style={s.kalmanStats}>
            <View style={s.kalmanStat}>
              <Text style={s.kalmanLabel}>LIVE RATE</Text>
              <Text style={s.kalmanVal}>{data.kalman.liveRate} <Text style={s.kalmanUnit}>mm/h</Text></Text>
            </View>
            <View style={s.kalmanStat}>
              <Text style={s.kalmanLabel}>LAST ERROR</Text>
              <Text style={s.kalmanVal}>{data.kalman.lastError} <Text style={s.kalmanUnit}>mm/h</Text></Text>
            </View>
            <View style={s.kalmanStat}>
              <Text style={s.kalmanLabel}>UPDATES</Text>
              <Text style={s.kalmanVal}>{data.kalman.updates}</Text>
            </View>
            <View style={s.kalmanStat}>
              <Text style={s.kalmanLabel}>NEXT SCENE</Text>
              <Text style={s.kalmanVal}>{data.kalman.nextScene}</Text>
            </View>
          </View>
          <KalmanChart data={data.kalman.data} />
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

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1e293b' },
  headerLoc: { fontSize: 12, color: '#0369a1', textAlign: 'right' },
  headerTime: { fontSize: 11, color: '#64748b', textAlign: 'right' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 10, letterSpacing: 1 },

  // 2x2 grid
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  metricCard: { width: (SCREEN_W - 42) / 2, backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  metricLabel: { fontSize: 11, fontWeight: '600', color: '#475569', letterSpacing: 0.5, marginBottom: 4 },
  metricValue: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
  metricSub: { fontSize: 11, color: '#64748b', marginTop: 2 },

  // 4-across grid
  grid4: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  metricCardSm: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#bae6fd', alignItems: 'center' },
  metricLabelSm: { fontSize: 9, fontWeight: '600', color: '#475569', letterSpacing: 0.3, marginBottom: 2, textAlign: 'center' },
  metricValueSm: { fontSize: 14, fontWeight: '700', color: '#1e293b', textAlign: 'center' },
  metricSubSm: { fontSize: 8, color: '#64748b', textAlign: 'center' },

  // 3-across grid
  grid3: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  metricCardMd: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  metricValueMd: { fontSize: 16, fontWeight: '700', color: '#1e293b' },

  // Chart
  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#c4b5fd' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  chartTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b', letterSpacing: 0.5 },
  kalmanStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  kalmanStat: { alignItems: 'center' },
  kalmanLabel: { fontSize: 9, fontWeight: '600', color: '#475569', letterSpacing: 0.3 },
  kalmanVal: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  kalmanUnit: { fontSize: 11, fontWeight: '400', color: '#64748b' },
});
