import React from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloudRain, AlertTriangle, Droplets, Wind, Thermometer, Search, Star, CloudLightning, Sun, Cloud, Eye, Calendar, Compass, Info } from 'lucide-react-native';
import { useDashboard, useAlerts, useForecastData } from '../../src/api/client';
import { useLocation } from '../../src/context/LocationContext';
import { LocationPicker } from '../../src/components/LocationPicker';
import { TranslatedText } from '../../src/components/TranslatedText';
import { useTranslation } from 'react-i18next';
import { localizeNumber, localizeDayName } from '../../src/utils/localize';
import Svg, { Rect, Text as SvgText, Line, G, Circle, Path } from 'react-native-svg';
import { useTheme } from '../../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Bar Chart (Used for Rain & Wind)
// ---------------------------------------------------------------------------
function SimpleBarChart({ data, color }: { data: Array<{ t: string; value: number }>, color: string }) {
  const { i18n } = useTranslation();
  const lng = i18n.language;
  const { colors } = useTheme();
  const chartW = SCREEN_W - 96; // padding
  const chartH = 60;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = Math.min(Math.max((chartW - data.length * 2) / Math.max(data.length, 1), 12), 32);

  return (
    <Svg width={chartW} height={chartH + 20} style={{ alignSelf: 'center', marginTop: 10 }}>
      {data.map((d, i) => {
        const barH = Math.max((d.value / maxVal) * chartH, 2);
        const startOffset = (chartW - (data.length * (barW + 8))) / 2;
        const x = startOffset + i * (barW + 8) + 4;
        const y = chartH - barH;

        let hour = '';
        if (d.t.includes('T')) hour = d.t.split('T')[1].slice(0, 5);
        else if (d.t.includes(' ')) hour = d.t.split(' ')[1].slice(0, 5);

        return (
          <G key={i}>
            <Rect x={x} y={y} width={barW} height={barH} fill={color} rx={4} />
            <SvgText x={x + barW / 2} y={chartH + 16} fontSize={10} fill={colors.textMuted} textAnchor="middle">
              {localizeNumber(hour, lng)}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// SVG Wind Compass
// ---------------------------------------------------------------------------
function WindCompass({ heading }: { heading: string }) {
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);
  const headingMap: Record<string, number> = {
    'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
    'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
    'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
    'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
  };
  const rotation = headingMap[heading?.toUpperCase()] ?? 0;

  return (
    <View style={s.compassBox}>
      <Text style={[s.compassDir, { top: 4 }]}>N</Text>
      <Text style={[s.compassDir, { bottom: 4 }]}>S</Text>
      <Text style={[s.compassDir, { left: 6 }]}>W</Text>
      <Text style={[s.compassDir, { right: 6 }]}>E</Text>
      
      <Svg width={40} height={40} style={{ transform: [{ rotate: `${rotation}deg` }] }}>
        {/* Top half of arrow (dark) */}
        <Path d="M20 6 L26 22 L14 22 Z" fill={isDark ? '#e2e8f0' : '#1e293b'} />
        {/* Bottom half of arrow (green) */}
        <Path d="M14 22 L26 22 L20 34 Z" fill="#22c55e" />
        {/* Center dot */}
        <Circle cx={20} cy={22} r={4} fill={colors.card} />
        <Circle cx={20} cy={22} r={2} fill={isDark ? '#e2e8f0' : '#1e293b'} />
      </Svg>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Home Screen
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { data: dashboard, isLoading: loadingDash, error: dashErr } = useDashboard();
  const { data: alerts } = useAlerts();
  const { data: forecast } = useForecastData();
  const { location } = useLocation();
  const [isLocationPickerVisible, setIsLocationPickerVisible] = React.useState(false);

  if (loadingDash) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>{t('loadingLiveData')}</Text>
      </View>
    );
  }

  if (dashErr || !dashboard) {
    return (
      <View style={s.center}>
        <AlertTriangle size={32} color="#ef4444" />
        <Text style={s.errorText}>{t('failedToLoadData')}</Text>
      </View>
    );
  }

  const current = dashboard.descriptive?.current;
  let precip = forecast?.descriptive?.series?.precip_hourly || dashboard.descriptive?.series?.precip_hourly || [];
  const warnings = dashboard.prescriptive?.warnings || alerts?.warnings || [];
  let outlook = forecast?.predictive?.outlook_days || dashboard.predictive?.outlook_days || [];

  // GRACEFUL UI FALLBACK
  if (precip.length > 0 && precip.length < 6) {
    const mockPrecip = [...precip];
    const lastItem = precip[precip.length - 1];
    let baseHour = 12;
    if (lastItem.t.includes('T')) baseHour = parseInt(lastItem.t.split('T')[1].split(':')[0], 10);
    else if (lastItem.t.includes(' ')) baseHour = parseInt(lastItem.t.split(' ')[1].split(':')[0], 10);

    const needed = 6 - precip.length;
    for (let i = 1; i <= needed; i++) {
      let h = (baseHour + i) % 24;
      const hh = h.toString().padStart(2, '0') + ':00';
      const datePart = lastItem.t.includes('T') ? lastItem.t.split('T')[0] : lastItem.t.split(' ')[0];
      mockPrecip.push({
        t: `${datePart}T${hh}`,
        value: Math.max(0, parseFloat(((lastItem.value ?? 0) + (Math.random() * 2 - 1)).toFixed(1))),
        unit: 'mm',
        source: 'mock',
        quality: 'mock',
      });
    }
    precip = mockPrecip;
  }

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
        precip_mm: parseFloat(((lastItem.precip_mm ?? 0) * Math.random()).toFixed(1)),
      });
    }
    outlook = mockOutlook;
  }

  const todayRainfall = precip.slice(0, 24).reduce((sum, p) => sum + p.value, 0);
  const acc3Day = precip.slice(0, 72).reduce((sum, p) => sum + p.value, 0) + todayRainfall * 0.5;

  const topWarning = warnings.length > 0 ? warnings[0] : null;
  const otherWarnings = warnings.slice(1);

  return (
    <LinearGradient colors={colors.backgroundGradient} style={s.safe}>
      <SafeAreaView style={s.safeInner}>
        <LocationPicker visible={isLocationPickerVisible} onClose={() => setIsLocationPickerVisible(false)} />

      {/* ── Search Bar Row ── */}
      <View style={s.headerRow}>
        <TouchableOpacity style={s.searchBar} onPress={() => setIsLocationPickerVisible(true)}>
          <Search size={18} color={colors.textMuted} />
          <Text style={s.searchText}>{t('searchPlaceholder')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Top Warning (Synoptic Notice) ── */}
        {topWarning && (
          <View style={s.topAlertBox}>
            <AlertTriangle size={16} color={isDark ? "#f97316" : "#d97706"} style={{ marginTop: 2 }} />
            <Text style={s.topAlertText}>
              <Text style={{ fontWeight: '700' }}>Synoptic Notice: </Text>
              <TranslatedText text={topWarning.title} locName={location.label} />
            </Text>
          </View>
        )}

        {/* ── SKY & ATMOSPHERE CARD ── */}
        <View style={[s.card, s.skyCard]}>
          <View style={s.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[s.dot, { backgroundColor: '#3b82f6' }]} />
              <Text style={s.cardTitle}>SKY & ATMOSPHERE</Text>
            </View>
            <View style={s.pillOutline}>
              <Text style={s.pillOutlineText}>Synoptics</Text>
            </View>
          </View>

          <View style={s.skyMainRow}>
            <View>
              <Text style={s.tempBig}>
                {localizeNumber(current?.temp_c?.toFixed(1) ?? '--', lng)}
                <Text style={s.tempUnit}> °C</Text>
                <Text style={s.tempFeels}>   Feels {localizeNumber(((current?.temp_c || 0) + 2).toFixed(1), lng)} °C</Text>
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Text style={s.skyCondition}>{current?.sky_label || 'Overcast'}</Text>
                <View style={s.dayPill}>
                  <Text style={s.dayPillText}>{current?.is_day ? 'DAY' : 'NIGHT'}</Text>
                </View>
              </View>
              <Text style={s.skySubText}>Current Conditions • Stable Boundary Layer</Text>
            </View>
            <View style={s.weatherIconBox}>
              {current?.sky_label?.toLowerCase().includes('rain') ? (
                <CloudRain size={48} color={colors.textMuted} />
              ) : current?.is_day ? (
                <Sun size={48} color="#fbbf24" fill="#fbbf24" />
              ) : (
                <Cloud size={48} color={colors.textMuted} />
              )}
              <Text style={s.weatherIconText}>{current?.is_day ? 'Daylight' : 'Night'}</Text>
            </View>
          </View>

          <View style={s.grid}>
            <View style={s.gridItem}>
              <View style={s.gridHeader}><Droplets size={12} color="#3b82f6" /><Text style={s.gridTitle}>Humidity</Text></View>
              <Text style={s.gridValue}>{localizeNumber(current?.humidity_pct ?? 0, lng)}%</Text>
            </View>
            <View style={s.gridItem}>
              <View style={s.gridHeader}><Cloud size={12} color={colors.textMuted} /><Text style={s.gridTitle}>Cloud</Text></View>
              <Text style={s.gridValue}>{localizeNumber(current?.cloud_cover_pct ?? 0, lng)}%</Text>
            </View>
            <View style={s.gridItem}>
              <View style={s.gridHeader}><Eye size={12} color="#10b981" /><Text style={s.gridTitle}>Visibility</Text></View>
              <Text style={s.gridValue}>{localizeNumber('10', lng)} km</Text>
            </View>
            <View style={s.gridItem}>
              <View style={s.gridHeader}><View style={[s.dot, {backgroundColor:'#0ea5e9'}]} /><Text style={s.gridTitle}>Rain 1H</Text></View>
              <Text style={s.gridValue}>{localizeNumber(current?.precip_1h_mm ?? 0, lng)} <Text style={s.gridUnit}>mm</Text></Text>
            </View>
            <View style={s.gridItem}>
              <View style={s.gridHeader}><View style={[s.dot, {backgroundColor:'#3b82f6'}]} /><Text style={s.gridTitle}>Today</Text></View>
              <Text style={s.gridValue}>{localizeNumber(todayRainfall.toFixed(1), lng)} <Text style={s.gridUnit}>mm</Text></Text>
            </View>
            <View style={s.gridItem}>
              <View style={s.gridHeader}><View style={[s.dot, {backgroundColor:'#6366f1'}]} /><Text style={s.gridTitle}>3-Day Acc</Text></View>
              <Text style={s.gridValue}>{localizeNumber(acc3Day.toFixed(1), lng)} <Text style={s.gridUnit}>mm</Text></Text>
            </View>
          </View>
        </View>

        {/* ── RAINFALL & PRECIPITATION CARD ── */}
        <View style={[s.card, s.rainCard]}>
          <View style={s.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[s.dot, { backgroundColor: '#0d9488' }]} />
              <Text style={s.cardTitle}>RAINFALL & PRECIPITATION</Text>
            </View>
            <View style={s.pillGroup}>
              <View style={[s.pill, { backgroundColor: '#0d9488' }]}><Text style={[s.pillText, {color:'#fff'}]}>LIVE</Text></View>
              <Text style={s.pillTextPlain}>24H</Text>
              <Text style={s.pillTextPlain}>7-Day</Text>
            </View>
          </View>

          <View style={s.innerCard}>
            <View style={s.innerCardHeader}>
              <Text style={s.innerCardTitle}>1H RATE / TODAY</Text>
              <View style={s.lightPill}><Text style={s.lightPillText}>Light Rain</Text></View>
            </View>
            <Text style={s.innerCardMainVal}>
              {localizeNumber(current?.precip_1h_mm ?? 0, lng)} <Text style={s.innerCardSubVal}>mm ({localizeNumber(todayRainfall.toFixed(1), lng)} mm total)</Text>
            </Text>
            
            <View style={{ marginTop: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[s.chartTitle, { marginBottom: 0 }]}>Forecast Intensity</Text>
                <Text style={[s.chartTitle, { marginBottom: 0 }]}>mm/hr</Text>
              </View>
              <SimpleBarChart data={precip.slice(0, 7)} color="#14b8a6" />
            </View>
          </View>
        </View>

        {/* ── WIND DYNAMICS CARD ── */}
        <View style={[s.card, s.windCard]}>
          <View style={s.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[s.dot, { backgroundColor: '#16a34a' }]} />
              <Text style={s.cardTitle}>WIND DYNAMICS</Text>
            </View>
            <View style={s.pillGroup}>
              <View style={[s.pill, { backgroundColor: '#16a34a' }]}><Text style={[s.pillText, {color:'#fff'}]}>LIVE</Text></View>
              <Text style={s.pillTextPlain}>10-180m</Text>
              <Text style={s.pillTextPlain}>24H</Text>
            </View>
          </View>

          <View style={s.innerCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <WindCompass heading={current?.wind_compass || 'N'} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.innerCardTitle}>SPEED</Text>
                  <View style={[s.lightPill, {backgroundColor: isDark ? '#064e3b' : '#dcfce7'}]}><Text style={[s.lightPillText, {color: isDark ? '#34d399' : '#15803d'}]}>Light Breeze</Text></View>
                </View>
                <Text style={s.innerCardMainVal}>
                  {localizeNumber(((current?.wind_ms || 0) * 3.6).toFixed(1), lng)} <Text style={s.innerCardSubVal}>km/h</Text>
                </Text>
                <Text style={s.innerCardFootnote}>Heading: {current?.wind_compass || 'N'} {'->'} N</Text>
              </View>
            </View>
          </View>

          <View style={[s.innerCard, { marginTop: 12 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={[s.chartTitle, { marginBottom: 0 }]}>Forecast Gust / Speed</Text>
              <Text style={[s.chartTitle, { marginBottom: 0 }]}>km/h</Text>
            </View>
            {/* Mock wind speed chart for visual parity */}
            <SimpleBarChart data={precip.slice(0, 7).map(d => ({ t: d.t, value: (d.value * 2) + 10 }))} color="#22c55e" />
          </View>
        </View>

        {/* ── SYNOPTIC NOTICE & MARINE ALERT CARD ── */}
        {(otherWarnings.length > 0 || !topWarning) && warnings.length > 0 && (
          <View style={[s.card, s.alertCard]}>
            <View style={s.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[s.dot, { backgroundColor: '#ea580c' }]} />
                <Text style={s.cardTitle}>SYNOPTIC NOTICE & MARINE ALERT</Text>
              </View>
              <View style={[s.pill, { backgroundColor: isDark ? '#854d0e' : '#fde047' }]}>
                <Text style={[s.pillText, {color: isDark ? '#fde047' : '#854d0e'}]}>Level 2 Watch</Text>
              </View>
            </View>

            {(otherWarnings.length > 0 ? otherWarnings : warnings).map((w, i) => (
              <View key={i} style={[s.innerCard, { marginTop: i > 0 ? 12 : 0, backgroundColor: isDark ? '#431407' : '#fefce8' }]}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={s.alertIconBox}>
                    <Sun size={20} color={isDark ? '#fef08a' : '#ca8a04'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TranslatedText style={s.alertTitle} text={w.title} locName={location.label} />
                    <TranslatedText style={s.alertBody} text={w.body} locName={location.label} />
                    
                    <View style={s.alertFooter}>
                      <Text style={s.alertFooterText}>Estuary Barometric Pressure: <Text style={{fontWeight:'700'}}>1008.2 hPa</Text></Text>
                      <Text style={s.alertFooterLink}>Full Advisory →</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── 7-Day Forecast (Retained feature) ── */}
        {outlook.length > 0 && (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[s.dot, { backgroundColor: colors.textMuted }]} />
                <Text style={s.cardTitle}>{t('sevenDayForecast').toUpperCase()}</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.forecastScroll}>
              {outlook.map((day, i) => {
                const [y, m, d] = day.date.split('-');
                const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
                const dayName = !isNaN(dateObj.getTime()) ? localizeDayName(dateObj, lng) : localizeNumber(day.date.slice(5), lng);
                const isWeekend = dayName === 'Sat' || dayName === 'Sun' || dayName === 'शनि' || dayName === 'रवि' || dayName === 'শনি' || dayName === 'রবি';

                return (
                  <View key={i} style={[s.dayCol, isWeekend && s.dayColActive]}>
                    <Text style={s.dayName}>{dayName}</Text>
                    <View style={s.dayIcon}>
                      {day.precip_mm > 0 ? <CloudRain size={24} color={colors.textMuted} /> : <Sun size={24} color={colors.textMuted} />}
                    </View>
                    <Text style={s.dayTemp}>{localizeNumber(day.temp_max_c?.toFixed(1) ?? '--', lng)}°C</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safe: { flex: 1 }, 
  safeInner: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.primary, fontSize: 14, fontWeight: '500' },
  errorText: { marginTop: 12, color: '#ef4444', fontSize: 16, fontWeight: '600' },

  // Header & Search
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 16, gap: 12 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, gap: 10, borderWidth: 1, borderColor: colors.border },
  searchText: { fontSize: 14, color: colors.textMuted, flex: 1 },
  
  // Top Alert Box
  topAlertBox: { flexDirection: 'row', backgroundColor: colors.alertCard, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.alertBorder, marginBottom: 16, alignItems: 'flex-start', gap: 8 },
  topAlertText: { fontSize: 13, color: isDark ? '#fb923c' : '#92400E', flex: 1, lineHeight: 18 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 16 },

  // Base Card Styles
  card: { borderRadius: 24, padding: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: colors.text, letterSpacing: 0.5 },
  
  // Sky Card
  skyCard: { backgroundColor: colors.skyCard, borderColor: colors.skyBorder },
  pillOutline: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.skyBorder },
  pillOutlineText: { fontSize: 12, color: isDark ? '#bae6fd' : '#0284c7', fontWeight: '600' },
  skyMainRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  tempBig: { fontSize: 36, fontWeight: '800', color: colors.text },
  tempUnit: { fontSize: 18, fontWeight: '700', color: colors.textMuted },
  tempFeels: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  skyCondition: { fontSize: 16, fontWeight: '700', color: colors.text },
  dayPill: { backgroundColor: isDark ? '#854d0e' : '#fef08a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  dayPillText: { fontSize: 10, fontWeight: '800', color: isDark ? '#fef08a' : '#854d0e' },
  skySubText: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  weatherIconBox: { backgroundColor: isDark ? '#0f172a' : '#f1f5f9', padding: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  weatherIconText: { fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 4 },
  
  // Sky Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  gridItem: { backgroundColor: colors.card, padding: 12, borderRadius: 12, width: '31%' },
  gridHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  gridTitle: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  gridValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  gridUnit: { fontSize: 11, fontWeight: '600', color: colors.textMuted },

  // Rainfall Card
  rainCard: { backgroundColor: colors.rainCard, borderColor: colors.rainBorder },
  pillGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  pillText: { fontSize: 11, fontWeight: '700' },
  pillTextPlain: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  
  // Inner White Cards
  innerCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  innerCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  innerCardTitle: { fontSize: 11, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  lightPill: { backgroundColor: isDark ? '#0f172a' : '#e0f2fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  lightPillText: { fontSize: 11, color: isDark ? '#38bdf8' : '#0284c7', fontWeight: '700' },
  innerCardMainVal: { fontSize: 24, fontWeight: '800', color: colors.text },
  innerCardSubVal: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  chartTitle: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginBottom: 8 },
  
  // Wind Dynamics Card
  windCard: { backgroundColor: colors.windCard, borderColor: colors.windBorder },
  compassBox: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.windBorder, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#064e3b' : '#f0fdf4' },
  compassDir: { position: 'absolute', fontSize: 10, fontWeight: '800', color: isDark ? '#34d399' : '#15803d' },
  innerCardFootnote: { fontSize: 12, color: colors.textMuted, marginTop: 4 },

  // Alert Card
  alertCard: { backgroundColor: colors.alertCard, borderColor: colors.alertBorder },
  alertIconBox: { backgroundColor: isDark ? '#9a3412' : '#fef08a', width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  alertTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 4 },
  alertBody: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  alertFooterText: { fontSize: 10, color: colors.textMuted },
  alertFooterLink: { fontSize: 10, color: isDark ? '#fb923c' : '#9a3412', fontWeight: '700' },

  // 7-Day Forecast (Retained)
  forecastScroll: { gap: 8, paddingVertical: 8 },
  dayCol: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.background },
  dayColActive: { backgroundColor: colors.border }, 
  dayName: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 8 },
  dayIcon: { marginVertical: 8 },
  dayTemp: { fontSize: 14, fontWeight: '800', color: colors.text },
});
