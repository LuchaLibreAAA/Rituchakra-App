import React from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloudRain, AlertTriangle, Droplets, Wind, Thermometer, Eye } from 'lucide-react-native';
import { useDashboard, useAlerts, useMarket } from '../../src/api/client';
import Svg, { Rect, Text as SvgText, Line, G } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Hourly Rain Bar Chart (from real precip_hourly series)
// ---------------------------------------------------------------------------
function HourlyRainChart({ data }: { data: Array<{ t: string; value: number }> }) {
  const chartW = SCREEN_W - 48;
  const chartH = 100;
  const maxRain = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max((chartW - data.length * 2) / data.length, 6);
  return (
    <Svg width={chartW} height={chartH + 24} style={{ alignSelf: 'center' }}>
      {data.map((d, i) => {
        const barH = Math.max((d.value / maxRain) * chartH, 1);
        const x = i * (barW + 2) + 2;
        const y = chartH - barH;
        const hour = d.t.split('T')[1]?.slice(0, 5) || '';
        return (
          <G key={i}>
            <Rect x={x} y={y} width={barW} height={barH} fill="#60a5fa" rx={3} />
            {d.value > 0 && (
              <SvgText x={x + barW / 2} y={y - 4} fontSize={8} fill="#475569" textAnchor="middle">
                {String(d.value)}
              </SvgText>
            )}
            {i % 3 === 0 && (
              <SvgText x={x + barW / 2} y={chartH + 14} fontSize={7} fill="#64748b" textAnchor="middle">
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
// Severity color mapping
// ---------------------------------------------------------------------------
function severityColor(sev: string): string {
  switch (sev) {
    case 'extreme': return '#dc2626';
    case 'alert': return '#ea580c';
    case 'watch': return '#ca8a04';
    default: return '#6b7280';
  }
}

function severityBg(sev: string): string {
  switch (sev) {
    case 'extreme': return '#fef2f2';
    case 'alert': return '#fff7ed';
    case 'watch': return '#fefce8';
    default: return '#f9fafb';
  }
}

// ---------------------------------------------------------------------------
// Main Home Screen
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  const { data: dashboard, isLoading: loadingDash, error: dashErr } = useDashboard();
  const { data: alerts } = useAlerts();
  const [debugLog, setDebugLog] = React.useState<string>('');

  async function runNetworkDebug() {
    setDebugLog('Testing connection...');
    try {
      setDebugLog('Fetching JSONPlaceholder...');
      await fetch('https://jsonplaceholder.typicode.com/todos/1');
      setDebugLog(prev => prev + '\nJSONPlaceholder: OK');
      
      setDebugLog(prev => prev + '\nFetching Render API...');
      const url = `${process.env.EXPO_PUBLIC_API_BASE || 'https://rituchakra-api.onrender.com'}/api/ready`;
      const res = await fetch(url);
      setDebugLog(prev => prev + `\nRender: ${res.status} ${res.statusText}`);
    } catch (e: any) {
      setDebugLog(prev => prev + `\nError: ${e.message}`);
    }
  }

  if (loadingDash) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={s.loadingText}>Loading live data…</Text>
      </View>
    );
  }

  if (dashErr || !dashboard) {
    return (
      <View style={s.center}>
        <AlertTriangle size={32} color="#ef4444" />
        <Text style={s.errorText}>Failed to load data</Text>
        <Text style={s.errorSub}>{String(dashErr || 'No data')}</Text>
        <TouchableOpacity style={{ marginTop: 20, padding: 10, backgroundColor: '#3b82f6', borderRadius: 8 }} onPress={runNetworkDebug}>
          <Text style={{ color: 'white' }}>Run Network Debug</Text>
        </TouchableOpacity>
        {debugLog ? <Text style={{ marginTop: 20, marginHorizontal: 20, fontFamily: 'monospace', fontSize: 10 }}>{debugLog}</Text> : null}
      </View>
    );
  }

  const current = dashboard.descriptive?.current;
  const precip = dashboard.descriptive?.series?.precip_hourly || [];
  const warnings = dashboard.prescriptive?.warnings || alerts?.warnings || [];
  const actions = dashboard.prescriptive?.actions || alerts?.actions || [];
  const risks = dashboard.risks || [];
  const stories = dashboard.diagnostic?.stories || [];
  const predictive = dashboard.predictive;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Location & Sky ── */}
        <View style={s.skyCard}>
          <Text style={s.locationLabel}>{dashboard.location?.label || 'Haldia, West Bengal'}</Text>
          <View style={s.skyRow}>
            <View>
              <Text style={s.tempBig}>{current?.temp_c ?? '--'}°C</Text>
              <Text style={s.skyLabel}>{current?.sky_label || 'Loading…'}</Text>
            </View>
            <View style={s.skyMeta}>
              <View style={s.metaRow}>
                <Droplets size={14} color="#3b82f6" />
                <Text style={s.metaText}>{current?.humidity_pct ?? '--'}%</Text>
              </View>
              <View style={s.metaRow}>
                <Wind size={14} color="#64748b" />
                <Text style={s.metaText}>{current?.wind_ms?.toFixed(1) ?? '--'} m/s {current?.wind_compass || ''}</Text>
              </View>
              <View style={s.metaRow}>
                <CloudRain size={14} color="#60a5fa" />
                <Text style={s.metaText}>{current?.precip_1h_mm ?? 0} mm/h</Text>
              </View>
              {current?.om_us_aqi != null && (
                <View style={s.metaRow}>
                  <Text style={s.metaText}>AQI: {current.om_us_aqi}</Text>
                </View>
              )}
            </View>
          </View>
          {/* Extra stats */}
          <View style={s.statsRow}>
            <View style={s.statChip}><Text style={s.statLabel}>Soil</Text><Text style={s.statValue}>{current?.soil_moisture_m3m3?.toFixed(3) ?? '--'} m³/m³</Text></View>
            <View style={s.statChip}><Text style={s.statLabel}>ET₀</Text><Text style={s.statValue}>{current?.et0_mm ?? '--'} mm</Text></View>
            <View style={s.statChip}><Text style={s.statLabel}>Cloud</Text><Text style={s.statValue}>{current?.cloud_cover_pct ?? '--'}%</Text></View>
            {current?.wave_height_m != null && (
              <View style={s.statChip}><Text style={s.statLabel}>Wave</Text><Text style={s.statValue}>{current.wave_height_m} m</Text></View>
            )}
          </View>
        </View>

        {/* ── Warnings ── */}
        {warnings.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>⚠️ Active Warnings</Text>
            {warnings.slice(0, 5).map((w, i) => (
              <View key={w.id || i} style={[s.warningCard, { backgroundColor: severityBg(w.severity) }]}>
                <View style={[s.sevDot, { backgroundColor: severityColor(w.severity) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.warningTitle, { color: severityColor(w.severity) }]}>{w.title}</Text>
                  {w.body ? <Text style={s.warningBody}>{w.body}</Text> : null}
                  <Text style={s.warningSource}>{w.source}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Actions ── */}
        {actions.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🎯 Recommended Actions</Text>
            {actions.map((a, i) => (
              <View key={a.id || i} style={s.actionCard}>
                <Text style={s.actionText}>{a.action}</Text>
                <Text style={s.actionWhy}>{a.why}</Text>
                <View style={s.actionMeta}>
                  <Text style={s.actionWhen}>⏱ {a.when}</Text>
                  <Text style={s.actionConf}>{a.confidence_pct}% confidence</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Hourly Precipitation ── */}
        {precip.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🌧️ Hourly Precipitation</Text>
            <HourlyRainChart data={precip.slice(0, 24)} />
          </View>
        )}

        {/* ── Predictive Summary ── */}
        {predictive && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>📊 7-Day Predictive Summary</Text>
            <View style={s.statsRow}>
              <View style={s.predChip}><Text style={s.predLabel}>Rain 7d</Text><Text style={s.predValue}>{predictive.precip_7d_mm?.toFixed(1)} mm</Text></View>
              <View style={s.predChip}><Text style={s.predLabel}>Water Bal.</Text><Text style={s.predValue}>{predictive.water_balance_7d_mm?.toFixed(1)} mm</Text></View>
              <View style={s.predChip}><Text style={s.predLabel}>ET₀ 7d</Text><Text style={s.predValue}>{predictive.et0_7d_mm?.toFixed(1)} mm</Text></View>
            </View>
            <View style={s.statsRow}>
              <View style={[s.predChip, { backgroundColor: predictive.flood_discharge_trend === 'rising' ? '#fef2f2' : '#f0fdf4' }]}>
                <Text style={s.predLabel}>Discharge</Text>
                <Text style={[s.predValue, { color: predictive.flood_discharge_trend === 'rising' ? '#dc2626' : '#16a34a' }]}>
                  {predictive.flood_discharge_trend?.toUpperCase()}
                </Text>
              </View>
              {predictive.flood_watch_dates?.length > 0 && (
                <View style={[s.predChip, { backgroundColor: '#fef2f2' }]}>
                  <Text style={s.predLabel}>Flood Watch</Text>
                  <Text style={[s.predValue, { color: '#dc2626' }]}>{predictive.flood_watch_dates.join(', ')}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Diagnostic Stories ── */}
        {stories.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🔬 Diagnostic Insights</Text>
            {stories.map((story, i) => (
              <View key={story.id || i} style={s.storyCard}>
                <Text style={s.storyTitle}>{story.title}</Text>
                <Text style={s.storyWhy}>{story.why}</Text>
                <Text style={s.storyEvidence}>{story.evidence}</Text>
                <Text style={s.storyImpl}>→ {story.implication}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Risk Scores ── */}
        {risks.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>🛡️ Risk Assessment</Text>
            {risks.filter(r => r.score_pct > 0).map((risk, i) => (
              <View key={risk.id || i} style={s.riskRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.riskLabel}>{risk.label}</Text>
                  <Text style={s.riskSev}>{risk.severity} · {risk.confidence_pct}% conf.</Text>
                </View>
                <View style={s.riskBar}>
                  <View style={[s.riskFill, {
                    width: `${Math.min(risk.score_pct, 100)}%`,
                    backgroundColor: risk.score_pct > 50 ? '#dc2626' : risk.score_pct > 25 ? '#f59e0b' : '#22c55e',
                  }]} />
                </View>
                <Text style={s.riskPct}>{risk.score_pct}%</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, color: '#64748b', fontSize: 14 },
  errorText: { marginTop: 12, color: '#ef4444', fontSize: 16, fontWeight: '600' },
  errorSub: { marginTop: 4, color: '#94a3b8', fontSize: 12 },
  // Sky card
  skyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  locationLabel: { fontSize: 13, color: '#64748b', marginBottom: 8, fontWeight: '500' },
  skyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tempBig: { fontSize: 48, fontWeight: '700', color: '#0f172a' },
  skyLabel: { fontSize: 16, color: '#475569', marginTop: 2 },
  skyMeta: { alignItems: 'flex-end', gap: 6, paddingTop: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#475569' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  statChip: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  statValue: { fontSize: 13, color: '#334155', fontWeight: '600' },
  // Sections
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  // Warnings
  warningCard: { flexDirection: 'row', borderRadius: 10, padding: 12, marginBottom: 8, gap: 10 },
  sevDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  warningTitle: { fontSize: 13, fontWeight: '700' },
  warningBody: { fontSize: 12, color: '#475569', marginTop: 2 },
  warningSource: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  // Actions
  actionCard: { backgroundColor: '#f0f9ff', borderRadius: 10, padding: 12, marginBottom: 8 },
  actionText: { fontSize: 14, fontWeight: '600', color: '#0369a1' },
  actionWhy: { fontSize: 12, color: '#475569', marginTop: 4 },
  actionMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  actionWhen: { fontSize: 11, color: '#64748b' },
  actionConf: { fontSize: 11, color: '#16a34a', fontWeight: '600' },
  // Predictive
  predChip: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minWidth: 90 },
  predLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  predValue: { fontSize: 15, color: '#0f172a', fontWeight: '700', marginTop: 2 },
  // Stories
  storyCard: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#3b82f6' },
  storyTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  storyWhy: { fontSize: 12, color: '#475569', marginTop: 4 },
  storyEvidence: { fontSize: 11, color: '#64748b', marginTop: 2, fontStyle: 'italic' },
  storyImpl: { fontSize: 12, color: '#0369a1', marginTop: 4, fontWeight: '500' },
  // Risks
  riskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  riskLabel: { fontSize: 13, fontWeight: '600', color: '#334155' },
  riskSev: { fontSize: 10, color: '#94a3b8' },
  riskBar: { width: 80, height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  riskFill: { height: '100%', borderRadius: 4 },
  riskPct: { fontSize: 14, fontWeight: '700', color: '#334155', width: 36, textAlign: 'right' },
});
