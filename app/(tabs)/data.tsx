import React, { useState } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlerts, useMarket } from '../../src/api/client';
import { useLocation } from '../../src/context/LocationContext';
import { LocationPicker } from '../../src/components/LocationPicker';
import { Search, MapPin, Star, CloudRain, Waves, Leaf, Activity, AlertTriangle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { localizeNumber, localizeDynamicText } from '../../src/utils/localize';
import { TranslatedText } from '../../src/components/TranslatedText';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { useTheme } from '../../src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Market Horizontal Bar Chart
// ---------------------------------------------------------------------------
function MarketBarChart({ data }: { data: any[] }) {
  const { i18n } = useTranslation();
  const lng = i18n.language;
  const { colors, isDark } = useTheme();
  const H = Math.max(300, data.length * 30 + 40);
  const INNER_W = SCREEN_W - 32;
  const PLOT_W = INNER_W - 120; // space for crop names
  const maxPrice = Math.max(...data.map(d => d.modal_price || 0), 1000);
  
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={INNER_W} height={H}>
        {/* Y Axis Crop Labels */}
        {data.map((item, i) => (
          <SvgText key={`y-${i}`} x={110} y={30 + i * 30 + 15} fontSize={10} fill={colors.textMuted} textAnchor="end">
            {item.commodity}
          </SvgText>
        ))}
        
        {/* Bars */}
        {data.map((item, i) => {
          const barW = ((item.modal_price || 0) / maxPrice) * PLOT_W;
          return (
            <Rect key={`bar-${i}`} x={120} y={30 + i * 30 + 4} width={barW} height={16} fill={colors.primary} />
          );
        })}
        
        {/* X Axis & Ticks */}
        <G>
          <Rect x={120} y={H - 25} width={PLOT_W} height={1} fill={colors.border} />
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
            <G key={`tick-${i}`}>
              <Rect x={120 + tick * PLOT_W} y={30} width={1} height={H - 55} fill={isDark ? '#334155' : '#f1f5f9'} />
              <SvgText x={120 + tick * PLOT_W} y={H - 10} fontSize={10} fill={colors.textMuted} textAnchor="middle">
                {localizeNumber(Math.round(tick * maxPrice), lng)}
              </SvgText>
            </G>
          ))}
          <SvgText x={120 + PLOT_W / 2} y={H} fontSize={10} fill={colors.textMuted} textAnchor="middle">Price</SvgText>
        </G>
      </Svg>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Main Data Screen
