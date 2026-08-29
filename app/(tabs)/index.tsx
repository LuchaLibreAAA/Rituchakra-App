import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Search, CloudRain, Cloud, Droplets, Wind, AlertTriangle, Waves, Activity } from 'lucide-react-native';
import { useDashboard, useMarketPrices } from '../../src/api/client';
import { MockBanner } from '../../src/components/MockBanner';
import Svg, { Rect, Text as SvgText, Line, G } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Simple Bar Chart using react-native-svg ──
function HourlyBarChart({ data }: { data: { time: string; rain: number }[] }) {
  const chartW = SCREEN_W - 64;
  const chartH = 120;
  const barW = chartW / data.length - 8;
  const maxRain = Math.max(...data.map(d => d.rain), 0.1);

  return (
    <Svg width={chartW} height={chartH + 30} style={{ alignSelf: 'center' }}>
      {data.map((d, i) => {
        const barH = (d.rain / maxRain) * chartH;
        const x = i * (barW + 8) + 4;
        const y = chartH - barH;
        return (
          <G key={i}>
            <Rect x={x} y={y} width={barW} height={barH} fill="#93c5fd" rx={3} />
            {d.rain > 0 && (
              <SvgText x={x + barW / 2} y={y - 4} fontSize={10} fill="#475569" textAnchor="middle">
                {String(d.rain)}
              </SvgText>
            )}
            <SvgText x={x + barW / 2} y={chartH + 14} fontSize={9} fill="#64748b" textAnchor="middle">
              {d.time}
            </SvgText>
          </G>
        );
      })}
      <Line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke="#cbd5e1" strokeWidth={1} />
    </Svg>
  );
}

