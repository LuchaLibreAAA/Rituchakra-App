import React from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNowcastLive } from '../../src/api/client';
import Svg, { Line, Polyline, Rect, Text as SvgText, Circle, G } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Observed + Forecast rain bar chart
// ---------------------------------------------------------------------------
function RainTimeline({ observed, knots }: { observed: any[]; knots: any[] }) {
  const all = [
    ...observed.map(o => ({ t: o.t, mm: o.mm, type: 'obs' })),
    ...knots.map(k => ({ t: k.t, mm: k.mm, type: 'fcst' })),
  ];
  const chartW = SCREEN_W - 48;
  const chartH = 100;
  const maxMm = Math.max(...all.map(d => d.mm), 1);
  const barW = Math.max((chartW - all.length * 2) / all.length, 4);
  return (
    <Svg width={chartW} height={chartH + 24} style={{ alignSelf: 'center' }}>
      {all.map((d, i) => {
        const barH = Math.max((d.mm / maxMm) * chartH, 1);
        const x = i * (barW + 2) + 2;
        const hour = d.t.split('T')[1]?.slice(0, 5) || '';
        return (
          <G key={i}>
            <Rect x={x} y={chartH - barH} width={barW} height={barH}
              fill={d.type === 'obs' ? '#3b82f6' : '#93c5fd'} rx={2} />
            {i % 4 === 0 && (
              <SvgText x={x + barW / 2} y={chartH + 14} fontSize={7} fill="#94a3b8" textAnchor="middle">
                {hour}
              </SvgText>
            )}
          </G>
        );
      })}
      <Line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#cbd5e1" strokeWidth={1} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Kalman scene history chart
// ---------------------------------------------------------------------------
function KalmanChart({ scenes }: { scenes: any[] }) {
  if (!scenes || scenes.length < 2) return null;
  const chartW = SCREEN_W - 48;
  const chartH = 120;
  const maxVal = Math.max(...scenes.map(s => Math.max(s.obs, s.pred)), 1);
  const obsPoints = scenes.map((s, i) => `${(i / (scenes.length - 1)) * chartW},${chartH - (s.obs / maxVal) * (chartH - 20)}`).join(' ');
  const predPoints = scenes.map((s, i) => `${(i / (scenes.length - 1)) * chartW},${chartH - (s.pred / maxVal) * (chartH - 20)}`).join(' ');
  return (
    <Svg width={chartW} height={chartH + 24} style={{ alignSelf: 'center' }}>
      {[0, 0.5, 1].map((frac, i) => (
        <G key={i}>
          <Line x1={0} y1={chartH * (1 - frac * 0.8) - 10} x2={chartW} y2={chartH * (1 - frac * 0.8) - 10} stroke="#f1f5f9" strokeWidth={1} />
          <SvgText x={0} y={chartH * (1 - frac * 0.8) - 14} fontSize={8} fill="#94a3b8">
            {(maxVal * frac).toFixed(1)}
          </SvgText>
        </G>
      ))}
      <Polyline points={predPoints} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
      <Polyline points={obsPoints} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {scenes.map((s, i) => (
        <Circle key={i} cx={(i / (scenes.length - 1)) * chartW} cy={chartH - (s.obs / maxVal) * (chartH - 20)} r={3} fill="#3b82f6" />
      ))}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Convective severity pill
// ---------------------------------------------------------------------------
function ConvPill({ label, level, score }: { label: string; level: string; score: number }) {
  const bg = level === 'quiet' ? '#f0fdf4' : level === 'watch' ? '#fefce8' : '#fef2f2';
  const fg = level === 'quiet' ? '#16a34a' : level === 'watch' ? '#ca8a04' : '#dc2626';
  return (
    <View style={[cs.pill, { backgroundColor: bg }]}>
      <Text style={[cs.pillLabel, { color: fg }]}>{label}</Text>
      <Text style={[cs.pillValue, { color: fg }]}>{level.toUpperCase()}</Text>
      <Text style={cs.pillScore}>{score}%</Text>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { data, isLoading, error } = useNowcastLive();

  if (isLoading) {
    return <View style={cs.center}><ActivityIndicator size="large" color="#3b82f6" /><Text style={cs.loadTxt}>Loading nowcast…</Text></View>;
  }
  if (error || !data) {
    return <View style={cs.center}><Text style={cs.errTxt}>Failed to load nowcast data</Text></View>;
  }

  const playhead = data.playhead;
  const locked = data.locked;
  const sat = data.sat;
  const conv = data.convective || locked?.convective;
  const observed = data.observed || [];
  const knots = data.knots || [];

  const onsetMin = playhead?.seconds_to_onset != null ? Math.floor(playhead.seconds_to_onset / 60) : null;

  return (
    <SafeAreaView style={cs.safe}>
      <ScrollView style={cs.scroll} contentContainerStyle={cs.scrollC} showsVerticalScrollIndicator={false}>

        {/* ── Playhead Status ── */}
        <View style={cs.playCard}>
          <Text style={cs.playTitle}>Live Nowcast Playhead</Text>
          <View style={cs.playRow}>
            <View style={cs.playItem}>
              <Text style={cs.playLabel}>TO ONSET</Text>
              <Text style={cs.playValue}>{onsetMin != null ? `${Math.floor(onsetMin / 60)}h ${onsetMin % 60}m` : 'N/A'}</Text>
            </View>
            <View style={cs.playItem}>
              <Text style={cs.playLabel}>TIDE</Text>
              <Text style={cs.playValue}>{playhead?.tide_m?.toFixed(2) ?? '--'} m</Text>
            </View>
            <View style={cs.playItem}>
              <Text style={cs.playLabel}>PUMP</Text>
              <Text style={[cs.playValue, { color: playhead?.pump === 'ok' ? '#16a34a' : '#dc2626' }]}>
                {playhead?.pump?.toUpperCase() ?? '--'}
              </Text>
            </View>
            <View style={cs.playItem}>
              <Text style={cs.playLabel}>FIELD</Text>
              <Text style={[cs.playValue, { color: playhead?.enterable ? '#16a34a' : '#dc2626' }]}>
                {playhead?.enterable ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>
          <View style={cs.playRow}>
            <View style={cs.playItem}>
              <Text style={cs.playLabel}>PONDING</Text>
              <Text style={cs.playValue}>{playhead?.pond_mm?.toFixed(1) ?? '0'} mm</Text>
            </View>
            <View style={cs.playItem}>
              <Text style={cs.playLabel}>GAP RATE</Text>
              <Text style={cs.playValue}>{playhead?.gap_mm_h?.toFixed(2) ?? '0'} mm/h</Text>
            </View>
            <View style={cs.playItem}>
              <Text style={cs.playLabel}>REGIME</Text>
              <Text style={cs.playValue}>{locked?.regime?.toUpperCase() ?? '--'}</Text>
            </View>
            <View style={cs.playItem}>
              <Text style={cs.playLabel}>KAL LEVEL</Text>
              <Text style={cs.playValue}>{locked?.kal_level?.toUpperCase() ?? '--'}</Text>
            </View>
          </View>
        </View>

        {/* ── Convective Threats ── */}
        {conv && (
          <View style={cs.section}>
            <Text style={cs.secTitle}>⚡ Convective Threats</Text>
            <View style={cs.pillRow}>
              <ConvPill label="LIGHTNING" level={conv.lightning.level} score={conv.lightning.score_pct} />
              <ConvPill label="CLOUDBURST" level={conv.cloudburst.level} score={conv.cloudburst.score_pct} />
              <ConvPill label="DOWNBURST" level={conv.downburst.level} score={conv.downburst.score_pct} />
            </View>
          </View>
        )}

        {/* ── Rain Timeline ── */}
        <View style={cs.section}>
          <Text style={cs.secTitle}>🌧️ Observed + Forecast Rain</Text>
          <View style={cs.legendRow}>
            <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#3b82f6' }]} /><Text style={cs.legendTxt}>Observed</Text></View>
            <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#93c5fd' }]} /><Text style={cs.legendTxt}>Nowcast</Text></View>
          </View>
          <RainTimeline observed={observed} knots={knots} />
        </View>

        {/* ── Kalman Filter ── */}
        {sat?.history?.scenes && sat.history.scenes.length > 0 && (
          <View style={cs.section}>
            <Text style={cs.secTitle}>🔬 Kalman Filter (Sat)</Text>
            <View style={cs.kalStats}>
              <Text style={cs.kalStat}>Rate: {sat.playhead_rate?.toFixed(2)} mm/h</Text>
              <Text style={cs.kalStat}>Error: {sat.last_error_mm_h?.toFixed(2)} mm/h</Text>
              <Text style={cs.kalStat}>Updates: {sat.n_updates}</Text>
              <Text style={cs.kalStat}>MAE: {sat.history.mae?.toFixed(2)}</Text>
            </View>
            <View style={cs.legendRow}>
              <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#3b82f6' }]} /><Text style={cs.legendTxt}>Observed</Text></View>
              <View style={cs.legendItem}><View style={[cs.legendDot, { backgroundColor: '#f59e0b' }]} /><Text style={cs.legendTxt}>Predicted</Text></View>
            </View>
            <KalmanChart scenes={sat.history.scenes} />
          </View>
        )}

        {/* ── Locked Hours ── */}
        {locked?.hours && locked.hours.length > 0 && (
          <View style={cs.section}>
            <Text style={cs.secTitle}>🔒 Locked Forecast Hours</Text>
            {locked.hours.map((h, i) => (
              <View key={i} style={cs.lockedRow}>
                <Text style={cs.lockedTime}>{h.t.split('T')[1]?.slice(0, 5) || h.t}</Text>
                <Text style={cs.lockedMm}>{h.mm.toFixed(2)} mm</Text>
                <Text style={cs.lockedPwet}>P(wet): {(h.p_wet * 100).toFixed(0)}%</Text>
                <Text style={cs.lockedLead}>+{h.lead_h}h</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const cs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  scrollC: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadTxt: { marginTop: 12, color: '#64748b', fontSize: 14 },
  errTxt: { color: '#ef4444', fontSize: 16 },
  // Play card
  playCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  playTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  playRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  playItem: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, flex: 1, minWidth: 70 },
  playLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '700', letterSpacing: 0.5 },
  playValue: { fontSize: 14, color: '#0f172a', fontWeight: '700', marginTop: 2 },
  // Section
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
  secTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  // Pills
  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, flex: 1, minWidth: 90, alignItems: 'center' },
  pillLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  pillValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  pillScore: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  // Legend
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: 11, color: '#64748b' },
  // Kalman stats
  kalStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  kalStat: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, color: '#475569' },
  // Locked
  lockedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  lockedTime: { fontSize: 13, color: '#334155', fontWeight: '600', width: 50 },
  lockedMm: { fontSize: 13, color: '#3b82f6', fontWeight: '700' },
  lockedPwet: { fontSize: 12, color: '#64748b' },
  lockedLead: { fontSize: 12, color: '#94a3b8' },
});
