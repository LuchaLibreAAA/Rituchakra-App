import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, RefreshCw, Globe } from 'lucide-react-native';
import { useChatMutation } from '../../src/api/client';
import { useLocation } from '../../src/context/LocationContext';
import { useTranslation } from 'react-i18next';
import { ChatHistoryEntry } from '../../src/types';

const PRESETS = [
  'Should I irrigate today?',
  'WB flood ranking',
  '7-day outlook for my crop',
  'Explain the current risk score',
  'Best time to apply fertilizer?',
  'Will it rain tomorrow?',
];

const LOCALES = ['en', 'hi', 'bn'] as const;

interface ChatBubble {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  citations?: any[];
  isError?: boolean;
  originalText?: string;
}

export default function ChatScreen() {
  const { t, i18n } = useTranslation();
  const { location } = useLocation();
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState('');
  const [localeIdx, setLocaleIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const chatMutation = useChatMutation();

  const currentLocale = LOCALES[localeIdx];

  function cycleLang() {
    const next = (localeIdx + 1) % LOCALES.length;
    setLocaleIdx(next);
    i18n.changeLanguage(LOCALES[next]);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || chatMutation.isPending) return;
    const userBubble: ChatBubble = { role: 'user', content: text };
    setMessages(prev => [...prev, userBubble]);
    setInput('');

    // Build history (last 6 turns, ignoring errors)
    const history: ChatHistoryEntry[] = messages
      .filter(m => !m.isError)
      .slice(-6)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    try {
      const response = await chatMutation.mutateAsync({
        message: text,
        locale_hint: currentLocale,
        output_locale: currentLocale,
        location: {
          id: location.id,
          label: location.label,
          state: location.state,
          district: location.district,
          lat: location.lat,
          lon: location.lon,
        },
        history,
        stream: false,
      });

      const assistantBubble: ChatBubble = {
        role: 'assistant',
        content: response.message?.content || 'No response received.',
        suggestions: response.message?.suggestions,
        citations: response.message?.citations,
      };
      setMessages(prev => [...prev, assistantBubble]);
    } catch (err: any) {
      let errorMsg = 'Failed to reach the advisor. Please try again.';
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (typeof err === 'string') {
        errorMsg = err;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ System Error:\n${errorMsg}`,
        isError: true,
        originalText: text,
      }]);
    }

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  return (
    <SafeAreaView style={cs.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ── */}
        <View style={cs.header}>
          <Text style={cs.headerTitle}> Rituchakra AI Assistant</Text>
          <TouchableOpacity onPress={cycleLang} style={cs.langBtn}>
            <Globe size={16} color="#3b82f6" />
            <Text style={cs.langTxt}>{currentLocale.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Messages ── */}
        <ScrollView ref={scrollRef} style={cs.msgScroll} contentContainerStyle={cs.msgContent}>
          {messages.length === 0 && (
            <View style={cs.emptyState}>
              <Text style={cs.emptyTitle}>Ask the Rituchakra Advisor</Text>
              <Text style={cs.emptySub}>Get precise agro-meteorological guidance for your location.</Text>
              <View style={cs.presetGrid}>
                {PRESETS.map((p, i) => (
                  <TouchableOpacity key={i} style={cs.presetBtn} onPress={() => sendMessage(p)} disabled={chatMutation.isPending}>
                    <Text style={cs.presetTxt}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((msg, i) => (
            <View key={i} style={[
              cs.bubble, 
              msg.role === 'user' ? cs.userBubble : cs.aiBubble,
              msg.isError && cs.errorBubble
            ]}>
              <Text style={[
                cs.bubbleText, 
                msg.role === 'user' ? cs.userText : cs.aiText,
                msg.isError && cs.errorText
              ]}>
                {msg.content}
              </Text>
              
              {msg.isError && msg.originalText && (
                <TouchableOpacity 
                  style={cs.retryBtn} 
                  onPress={() => {
                    setMessages(prev => prev.filter((_, idx) => idx !== i));
                    sendMessage(msg.originalText!);
                  }}
                >
                  <RefreshCw size={14} color="#dc2626" />
                  <Text style={cs.retryTxt}>Retry Message</Text>
                </TouchableOpacity>
              )}

              {Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && (
                <View style={cs.sugRow}>
                  {msg.suggestions.map((s, j) => (
                    <TouchableOpacity key={j} style={cs.sugBtn} onPress={() => sendMessage(s)} disabled={chatMutation.isPending}>
                      <Text style={cs.sugTxt}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {Array.isArray(msg.citations) && msg.citations.length > 0 && (
                <View style={cs.citRow}>
                  {msg.citations.map((c: any, j: number) => {
                    const citationText = c && typeof c === 'object' ? (c.title || c.source || JSON.stringify(c)) : String(c);
                    return <Text key={j} style={cs.citTxt}>📎 {citationText}</Text>;
                  })}
                </View>
              )}
            </View>
          ))}

          {chatMutation.isPending && (
            <View style={[cs.bubble, cs.aiBubble]}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={cs.thinkTxt}>Thinking…</Text>
            </View>
          )}
        </ScrollView>

        {/* ── Input Bar ── */}
        <View style={cs.inputBar}>
          <TextInput
            style={cs.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('searchPlaceholder') || 'Ask about weather, irrigation, crops…'}
            placeholderTextColor="#94a3b8"
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity style={cs.sendBtn} onPress={() => sendMessage(input)} disabled={chatMutation.isPending}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const cs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  langTxt: { fontSize: 12, fontWeight: '700', color: '#3b82f6' },
  // Messages
  msgScroll: { flex: 1 },
  msgContent: { padding: 16, gap: 12 },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  emptySub: { fontSize: 14, color: '#64748b', marginTop: 4, textAlign: 'center' },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20, justifyContent: 'center' },
  presetBtn: { backgroundColor: '#eff6ff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  presetTxt: { fontSize: 13, color: '#1d4ed8', fontWeight: '500' },
  // Bubbles
  bubble: { borderRadius: 16, padding: 14, maxWidth: '85%' },
  userBubble: { backgroundColor: '#3b82f6', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 1, borderWidth: 1, borderColor: '#e2e8f0' },
  errorBubble: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#fff' },
  aiText: { color: '#334155' },
  errorText: { color: '#dc2626' },
  thinkTxt: { color: '#64748b', fontSize: 12, marginTop: 4 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: '#fee2e2', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  retryTxt: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  sugRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  sugBtn: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  sugTxt: { fontSize: 11, color: '#1d4ed8' },
  citRow: { marginTop: 8 },
  citTxt: { fontSize: 10, color: '#64748b', marginBottom: 2 },
  // Input
  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: 8 },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#0f172a' },
  sendBtn: { backgroundColor: '#3b82f6', borderRadius: 12, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
});
