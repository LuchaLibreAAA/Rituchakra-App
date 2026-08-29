import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Star, Send, ChevronDown, MessageSquare } from 'lucide-react-native';
import { MockBanner } from '../../src/components/MockBanner';
import { mockChatResponses, ChatMessage } from '../../src/mocks/chat.mock';

const PRESETS = [
  'WB FLOOD RANKING', 'NEXT 2 HOURS?', 'SHOULD I IRRIGATE?',
  'LIST WB DISTRICTS', 'LIST ODISHA DISTRICTS', '7-DAY OUTLOOK',
  'STATE MANDI PRICES', 'COMPARE WITH PUNE', 'AIR QUALITY',
];

export default function ChatScreen() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date().toLocaleTimeString() };
    
    // Find a matching mock response
    const key = Object.keys(mockChatResponses).find(k => text.toUpperCase().includes(k)) || 'default';
    const reply: ChatMessage = { id: (Date.now() + 1).toString(), role: 'advisor', content: mockChatResponses[key], timestamp: new Date().toLocaleTimeString() };

    setMessages(prev => [...prev, userMsg, reply]);
    setInput('');
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <MockBanner />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Text style={s.headerLoc}>📍 Haldia, West Bengal {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <Star color="#1e3a5f" size={16} fill="#1e3a5f" />
        </View>
      </View>

      {/* ── Language toggle + actions ── */}
      <View style={s.toolbar}>
        <View style={s.langRow}>
          {['en', 'hi', 'bn'].map(lang => (
            <TouchableOpacity key={lang} onPress={() => i18n.changeLanguage(lang)}
              style={[s.langBtn, i18n.language === lang && s.langActive]}>
              <Text style={[s.langText, i18n.language === lang && s.langActiveText]}>{lang.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => setMessages([])}>
            <Text style={s.actionText}>{t('clearChat')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn}>
            <Text style={s.actionText}>{t('regenerate')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <ScrollView style={s.body} contentContainerStyle={s.bodyContent}>

          {/* ── Preset chips ── */}
          <View style={s.presetCard}>
            <View style={s.presetGrid}>
              {PRESETS.map(p => (
                <TouchableOpacity key={p} style={s.presetChip} onPress={() => sendMessage(p)}>
                  <Text style={s.presetText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Messages or empty state ── */}
          {messages.length === 0 ? (
            <View style={s.empty}>
              <MessageSquare color="#1e3a5f" size={48} />
              <Text style={s.emptyText}>{t('choosePreset')}</Text>
            </View>
          ) : (
            messages.map(msg => (
              <View key={msg.id} style={[s.msgBubble, msg.role === 'user' ? s.userBubble : s.advisorBubble]}>
                <Text style={[s.msgText, msg.role === 'user' ? s.userText : s.advisorText]}>{msg.content}</Text>
                <Text style={s.msgTime}>{msg.timestamp}</Text>
              </View>
            ))
          )}

        </ScrollView>

        {/* ── Input area ── */}
        <View style={s.inputArea}>
          <View style={s.inputRow}>
            <TextInput style={s.textInput} value={input} onChangeText={setInput}
              placeholder="Type your question..." placeholderTextColor="#94a3b8"
              onSubmitEditing={() => sendMessage(input)} returnKeyType="send" />
            <TouchableOpacity style={s.sendBtn} onPress={() => sendMessage(input)}>
              <Text style={s.sendText}>{t('send')}</Text>
            </TouchableOpacity>
          </View>
          <View style={s.checkRow}>
            <View style={s.checkbox} />
            <Text style={s.checkLabel}>{t('englishSource')}</Text>
          </View>
        </View>

        {/* ── Sources accordion ── */}
        <TouchableOpacity style={s.sourcesBar} onPress={() => setSourcesOpen(!sourcesOpen)}>
          <View>
            <Text style={s.sourcesTitle}>{t('sources')}</Text>
            <Text style={s.sourcesSub}>{t('sourcesSub')}</Text>
          </View>
          <ChevronDown color="#475569" size={20} style={sourcesOpen ? { transform: [{ rotate: '180deg' }] } : {}} />
        </TouchableOpacity>
        {sourcesOpen && (
          <View style={s.sourcesBody}>
            <Text style={s.sourceItem}>• IMD (India Meteorological Department)</Text>
            <Text style={s.sourceItem}>• Open-Meteo GloFAS Flood API</Text>
            <Text style={s.sourceItem}>• CPCB Air Quality Index</Text>
            <Text style={s.sourceItem}>• Agmarknet Mandi Prices</Text>
            <Text style={s.sourceItem}>• USGS Earthquake FDSN</Text>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },

  // Header
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLoc: { fontSize: 13, fontWeight: '600', color: '#1e293b' },

  // Toolbar
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  langRow: { flexDirection: 'row', gap: 6 },
  langBtn: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#1e293b', borderRadius: 4 },
  langActive: { backgroundColor: '#1e293b' },
  langText: { fontSize: 12, fontWeight: '700', color: '#1e293b' },
  langActiveText: { color: '#fff' },
  actionRow: { flexDirection: 'row', gap: 6 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 4 },
  actionText: { fontSize: 11, color: '#475569' },

  // Body
  body: { flex: 1 },
  bodyContent: { padding: 16 },

  // Presets
  presetCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetChip: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  presetText: { fontSize: 11, fontWeight: '600', color: '#1e293b' },

  // Empty
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: '#64748b', marginTop: 12 },

  // Messages
  msgBubble: { maxWidth: '85%', borderRadius: 14, padding: 12, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1e3a5f' },
  advisorBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  msgText: { fontSize: 13, lineHeight: 19 },
  userText: { color: '#fff' },
  advisorText: { color: '#1e293b' },
  msgTime: { fontSize: 9, color: '#94a3b8', marginTop: 4, textAlign: 'right' },

  // Input
  inputArea: { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textInput: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 13, color: '#1e293b' },
  sendBtn: { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  sendText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, justifyContent: 'flex-end' },
  checkbox: { width: 14, height: 14, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 3 },
  checkLabel: { fontSize: 11, color: '#475569' },

  // Sources
  sourcesBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
  sourcesTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  sourcesSub: { fontSize: 11, color: '#64748b' },
  sourcesBody: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#fff' },
  sourceItem: { fontSize: 12, color: '#475569', paddingVertical: 2 },
});
