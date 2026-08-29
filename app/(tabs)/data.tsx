import React from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForecastData, useRisks } from '../../src/api/client';
import Svg, { Rect, Line, Polyline, Circle, Text as SvgText, G } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Discharge Chart (river discharge 7-day)
// ---------------------------------------------------------------------------
function DischargeChart({ data }: { data: number[] }) {
  const chartW = SCREEN_W - 48;
  const H = 80;
  const maxD = Math.max(...data, 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * chartW},${H - (d / maxD) * (H - 10)}`).join(' ');
  return (
    <Svg width={chartW} height={H + 20} style={{ alignSelf: 'center' }}>
      <Line x1={0} y1={H} x2={chartW} y2={H} stroke="#e2e8f0" strokeWidth={1} />
      <Polyline points={points} fill="none" stroke="#3b82f6" strokeWidth={2} />
      {data.map((d, i) => (
        <G key={i}>
          <Circle cx={(i / (data.length - 1)) * chartW} cy={H - (d / maxD) * (H - 10)} r={3} fill="#3b82f6" />
          <SvgText x={(i / (data.length - 1)) * chartW} y={H + 14} fontSize={8} fill="#94a3b8" textAnchor="middle">
            {`d+${i}`}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

export default function DataScreen() {
  const { data: forecast, isLoading, error } = useForecastData();
  const { data: risksData } = useRisks();

  if (isLoading) {
    return <View style={ds.center}><ActivityIndicator size="large" color="#3b82f6" /><Text style={ds.loadTxt}>Loading forecast…</Text></View>;
  }
  if (error || !forecast) {
    return <View style={ds.center}><Text style={ds.errTxt}>Failed to load forecast</Text></View>;
  }

  const predictive = forecast.predictive;
  const current = forecast.descriptive?.current;
  const precip = forecast.descriptive?.series?.precip_hourly || [];
  const discharge = forecast.descriptive?.series?.discharge_daily || [];
  const outlook = predictive?.outlook_days || [];
  const risks = risksData?.risks || [];

  return (
    <SafeAreaView style={ds.safe}>
      <ScrollView style={ds.scroll} contentContainerStyle={ds.scrollC} showsVerticalScrollIndicator={false}>

        {/* ── Summary Chips ── */}
        <View style={ds.section}>
          <Text style={ds.secTitle}>📊 Forecast Summary</Text>
          <View style={ds.chipRow}>
            <View style={ds.chip}><Text style={ds.chipLabel}>Rain 7d</Text><Text style={ds.chipVal}>{predictive?.precip_7d_mm?.toFixed(1) ?? '--'} mm</Text></View>
            <View style={ds.chip}><Text style={ds.chipLabel}>Water Balance</Text><Text style={ds.chipVal}>{predictive?.water_balance_7d_mm?.toFixed(1) ?? '--'} mm</Text></View>
            <View style={ds.chip}><Text style={ds.chipLabel}>ET₀ 7d</Text><Text style={ds.chipVal}>{predictive?.et0_7d_mm?.toFixed(1) ?? '--'} mm</Text></View>
          </View>
          <View style={ds.chipRow}>
            <View style={[ds.chip, { backgroundColor: predictive?.flood_discharge_trend === 'rising' ? '#fef2f2' : '#f0fdf4' }]}>
              <Text style={ds.chipLabel}>Discharge Trend</Text>
              <Text style={[ds.chipVal, { color: predictive?.flood_discharge_trend === 'rising' ? '#dc2626' : '#16a34a' }]}>
                {predictive?.flood_discharge_trend?.toUpperCase() || '--'}
              </Text>
            </View>
            {predictive?.irrigate_dates?.length === 0 && (
              <View style={[ds.chip, { backgroundColor: '#f0fdf4' }]}>
                <Text style={ds.chipLabel}>Irrigate</Text>
                <Text style={[ds.chipVal, { color: '#16a34a' }]}>NOT NEEDED</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Outlook Days Table ── */}
        {outlook.length > 0 && (
          <View style={ds.section}>
            <Text style={ds.secTitle}>📅 7-Day Outlook</Text>
            {/* Header */}
            <View style={ds.tableRow}>
              <Text style={[ds.tableH, { flex: 1.5 }]}>Date</Text>
              <Text style={ds.tableH}>Rain</Text>
              <Text style={ds.tableH}>Prob</Text>
              <Text style={ds.tableH}>Max°C</Text>
              <Text style={ds.tableH}>ET₀</Text>
              <Text style={ds.tableH}>W.Bal</Text>
            </View>
            {outlook.map((day, i) => (
              <View key={i} style={[ds.tableRow, day.flood_watch && { backgroundColor: '#fef2f2' }]}>
                <Text style={[ds.tableCell, { flex: 1.5, fontWeight: '600' }]}>{day.date.slice(5)}</Text>
                <Text style={ds.tableCell}>{day.precip_mm.toFixed(1)}</Text>
                <Text style={ds.tableCell}>{day.precip_prob_pct}%</Text>
                <Text style={ds.tableCell}>{day.temp_max_c.toFixed(1)}</Text>
                <Text style={ds.tableCell}>{day.et0_mm.toFixed(1)}</Text>
                <Text style={[ds.tableCell, { color: day.water_balance_mm > 10 ? '#dc2626' : '#334155' }]}>
                  {day.water_balance_mm.toFixed(1)}
                </Text>
              </View>
            ))}
            {/* Badges */}
            <View style={ds.badgeRow}>
              {outlook.some(d => d.flood_watch) && (
                <View style={[ds.badge, { backgroundColor: '#fef2f2' }]}><Text style={[ds.badgeTxt, { color: '#dc2626' }]}>🌊 FLOOD WATCH</Text></View>
              )}
              {outlook.every(d => !d.irrigate) && (
                <View style={[ds.badge, { backgroundColor: '#f0fdf4' }]}><Text style={[ds.badgeTxt, { color: '#16a34a' }]}>💧 NO IRRIGATION</Text></View>
              )}
            </View>
          </View>
        )}

        {/* ── River Discharge Chart ── */}
        {predictive?.river_discharge && predictive.river_discharge.length > 0 && (
          <View style={ds.section}>
            <Text style={ds.secTitle}>🌊 River Discharge (GloFAS)</Text>
            <DischargeChart data={predictive.river_discharge} />
          </View>
        )}

        {/* ── Risk Breakdown ── */}
        {risks.length > 0 && (
          <View>
            <Text style={[ds.secTitle, { marginBottom: 12 }]}>🛡️ Risk Factors</Text>
            {risks.filter(r => r.score_pct > 0).map((risk, i) => {
              const lbl = risk.label.toLowerCase();
              let icon = '⚠️';
              if (lbl.includes('flood') || lbl.includes('water') || lbl.includes('rain')) icon = '🌊';
              else if (lbl.includes('drought') || lbl.includes('dry')) icon = '🏜️';
              else if (lbl.includes('heat') || lbl.includes('temp')) icon = '🌡️';
              else if (lbl.includes('pest') || lbl.includes('disease') || lbl.includes('insect')) icon = '🐛';
              else if (lbl.includes('frost') || lbl.includes('cold') || lbl.includes('freeze')) icon = '❄️';
              else if (lbl.includes('wind') || lbl.includes('cyclone')) icon = '🌪️';
              else if (lbl.includes('air') || lbl.includes('aqi') || lbl.includes('pollution')) icon = '😷';
              else if (lbl.includes('market') || lbl.includes('price')) icon = '📉';
              else if (lbl.includes('crop') || lbl.includes('plant')) icon = '🌱';

              const score = risk.score_pct;
              let level = 'Low';
              let color = '#10b981'; // Green
              if (score > 50) { level = 'High'; color = '#ef4444'; }
              else if (score > 25) { level = 'Medium'; color = '#f59e0b'; }

              return (
                <View key={risk.id || i} style={[
                  ds.section, 
                  { 
                    borderWidth: 1.5, 
                    borderColor: `${color}80`, // 50% opacity border
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    elevation: 5,
                  }
                ]}>
                  <View style={ds.riskHead}>
                    <Text style={ds.riskLabel}>{icon} {risk.label}</Text>
                    <Text style={[ds.riskScore, { color }]}>{score}% ({level})</Text>
                  </View>
                  <View style={ds.riskBarBg}>
                    <View style={[ds.riskBarFill, {
                      width: `${Math.min(score, 100)}%`,
                      backgroundColor: color,
                    }]} />
                  </View>
                  <View style={ds.factorRow}>
                    {risk.factors.filter((f: any) => f.contribution_pct > 0).map((f: any, j: number) => (
                      <Text key={j} style={ds.factorTxt}>{f.label}: {f.contribution_pct}%</Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ds = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { flex: 1 },
  scrollC: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadTxt: { marginTop: 12, color: '#64748b', fontSize: 14 },
  errTxt: { color: '#ef4444', fontSize: 16 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
  secTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  chip: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, flex: 1, minWidth: 90 },
  chipLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  chipVal: { fontSize: 15, color: '#0f172a', fontWeight: '700', marginTop: 2 },
  // Table
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableH: { flex: 1, fontSize: 10, color: '#94a3b8', fontWeight: '700' },
  tableCell: { flex: 1, fontSize: 12, color: '#334155' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  // Risks
  riskCard: { marginBottom: 12 },
  riskHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  riskLabel: { fontSize: 14, fontWeight: '600', color: '#334155' },
  riskScore: { fontSize: 16, fontWeight: '700' },
  riskBarBg: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  riskBarFill: { height: '100%', borderRadius: 3 },
  factorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  factorTxt: { fontSize: 10, color: '#64748b', backgroundColor: '#f8fafc', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
});