// ---------------------------------------------------------------------------
export default function DataScreen() {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);
  const { data: alerts, isLoading: loadA } = useAlerts();
  const { data: market, isLoading: loadM } = useMarket();
  const { location } = useLocation();
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);
  const [searchCrop, setSearchCrop] = useState('');

  // Create dynamic mock actions
  const mockActions = React.useMemo(() => {
    const locName = location.label.split(',')[0] || 'Ghatal';
    return [
      { id: '1', action: t('action1', { loc: locName }), when: t('action1When') },
      { id: '2', action: t('action2', { loc: locName }), when: t('action2When') }
    ];
  }, [location.label, t]);

  // Create dynamic mock alerts
  const mockAlerts = React.useMemo(() => {
    const locName = location.label.split(',')[0] || 'Ghatal';
    const seed = location.label.length;
    return {
      warning: t('extremeWarning', { loc: locName }),
      flood: t('floodAlert', { loc: locName }),
      aqi: 40 + (seed % 30),
      marine: t('marineAlert', { val: ((seed % 10) * 0.1).toFixed(1), loc: locName }),
      quake: t('quakeAlert', { val: (3 + (seed % 30) / 10).toFixed(1), dist: 100 + seed * 15 })
    };
  }, [location.label, t]);

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>{t('loadingLiveData')}</Text>
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
    <LinearGradient colors={colors.backgroundGradient} style={s.safe}>
      <SafeAreaView style={s.safeInner}>
        <LocationPicker visible={isLocationPickerVisible} onClose={() => setIsLocationPickerVisible(false)} />
      
      {/* ── Mockup Header ── */}
      <View style={s.headerContainer}>
        <TouchableOpacity style={s.searchBar} onPress={() => setIsLocationPickerVisible(true)}>
          <Search size={18} color={colors.textMuted} />
          <Text style={s.searchText}>{t('searchPlaceholder')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ── Actions Section ── */}
        <View style={s.actionsCard}>
          <Text style={s.sectionTitle}>{t('actions')}</Text>
          <View style={{ gap: 8 }}>
            {actions.map((act: any, i: number) => (
              <View key={i} style={s.actionItem}>
                <TranslatedText style={s.actionText} text={act.action} locName={location.label} />
                <TranslatedText style={s.actionWhen} text={act.when} locName={location.label} />
              </View>
            ))}
          </View>
        </View>

        {/* ── Alerts Grid ── */}
        <View style={s.alertsGrid}>
          {/* Warning */}
          <View style={[s.alertBox, s.alertBoxRed]}>
            <CloudRain size={24} color={isDark ? '#ef4444' : '#0f172a'} />
            <Text style={s.alertMainText}>{mockAlerts.warning}</Text>
            <Text style={s.alertSubText}>IMD-CAP • {localizeNumber(17, lng)} AUG, {localizeNumber('02', lng)}:{localizeNumber(48, lng)} PM</Text>
          </View>
          
          {/* Flood */}
          <View style={[s.alertBox, s.alertBoxTeal]}>
            <Waves size={24} color={isDark ? '#2dd4bf' : '#0f172a'} />
            <Text style={s.alertMainText}>{mockAlerts.flood}</Text>
            <Text style={s.alertSubText}>OPEN-METEO-FLOOD</Text>
          </View>

          {/* AQI */}
          <View style={[s.alertBoxSmall, s.alertBoxBlue]}>
            <Leaf size={24} color={isDark ? '#38bdf8' : '#0f172a'} />
            <Text style={s.alertSmallText}>AQI: {localizeNumber(mockAlerts.aqi, lng)}{'\n'}{t('satisfactory')}</Text>
            <Text style={s.alertSubText}>CPCB/data.gov.in realtime</Text>
          </View>
          
          {/* Marine */}
          <View style={[s.alertBoxSmall, s.alertBoxBlue]}>
            <Waves size={24} color={isDark ? '#38bdf8' : '#0f172a'} />
            <Text style={s.alertSmallText}>{localizeNumber(mockAlerts.marine, lng)}</Text>
            <Text style={s.alertSubText}>open-meteo-marine</Text>
          </View>

          {/* Quake */}
          <View style={[s.alertBoxSmall, s.alertBoxBlue]}>
            <Activity size={24} color={isDark ? '#38bdf8' : '#0f172a'} />
            <Text style={s.alertSmallText}>{localizeNumber(mockAlerts.quake, lng)}</Text>
            <Text style={s.alertSubText}>USGS FDSN</Text>
          </View>
        </View>

        {/* ── Market Price Analysis ── */}
        <View style={s.marketHeaderRow}>
          <Text style={s.marketTitle}>{t('marketPriceAnalysis')}</Text>
          <View style={s.locationRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={s.locationName}>{location.label}</Text>
          </View>
        </View>

        {/* Market Table */}
        <View style={s.marketCard}>
          <Text style={s.sectionTitle}>{t('market')}</Text>
          <View style={s.marketSearchRow}>
            <Search size={16} color={colors.textMuted} />
            <TextInput 
              style={s.marketInput} 
              placeholder="Find a crop..." 
              placeholderTextColor={colors.textMuted}
              value={searchCrop}
              onChangeText={setSearchCrop}
            />
          </View>
          
          <View style={[s.tableRow, { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8, marginTop: 12 }]}>
            <Text style={[s.th, { flex: 2 }]}>{t('crop')}</Text>
            <Text style={[s.th, { flex: 1.5 }]}>{t('market')}</Text>
            <Text style={[s.th, { flex: 1, textAlign: 'right' }]}>{t('priceRs')}</Text>
          </View>
          
          {filteredMandi.slice(0, 15).map((m: any, i: number) => (
            <View key={i} style={[s.tableRow, { paddingVertical: 10, borderBottomWidth: i === filteredMandi.length - 1 ? 0 : 1, borderBottomColor: isDark ? '#334155' : '#f1f5f9' }]}>
              <Text style={[s.td, { flex: 2, color: colors.text, fontWeight: '500' }]}>{t(m.commodity)} - {t(m.variety)}</Text>
              <Text style={[s.td, { flex: 1.5 }]}>{m.market.replace('APMC', t('APMC'))}</Text>
              <Text style={[s.td, { flex: 1, textAlign: 'right', color: colors.text }]}>{localizeNumber(m.modal_price, lng)}</Text>
            </View>
          ))}
          {filteredMandi.length === 0 && (
            <Text style={s.emptyText}>{t('noCropsFound', { crop: searchCrop })}</Text>
          )}
        </View>

        {/* Market Chart */}
        {topMandi.length > 0 && (
          <View style={[s.marketCard, { borderColor: colors.primary }]}>
            <Text style={s.sectionTitle}>{t('market')}</Text>
            <Text style={s.chartSubTitle}>{t('market')}</Text>
            <MarketBarChart data={topMandi} />
          </View>
        )}
        
        {/* Sources */}
        <View style={s.marketCard}>
          <Text style={s.sectionTitle}>{t('sources')}</Text>
          <Text style={s.actionText}>{t('ogdSource')}</Text>
        </View>

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
  
  // Header
  headerContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 16, gap: 10, opacity: 0.8 },
  searchText: { color: colors.textMuted, fontSize: 15, fontWeight: '500' },
  
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, gap: 16 },

  // Actions
  actionsCard: { backgroundColor: colors.skyCard, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: colors.skyBorder },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 12 },
  actionItem: { backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border },
  actionText: { fontSize: 13, color: colors.text, fontWeight: '500', lineHeight: 18 },
  actionWhen: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  
  // Alerts Grid
  alertsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  alertBox: { width: (SCREEN_W - 44) / 2, backgroundColor: colors.card, borderRadius: 12, padding: 12, borderWidth: 1.5, minHeight: 140 },
  alertBoxSmall: { width: (SCREEN_W - 56) / 3, backgroundColor: colors.card, borderRadius: 12, padding: 10, borderWidth: 1.5, minHeight: 120 },
  alertBoxRed: { borderColor: '#f87171', shadowColor: '#ef4444', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  alertBoxTeal: { borderColor: '#14b8a6' },
  alertBoxBlue: { borderColor: colors.primary },
  alertMainText: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 8, flex: 1 },
  alertSmallText: { fontSize: 11, fontWeight: '700', color: colors.text, marginTop: 8, flex: 1 },
  alertSubText: { fontSize: 9, color: colors.textMuted, textTransform: 'uppercase', marginTop: 4 },

  // Market Header
  marketHeaderRow: { alignItems: 'center', marginTop: 12 },
  marketTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationName: { fontSize: 13, fontWeight: '600', color: colors.primary },
  
  // Market Cards
  marketCard: { backgroundColor: colors.card, borderRadius: 20, padding: 16, borderWidth: 2, borderColor: colors.border, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  marketSearchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, gap: 8 },
  marketInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.text },
  
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  th: { fontSize: 12, fontWeight: '700', color: colors.text },
  td: { fontSize: 12, color: colors.textMuted },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 20, fontSize: 13 },
  chartSubTitle: { textAlign: 'center', fontSize: 13, color: colors.text, marginBottom: 8 },
});
