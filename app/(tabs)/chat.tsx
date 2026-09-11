import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, NativeModules } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, MicOff, RefreshCw, MapPin, Globe, X, CloudRain, AlertTriangle, Sun, Wind, ArrowUp, ThumbsUp, ThumbsDown, Copy, Eye, Activity, Navigation, Download } from 'lucide-react-native';
import * as Speech from 'expo-speech';

// Safely load Voice (requires native build; silently unavailable in Expo Go)
let Voice: any = null;
try {
  Voice = require('@react-native-voice/voice').default;
} catch (_) {
  console.warn('Voice module not available — run `npx expo run:android` to enable STT.');
}
import { useLocation } from '../../src/context/LocationContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

const LOCALE_OPTIONS = [
  { key: 'en', label: 'EN', ietf: 'en-IN', i18nLang: 'en', tts: 'en-IN' },
  { key: 'hi', label: 'HI', ietf: 'hi-IN', i18nLang: 'hi', tts: 'hi-IN' },
  { key: 'bn', label: 'BN', ietf: 'bn-IN', i18nLang: 'bn', tts: 'bn-IN' },
] as const;

interface ChatBubble {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isMockedIndex?: number;
}

export default function ChatScreen() {
  const { t, i18n } = useTranslation();
  const { location } = useLocation();
  const { colors, isDark } = useTheme();
  const { currentLanguage } = useLanguage();
  const cs = createStyles(colors, isDark);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const currentLocaleOption = LOCALE_OPTIONS.find(l => l.key === currentLanguage) || LOCALE_OPTIONS[0];

  const voiceAvailable = Voice != null && !!(NativeModules.Voice || NativeModules.PlatformVoice);

  useEffect(() => {
    if (!voiceAvailable) return;
    try {
      Voice.onSpeechStart = () => setIsListening(true);
      Voice.onSpeechEnd = () => setIsListening(false);
      Voice.onSpeechError = (e: any) => {
        setIsListening(false);
      };
      Voice.onSpeechResults = (e: any) => {
        if (e.value && e.value.length > 0) {
          setInput(e.value[0]);
        }
      };
    } catch (err) {
      console.warn('Voice module setup failed:', err);
    }
    return () => {
      try {
        if (voiceAvailable) Voice.destroy().then(Voice.removeAllListeners);
      } catch (_) {}
      Speech.stop();
    };
  }, [voiceAvailable]);

  const toggleListening = async () => {
    if (!voiceAvailable) {
      alert('Microphone requires a native build. Run npx expo run:android');
      return;
    }
    if (isListening) {
      try {
        await Voice.stop();
        setIsListening(false);
      } catch (e) {}
    } else {
      try {
        Speech.stop();
        setInput('');
        await Voice.start(currentLocaleOption.tts);
      } catch (e) { 
        setIsListening(false);
      }
    }
  };

  // setLanguage is no longer used here as it's managed in Settings


  async function sendMessage(text: string) {
    if (!text.trim() || isPending) return;

    try { Speech.stop(); } catch (_) {}
    if (isListening && voiceAvailable) {
      Voice.stop().catch(console.error);
      setIsListening(false);
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const userBubble: ChatBubble = { role: 'user', content: text, timestamp: `${timeStr} IST ✓` };
    setMessages(prev => [...prev, userBubble]);
    setInput('');
    setIsPending(true);

    const aiCount = messages.filter(m => m.role === 'assistant').length;

    // Fake network delay for mock integration
    setTimeout(() => {
      setIsPending(false);
      
      let spokenText = "";
      if (aiCount === 0) spokenText = "Yes, moderate to heavy rainfall is expected starting 16:30 IST.";
      else if (aiCount === 1) spokenText = "Convective Squall Alert. Peak gusts reaching up to 48 kilometers per hour.";
      else if (aiCount === 2) spokenText = "Temporary suspension recommended from 16:45 IST for Kakdwip Sagar Route.";
      else spokenText = "Conditions improve noticeably after 21:00 IST.";

      try {
        Speech.speak(spokenText, {
          language: currentLocaleOption.ietf,
          pitch: 1.0,
          rate: 0.9,
        });
      } catch (e) {
        console.warn("TTS Error", e);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `DEMO_${aiCount}`,
        timestamp: `${timeStr} IST`,
        isMockedIndex: aiCount
      }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1200);
  }

  return (
    <LinearGradient colors={colors.backgroundGradient} style={cs.safe}>
      <SafeAreaView style={cs.safeInner} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ── */}
        <View style={cs.headerContainer}>
          <View style={cs.headerLeft}>
            <View style={[cs.logoBox, { backgroundColor: isDark ? '#1e293b' : '#e0f2fe' }]}>
              <Activity size={20} color="#0ea5e9" />
            </View>
            <View style={cs.headerInfo}>
              <View style={cs.headerTitleRow}>
                <Text style={[cs.headerTitle, { color: isDark ? '#38bdf8' : '#0369a1' }]}>PRITHVI-AI</Text>
                <View style={cs.onlineBadge}><Text style={cs.onlineBadgeTxt}>LIVE</Text></View>
              </View>
              <View style={cs.headerLocRow}>
                <MapPin size={10} color={colors.textMuted} />
                <Text style={cs.headerLocTxt}>South 24 Parganas, WB</Text>
              </View>
            </View>
          </View>
          
          <View style={cs.headerRight}>
            <TouchableOpacity onPress={() => setMessages([])} style={cs.iconBtn}>
              <RefreshCw size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Scroll Area ── */}
        <ScrollView ref={scrollRef} style={cs.msgScroll} contentContainerStyle={cs.msgContent} showsVerticalScrollIndicator={false}>
          
          {messages.length > 0 && (
            <View style={cs.dateSeparator}>
              <Activity size={12} color="#0284c7" />
              <Text style={cs.dateSeparatorTxt}>Doppler Radar Alipore • Updated 16:15 IST</Text>
            </View>
          )}

          {messages.map((msg, i) => {
            if (msg.role === 'user') {
              return (
                <View key={i} style={cs.userBubbleWrapper}>
                  <View style={cs.userBubble}>
                    <Text style={cs.userText}>{msg.content}</Text>
                  </View>
                  <Text style={cs.userTimestamp}>{msg.timestamp}</Text>
                </View>
              );
            } else {
              
              // --- AI BUBBLES (MOCKED WIDGETS) ---
              let body = null;
              let footerMeta = '';
              let showActionButtons = true;

              if (msg.isMockedIndex === 0) {
                footerMeta = 'Model: WRF-HighRes v4.4';
                body = (
                  <>
                    <Text style={cs.aiText}>
                      <Text style={{color: '#0284c7', fontWeight: '700'}}>Yes</Text>, moderate to heavy rainfall is expected starting <Text style={{fontWeight: '700'}}>16:30 IST</Text> with <Text style={{color: '#059669', fontWeight: '700'}}>99% confidence</Text>. Convective cluster is currently moving NE with an estimated <Text style={{color: '#0284c7', fontWeight: '700'}}>12-16mm</Text> accumulated precipitation.
                    </Text>
                    <View style={cs.weatherStatsBox2}>
                      <View style={cs.wCol}>
                        <Text style={cs.wTitle}>☁️ Surface</Text>
                        <Text style={cs.wVal}>28.8°C</Text>
                        <Text style={cs.wSub}>Overcast</Text>
                      </View>
                      <View style={cs.wCol}>
                        <Text style={cs.wTitle}>🌧️ Precip</Text>
                        <Text style={[cs.wVal, {color: '#0284c7'}]}>99%</Text>
                        <Text style={[cs.wSub, {color: '#059669'}]}>High Prob.</Text>
                      </View>
                      <View style={cs.wCol}>
                        <Text style={cs.wTitle}>💨 Wind</Text>
                        <Text style={cs.wVal}>11 <Text style={{fontSize: 10, fontWeight: '500'}}>km/h</Text></Text>
                        <Text style={cs.wSub}>Southerly</Text>
                      </View>
                    </View>
                  </>
                );
              } else if (msg.isMockedIndex === 1) {
                footerMeta = 'Coastal Station: IM-04';
                body = (
                  <>
                    <View style={cs.squallBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}>
                        <AlertTriangle size={16} color="#d97706" style={{marginTop: 2}} />
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                          <Text style={cs.squallTitle}>Convective Squall{'\n'}Alert</Text>
                          <View style={cs.squallTimePill}><Text style={cs.squallTimeTxt}>17:00-19:30{'\n'}IST</Text></View>
                        </View>
                      </View>
                      <Text style={cs.squallText}>Peak gusts reaching up to <Text style={{fontWeight: '700'}}>48 km/h</Text> across the Hooghly estuary frontage.</Text>
                    </View>
                    
                    <Text style={cs.aiText}>
                      Fishermen and small crafts are strongly advised <Text style={{color: '#dc2626', fontWeight: '700'}}>not to venture into deep estuary waters</Text>. Transient sea surface chop is expected to amplify during peak squall passage.
                    </Text>

                    <View style={cs.peakGustBox}>
                      <Activity size={20} color="#64748b" />
                      <View style={{flex: 1, marginLeft: 12}}>
                        <Text style={cs.pgTitle}>Peak Gust{'\n'}Potential</Text>
                      </View>
                      <View style={{alignItems: 'center', marginRight: 16}}>
                        <Text style={cs.pgVal}>48</Text>
                        <Text style={cs.pgUnit}>km/h</Text>
                      </View>
                      <View style={cs.galePill}><Text style={cs.galeTxt}>GALE{'\n'}FORCE</Text></View>
                    </View>
                  </>
                );
              } else if (msg.isMockedIndex === 2) {
                footerMeta = 'Source: Port Inland Safety Advisory';
                body = (
                  <>
                    <View style={cs.routeHeaderBox}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <View style={{width: 6, height: 16, backgroundColor: '#b45309', borderRadius: 3}} />
                        <Text style={cs.routeTitle}>Kakdwip – Sagar{'\n'}Route</Text>
                      </View>
                      <View style={cs.routeBadge}><Text style={cs.routeBadgeTxt}>ALERT CODE{'\n'}ORANGE</Text></View>
                    </View>
                    
                    <Text style={cs.aiText}>
                      <Text style={{color: '#dc2626'}}>Temporary suspension recommended</Text> from <Text style={{fontWeight: '700'}}>16:45 IST</Text> due to wave swell reaching <Text style={{fontWeight: '700', color: '#0284c7'}}>2.1m</Text> and sudden drops in visibility {'(<800m)'} under active squall squirts.
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                      <View style={cs.swellBox}>
                        <Text style={cs.swellTitle}>Significant{'\n'}Swell</Text>
                        <Text style={cs.swellVal}>2.1 meters</Text>
                        <Text style={[cs.swellSub, {color: '#dc2626'}]}>Hazardous</Text>
                      </View>
                      <View style={cs.swellBox}>
                        <Text style={cs.swellTitle}>Marine{'\n'}Visibility</Text>
                        <Text style={cs.swellVal}>750 meters</Text>
                        <Text style={[cs.swellSub, {color: '#b45309'}]}>Restricted</Text>
                      </View>
                    </View>
                  </>
                );
              } else {
                footerMeta = 'Nowcast Horizon: +6 Hours';
                body = (
                  <>
                    <Text style={cs.aiText}>
                      Conditions improve noticeably <Text style={{color: '#059669', fontWeight: '700'}}>after 21:00 IST</Text> as convective cells migrate northeastward toward North 24 Parganas and the Sundarbans core. Residual light drizzle may persist overnight until early dawn.
                    </Text>
                    
                    <Text style={cs.timelineLabel}>Progression Timeline:</Text>
                    <View style={cs.timelineRow}>
                      <View style={[cs.tCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                        <Text style={[cs.tTime, { color: '#991b1b' }]}>16:30 -{'\n'}19:30</Text>
                        <Text style={[cs.tDesc, {color: '#7f1d1d'}]}>Peak Squall</Text>
                      </View>
                      <View style={[cs.tCard, { backgroundColor: '#fefce8', borderColor: '#fef08a' }]}>
                        <Text style={[cs.tTime, { color: '#854d0e' }]}>19:30 -{'\n'}21:00</Text>
                        <Text style={[cs.tDesc, {color: '#713f12'}]}>Tapering</Text>
                      </View>
                      <View style={[cs.tCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                        <Text style={[cs.tTime, { color: '#166534' }]}>21:00+{'\n'}IST</Text>
                        <Text style={[cs.tDesc, {color: '#14532d'}]}>Safe /{'\n'}Drizzle</Text>
                      </View>
                    </View>
                  </>
                );
              }

              return (
                <View key={i} style={cs.aiRowWrapper}>
                  <View style={cs.aiLogoBoxLeft}>
                    <Activity size={12} color="#0ea5e9" />
                  </View>
                  <View style={cs.aiBubble}>
                    {body}

                    <View style={cs.aiFooter}>
                      <Text style={cs.aiFooterMeta}>{footerMeta}</Text>
                      {showActionButtons && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <TouchableOpacity><Copy size={12} color={colors.textMuted} /></TouchableOpacity>
                          {msg.isMockedIndex === 3 && (
                            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                               <Activity size={12} color="#0284c7" />
                               <Text style={{fontSize: 9, color: '#0284c7', fontWeight: '700'}}>Doppler{'\n'}Scan</Text>
                            </TouchableOpacity>
                          )}
                          {msg.isMockedIndex !== 3 && <TouchableOpacity><ThumbsUp size={12} color={colors.textMuted} /></TouchableOpacity>}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Sug Pills below last message */}
                  {msg.isMockedIndex === 3 && i === messages.length - 1 && (
                     <View style={cs.bottomPills}>
                       <TouchableOpacity style={cs.bPill}>
                         <Activity size={12} color="#059669" />
                         <Text style={[cs.bPillTxt, {color: '#059669'}]}>View Live Radar Doppler</Text>
                       </TouchableOpacity>
                       <TouchableOpacity style={cs.bPill}>
                         <Download size={12} color="#475569" />
                         <Text style={[cs.bPillTxt, {color: '#475569'}]}>Download IMD Advisory</Text>
                       </TouchableOpacity>
                     </View>
                  )}
                </View>
              );
            }
          })}

          {isPending && (
            <View style={cs.aiRowWrapper}>
              <View style={cs.aiLogoBoxLeft}>
                <Activity size={12} color="#0ea5e9" />
              </View>
              <View style={[cs.aiBubble, { padding: 12 }]}>
                 <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Floating Input Bar ── */}
        <View style={cs.inputWrapper}>
          <TouchableOpacity onPress={toggleListening} style={cs.micBtn}>
            {isListening ? <MicOff size={20} color="#ef4444" /> : <Mic size={20} color={colors.textMuted} />}
          </TouchableOpacity>
          <TextInput
            style={cs.input}
            value={input}
            onChangeText={setInput}
            placeholder={isListening ? "Listening..." : "Ask PRITHVI-AI a follow-up..."}
            placeholderTextColor={colors.textMuted}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity style={cs.targetBtn}>
            <MapPin size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[cs.sendBtn, !input.trim() && {backgroundColor: colors.border}]} onPress={() => sendMessage(input)} disabled={isPending || !input.trim()}>
            <ArrowUp size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safe: { flex: 1 },
  safeInner: { flex: 1 },
  
  // Header
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: 'transparent' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { justifyContent: 'center' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  onlineBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  onlineBadgeTxt: { fontSize: 8, fontWeight: '800', color: '#166534', letterSpacing: 0.5 },
  headerLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerLocTxt: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 4 },
  
  // Messages Scroll
  msgScroll: { flex: 1 },
  msgContent: { padding: 16, paddingBottom: 80 },
  
  // Date Separator
  dateSeparator: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, backgroundColor: isDark ? '#1e293b' : '#e0f2fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 20 },
  dateSeparatorTxt: { fontSize: 10, color: '#0369a1', fontWeight: '700' },
  
  // Bubbles
  userBubbleWrapper: { alignSelf: 'flex-end', marginBottom: 16, maxWidth: '80%' },
  userBubble: { backgroundColor: '#0369a1', borderRadius: 20, borderTopRightRadius: 4, paddingHorizontal: 16, paddingVertical: 12 },
  userText: { fontSize: 14, color: '#fff', lineHeight: 20 },
  userTimestamp: { fontSize: 9, color: colors.textMuted, textAlign: 'right', marginTop: 4, marginRight: 2 },
  
  aiRowWrapper: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 20, maxWidth: '92%' },
  aiLogoBoxLeft: { width: 24, height: 24, borderRadius: 12, backgroundColor: isDark ? '#1e293b' : '#e0f2fe', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  aiBubble: { flex: 1, backgroundColor: colors.card, borderRadius: 16, borderTopLeftRadius: 4, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  aiText: { fontSize: 14, color: colors.text, lineHeight: 22 },
  
  aiFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#f1f5f9' },
  aiFooterMeta: { fontSize: 9, color: colors.textMuted, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  // Fake Rich Blocks
  weatherStatsBox2: { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: colors.border },
  wRow: { flexDirection: 'row', justifyContent: 'space-between' },
  wCol: { flex: 1, alignItems: 'center' },
  wTitle: { fontSize: 9, color: colors.textMuted, fontWeight: '700', marginBottom: 4 },
  wVal: { fontSize: 15, fontWeight: '800', color: colors.text },
  wSub: { fontSize: 9, color: colors.textMuted, marginTop: 2 },

  squallBox: { backgroundColor: isDark ? '#451a03' : '#fffbeb', borderRadius: 8, padding: 12, borderLeftWidth: 4, borderLeftColor: '#d97706', marginBottom: 12 },
  squallTitle: { fontSize: 11, fontWeight: '800', color: '#b45309' },
  squallTimePill: { backgroundColor: isDark ? '#78350f' : '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  squallTimeTxt: { fontSize: 9, color: '#d97706', fontWeight: '700', textAlign: 'right' },
  squallText: { fontSize: 12, color: isDark ? '#fcd34d' : '#92400e', lineHeight: 18 },

  peakGustBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: colors.border },
  pgTitle: { fontSize: 9, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  pgVal: { fontSize: 18, fontWeight: '800', color: '#b45309' },
  pgUnit: { fontSize: 10, color: '#b45309', fontWeight: '700' },
  galePill: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginLeft: 12 },
  galeTxt: { fontSize: 8, color: '#d97706', fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },

  routeHeaderBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  routeTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  routeBadge: { backgroundColor: '#ffedd5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 },
  routeBadgeTxt: { fontSize: 8, color: '#c2410c', fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },
  
  swellBox: { flex: 1, backgroundColor: isDark ? '#1e293b' : '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  swellTitle: { fontSize: 9, color: colors.textMuted, fontWeight: '700', marginBottom: 8 },
  swellVal: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 4 },
  swellSub: { fontSize: 9, fontWeight: '700' },

  timelineLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  timelineRow: { flexDirection: 'row', gap: 8 },
  tCard: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  tTime: { fontSize: 10, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  tDesc: { fontSize: 9, fontWeight: '600', textAlign: 'center' },

  bottomPills: { marginLeft: 32, marginTop: 4, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  bPillTxt: { fontSize: 10, fontWeight: '600' },

  // Floating Input Bar
  inputWrapper: { position: 'absolute', bottom: 16, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 32, paddingLeft: 16, paddingRight: 8, paddingVertical: 6, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, borderWidth: 1, borderColor: colors.border },
  micBtn: { padding: 4, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 8 },
  targetBtn: { padding: 8, marginRight: 4 },
  sendBtn: { backgroundColor: '#0369a1', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