// ── Market Price Bar Chart ──
function MarketBarChart({ data }: { data: { crop: string; price: number }[] }) {
  const chartW = SCREEN_W - 64;
  const chartH = 200;
  const barH = 18;
  const maxPrice = Math.max(...data.map(d => d.price));

  return (
    <Svg width={chartW} height={data.length * (barH + 6) + 30}>
      <SvgText x={chartW / 2} y={14} fontSize={12} fill="#1e293b" textAnchor="middle" fontWeight="bold">Market</SvgText>
      {data.map((d, i) => {
        const w = (d.price / maxPrice) * (chartW - 140);
        const y = i * (barH + 6) + 24;
        const label = d.crop.split(' - ')[0].split('(')[0].trim();
        return (
          <G key={i}>
            <SvgText x={0} y={y + 13} fontSize={9} fill="#475569">{label}</SvgText>
            <Rect x={140} y={y} width={w} height={barH} fill="#38bdf8" rx={2} />
          </G>
        );
      })}
      {/* X axis labels */}
      {[0, 2000, 4000, 6000].map((v, i) => (
        <SvgText key={i} x={140 + (v / maxPrice) * (chartW - 140)} y={data.length * (barH + 6) + 38} fontSize={9} fill="#94a3b8" textAnchor="middle">
          {String(v)}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function HomeScreen() {
  const { data: dashboard } = useDashboard();
  const { data: marketPrices } = useMarketPrices();

  if (!dashboard) return <View style={s.center}><Text>Loading...</Text></View>;

  return (
    <SafeAreaView style={s.safe}>
      <MockBanner />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Search Bar ── */}
        <View style={s.searchBar}>
          <Search color="#94a3b8" size={18} />
          <TextInput style={s.searchInput} placeholder="Search city, town or district..." placeholderTextColor="#94a3b8" />
          <View style={s.searchRight}>
            <Text style={s.searchLocation}>📍 Haldia, West Bengal</Text>
            <Star color="#f59e0b" size={18} fill="#f59e0b" />
          </View>
        </View>

        {/* ── Sky + Rain Row ── */}
        <View style={s.row}>
          <View style={[s.card, s.skyCard, { flex: 1.2 }]}>  
            <Text style={s.cardTitle}>Sky</Text>
            <View style={s.skyRow}>
              <CloudRain color="#1e293b" size={36} />
              <Text style={s.tempBig}>{dashboard.sky.temp}°C</Text>
            </View>
            <Text style={s.skyDesc}>{dashboard.sky.condition}, Night - {dashboard.sky.nightTemp}°C</Text>
            <View style={s.skyStats}>
              <Text style={s.skyStat}>Visibility    <Text style={s.bold}>{dashboard.sky.visibility} km</Text></Text>
              <Text style={s.skyStat}>Rain this hour    <Text style={s.bold}>{dashboard.sky.rainThisHour} mm</Text></Text>
            </View>
          </View>
          <View style={[s.card, s.rainCard, { flex: 0.8 }]}>
            <Text style={s.cardTitle}>Today's Rainfall</Text>
            <View style={s.rainRow}>
              <Text style={s.rainBig}>{dashboard.todayRain.amount} <Text style={s.rainUnit}>mm</Text></Text>
              <Cloud color="#1e293b" size={28} />
            </View>
            <Text style={s.rainProb}>Probability</Text>
            <Text style={s.rainDays}>Day1 <Text style={s.bold}>{dashboard.todayRain.probDay1}%</Text>,  Day2 <Text style={s.bold}>{dashboard.todayRain.probDay2}%</Text></Text>
          </View>
        </View>

        {/* ── Next 6 Hours ── */}
        <View style={[s.card, s.chartCard]}>
          <Text style={s.cardTitle}>Next 6 Hours</Text>
          <HourlyBarChart data={dashboard.hourly} />
        </View>

        {/* ── 7-Day Forecast ── */}
        <View style={[s.card, s.forecastCard]}>
          <Text style={s.cardTitle}>7-Day Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dashboard.daily.map((d, i) => (
              <View key={i} style={[s.dayCol, i < 3 && s.dayColHighlight]}>
                <Text style={s.dayName}>{d.day}</Text>
                <CloudRain color="#1e293b" size={20} />
                <Text style={s.dayTemp}>{d.maxTemp} °C</Text>
                <Text style={s.dayLabel}>High/low</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── High Risk Warning ── */}
        {dashboard.risks.filter(r => r.type === 'extreme' || r.type === 'alert').length > 0 && (
          <View style={[s.card, s.riskWarning]}>
            <View style={s.riskHeader}>
              <AlertTriangle color="#ef4444" size={20} />
              <Text style={s.riskTitle}>High Risk Warning</Text>
            </View>
            {dashboard.risks.filter(r => r.type === 'extreme' || r.type === 'alert').map(r => (
              <View key={r.id} style={s.riskItem}>
                <Text style={s.riskText}>{r.title}</Text>
                <Text style={s.riskDesc}>{r.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Actions ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Actions</Text>
          {dashboard.actions.map(a => (
            <View key={a.id} style={s.actionItem}>
              <Text style={s.actionText}>{a.description}</Text>
              <Text style={s.actionTime}>{a.timeframe}</Text>
            </View>
          ))}
        </View>

        {/* ── Alert Cards Row (EXTREME + ALERT) ── */}
        <View style={s.row}>
          {dashboard.risks.filter(r => r.type === 'extreme').map(r => (
            <View key={r.id} style={[s.card, s.alertExtreme, { flex: 1 }]}>
              <CloudRain color="#1e293b" size={24} />
              <Text style={s.alertTitle}>{r.title}</Text>
              <Text style={s.alertSource}>{r.description}</Text>
            </View>
          ))}
          {dashboard.risks.filter(r => r.type === 'alert').map(r => (
            <View key={r.id} style={[s.card, s.alertInfo, { flex: 1 }]}>
              <Waves color="#1e293b" size={24} />
              <Text style={s.alertTitle}>{r.title}</Text>
              <Text style={s.alertDesc}>{r.description}</Text>
              <Text style={s.alertSource}>{r.source}</Text>
            </View>
          ))}
        </View>

        {/* ── AQI / Marine / Quake Row ── */}
        <View style={s.row}>
          {dashboard.risks.filter(r => ['aqi', 'marine', 'quake'].includes(r.type)).map(r => (
            <View key={r.id} style={[s.card, s.infoCard, { flex: 1 }]}>
              {r.type === 'aqi' && <Wind color="#1e293b" size={24} />}
              {r.type === 'marine' && <Waves color="#1e293b" size={24} />}
              {r.type === 'quake' && <Activity color="#1e293b" size={24} />}
              <Text style={s.infoTitle}>{r.title}</Text>
              <Text style={s.infoDesc}>{r.description}</Text>
              <Text style={s.infoSource}>{r.source}</Text>
            </View>
          ))}
        </View>

        {/* ── Market Price Analysis ── */}
        {marketPrices && marketPrices.length > 0 && (
          <>
            <Text style={s.sectionHeader}>Market Price Analysis</Text>
            <View style={[s.card, s.marketCard]}>
              <Text style={s.cardTitle}>Market</Text>
              <View style={s.marketHeader}>
                <Text style={[s.marketCol, { flex: 2 }]}>Crop</Text>
                <Text style={[s.marketCol, { flex: 1 }]}>Market</Text>
                <Text style={[s.marketCol, { flex: 0.6, textAlign: 'right' }]}>Price (₹)</Text>
              </View>
              {marketPrices.map(p => (
                <View key={p.id} style={s.marketRow}>
                  <Text style={[s.marketCell, { flex: 2, fontWeight: '600' }]}>{p.crop}</Text>
                  <Text style={[s.marketCell, { flex: 1 }]}>{p.market}</Text>
                  <Text style={[s.marketCell, { flex: 0.6, textAlign: 'right', fontWeight: '700' }]}>{p.price}</Text>
                </View>
              ))}
            </View>
            <View style={[s.card, s.marketCard]}>
              <Text style={s.cardTitle}>Market</Text>
              <MarketBarChart data={marketPrices.map(p => ({ crop: p.crop, price: p.price }))} />
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#e0f2fe' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e0f2fe' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1e293b' },
  searchRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  searchLocation: { fontSize: 12, color: '#0369a1', fontWeight: '600' },

  // Cards
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#bae6fd' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 0 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 8 },

  // Sky
  skyCard: { borderColor: '#7dd3fc' },
  skyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  tempBig: { fontSize: 32, fontWeight: '700', color: '#1e293b' },
  skyDesc: { fontSize: 12, color: '#475569', marginBottom: 8 },
  skyStats: { gap: 2 },
  skyStat: { fontSize: 12, color: '#475569' },
  bold: { fontWeight: '700' },

  // Rain
  rainCard: { borderColor: '#5eead4' },
  rainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  rainBig: { fontSize: 28, fontWeight: '700', color: '#1e293b' },
  rainUnit: { fontSize: 16, fontWeight: '400' },
  rainProb: { fontSize: 12, color: '#475569' },
  rainDays: { fontSize: 12, color: '#475569' },

  // Chart
  chartCard: { borderColor: '#c4b5fd' },

  // Forecast
  forecastCard: { borderColor: '#d946ef' },
  dayCol: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, marginRight: 4 },
  dayColHighlight: { backgroundColor: '#f5d0fe' },
  dayName: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  dayTemp: { fontSize: 12, fontWeight: '600', color: '#1e293b', marginTop: 4 },
  dayLabel: { fontSize: 10, color: '#94a3b8' },

  // Risk Warning
  riskWarning: { borderColor: '#fca5a5', backgroundColor: '#fef2f2' },
  riskHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  riskTitle: { fontSize: 16, fontWeight: '700', color: '#991b1b' },
  riskItem: { marginBottom: 8, paddingLeft: 8, borderLeftWidth: 3, borderLeftColor: '#ef4444' },
  riskText: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  riskDesc: { fontSize: 11, color: '#475569' },

  // Actions
  actionItem: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  actionText: { fontSize: 13, color: '#1e293b', lineHeight: 18 },
  actionTime: { fontSize: 11, color: '#64748b', marginTop: 4, fontStyle: 'italic' },

  // Alert Cards
  alertExtreme: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  alertInfo: { borderColor: '#38bdf8', backgroundColor: '#f0f9ff' },
  alertTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginTop: 6 },
  alertDesc: { fontSize: 11, color: '#475569', marginTop: 2 },
  alertSource: { fontSize: 10, color: '#94a3b8', marginTop: 4 },

  // Info Cards (AQI, Marine, Quake)
  infoCard: { alignItems: 'center', borderColor: '#bae6fd' },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b', marginTop: 6, textAlign: 'center' },
  infoDesc: { fontSize: 12, color: '#475569', textAlign: 'center' },
  infoSource: { fontSize: 10, color: '#94a3b8', marginTop: 4, textAlign: 'center' },

  // Section Header
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 8, marginBottom: 8, textAlign: 'center' },

  // Market
  marketCard: { borderColor: '#38bdf8' },
  marketHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 6, marginBottom: 4 },
  marketCol: { fontSize: 12, fontWeight: '600', color: '#475569' },
  marketRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  marketCell: { fontSize: 13, color: '#1e293b' },
});
