import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, RefreshCw, MapPin, Star, Plus, Mic, MicOff } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { useChatMutation } from '../../src/api/client';
import { useLocation } from '../../src/context/LocationContext';
import { useTranslation } from 'react-i18next';
import { ChatHistoryEntry } from '../../src/types';

const PRESETS = [
  'WB FLOOD RANKING', 'NEXT 2 HOURS?', 'SHOULD I IRRIGATE?',
  'LIST WB DISTRICTS', 'LIST ODISHA DISTRICTS', '7-DAY OUTLOOK',
  'STATE MANDI PRICES', 'COMPARE WITH PUNE', 'AIR QUALITY'
];

const LOCALES = ['en', 'hi', 'bn'] as const;

interface ChatBubble {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: any[];
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
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const chatMutation = useChatMutation();

  const currentLocale = LOCALES[localeIdx];

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.log('Voice Error:', e.error);
      setIsListening(false);
    };
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (e.value && e.value.length > 0) {
        setInput(e.value[0]);
      }
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      Speech.stop();
    };
  }, []);

  const toggleListening = async () => {
    if (isListening) {
      try {
        await Voice.stop();
        setIsListening(false);
      } catch (e) { console.error(e); }
    } else {
      try {
        Speech.stop();
        setInput('');
        await Voice.start(currentLocale === 'en' ? 'en-US' : (currentLocale === 'hi' ? 'hi-IN' : 'bn-IN'));
      } catch (e) { console.error(e); }
    }
  };

  function setLanguage(idx: number) {
    setLocaleIdx(idx);
    i18n.changeLanguage(LOCALES[idx]);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || chatMutation.isPending) return;

    Speech.stop();
    if (isListening) {
      Voice.stop().catch(console.error);
      setIsListening(false);
    }

    const userBubble: ChatBubble = { role: 'user', content: text };
    setMessages(prev => [...prev, userBubble]);
    setInput('');

    // Build history (last 6 turns, ignoring errors)
    const history: ChatHistoryEntry[] = messages
      .filter(m => !m.isError)
      .slice(-6)
      .map((m, idx) => ({
        id: `hist-${Date.now()}-${idx}`,
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    try {
      const response = await chatMutation.mutateAsync({
        message: text,
        locale_hint: currentLocale,
        output_locale: currentLocale,
        history,
        stream: false,
      });

      const responseContent = response.message?.content || 'No response received.';
      const assistantBubble: ChatBubble = {
        role: 'assistant',
        content: responseContent,
        suggestions: response.message?.suggestions,
        citations: response.message?.citations,
      };
      setMessages(prev => [...prev, assistantBubble]);

      Speech.speak(responseContent.replace(/[*_#]/g, ''), {
        language: currentLocale === 'en' ? 'en-US' : (currentLocale === 'hi' ? 'hi-IN' : 'bn-IN'),
        pitch: 1.0,
        rate: 0.9,
      });
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
        <View style={cs.headerContainer}>
          <View style={cs.locationRow}>
            <MapPin size={18} color="#1e3a8a" />
            <Text style={cs.locationName}>{location.label}</Text>
          </View>
          <Star size={20} color="#0f172a" />
        </View>

        {/* ── Buttons Row ── */}
        <View style={cs.buttonsRow}>
          <View style={cs.langGroup}>
            {LOCALES.map((loc, idx) => (
              <TouchableOpacity key={loc} style={[cs.topBtn, idx === localeIdx && cs.topBtnActive]} onPress={() => setLanguage(idx)}>
                <Text style={[cs.topBtnTxt, idx === localeIdx && cs.topBtnTxtActive]}>{loc.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={cs.actionGroup}>
            <TouchableOpacity style={cs.topBtn} onPress={() => setMessages([])}>
              <Text style={cs.topBtnTxt}>Clear chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={cs.topBtn} onPress={() => {}}>
              <Text style={cs.topBtnTxt}>Regenerate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Main Chat Card ── */}
        <View style={cs.chatCard}>
          <ScrollView ref={scrollRef} style={cs.msgScroll} contentContainerStyle={cs.msgContent} showsVerticalScrollIndicator={false}>
            {messages.length === 0 && (
              <View style={cs.emptyState}>
                <View style={cs.presetGrid}>
                  {PRESETS.map((p, i) => (
                    <TouchableOpacity key={i} style={cs.presetBtn} onPress={() => sendMessage(p)} disabled={chatMutation.isPending}>
                      <Text style={cs.presetTxt}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={cs.emptyTitle}>Choose a preset...</Text>
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
                    {msg.suggestions.map((s, j) => {
                      const textLabel = typeof s === 'string' ? s : (s?.label || JSON.stringify(s));
                      return (
                        <TouchableOpacity key={j} style={cs.sugBtn} onPress={() => sendMessage(textLabel)} disabled={chatMutation.isPending}>
                          <Text style={cs.sugTxt}>{textLabel}</Text>
                        </TouchableOpacity>
                      );
                    })}
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
                <ActivityIndicator size="small" color="#0369a1" />
                <Text style={cs.thinkTxt}>Thinking…</Text>
              </View>
            )}
          </ScrollView>

          {/* ── Input Bar (Inside Card) ── */}
          <View style={cs.inputArea}>
            <View style={cs.inputWrapper}>
              <TouchableOpacity onPress={toggleListening} style={cs.micBtn}>
                {isListening ? <MicOff size={20} color="#ef4444" /> : <Mic size={20} color="#0369a1" />}
              </TouchableOpacity>
              <TextInput
                style={cs.input}
                value={input}
                onChangeText={setInput}
                placeholder={isListening ? "Listening..." : ""}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage(input)}
              />
              <TouchableOpacity style={cs.sendBtn} onPress={() => sendMessage(input)} disabled={chatMutation.isPending || !input.trim()}>
                <Text style={cs.sendBtnTxt}>Send</Text>
              </TouchableOpacity>
            </View>
            
            <View style={cs.checkboxRow}>
              <View style={cs.checkbox} />
              <Text style={cs.checkboxTxt}>English source</Text>
            </View>

            <View style={cs.sourcesCard}>
              <View>
                <Text style={cs.sourcesTitle}>Sources</Text>
                <Text style={cs.sourcesSub}>Open for official names and methods.</Text>
              </View>
              <Plus size={20} color="#0f172a" />
            </View>
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const cs = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#b3d4e9' },
  
  // Header
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  
  // Buttons Row
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  langGroup: { flexDirection: 'row', gap: 6 },
  actionGroup: { flexDirection: 'row', gap: 6 },
  topBtn: { backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#38bdf8', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, elevation: 1 },
  topBtnActive: { backgroundColor: '#bae6fd' },
  topBtnTxt: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  topBtnTxtActive: { color: '#0369a1' },
  
  // Main Chat Card
  chatCard: { flex: 1, backgroundColor: '#f0f9ff', marginHorizontal: 16, marginBottom: 16, borderRadius: 24, borderWidth: 1.5, borderColor: '#38bdf8', overflow: 'hidden' },
  
  // Messages
  msgScroll: { flex: 1 },
  msgContent: { padding: 16, paddingBottom: 20, gap: 12 },
  emptyState: { alignItems: 'center', paddingTop: 10 },
  emptyTitle: { fontSize: 15, color: '#64748b', marginTop: 40 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  presetBtn: { backgroundColor: '#f0f9ff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#38bdf8' },
  presetTxt: { fontSize: 11, color: '#0f172a', fontWeight: '600' },
  
  // Bubbles
  bubble: { borderRadius: 16, padding: 12, maxWidth: '85%' },
  userBubble: { backgroundColor: '#bae6fd', alignSelf: 'flex-end', borderBottomRightRadius: 4, borderWidth: 1, borderColor: '#38bdf8' },
  aiBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
  errorBubble: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#0f172a' },
  aiText: { color: '#334155' },
  errorText: { color: '#dc2626' },
  thinkTxt: { color: '#64748b', fontSize: 12, marginTop: 4 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: '#fee2e2', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  retryTxt: { color: '#dc2626', fontSize: 12, fontWeight: '600' },
  sugRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  sugBtn: { backgroundColor: '#e0f2fe', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#7dd3fc' },
  sugTxt: { fontSize: 11, color: '#0369a1' },
  citRow: { marginTop: 8 },
  citTxt: { fontSize: 10, color: '#64748b', marginBottom: 2 },
  
  // Input Area inside card
  inputArea: { padding: 16, backgroundColor: '#f0f9ff', borderTopWidth: 0 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2fe', borderRadius: 24, paddingLeft: 6, paddingRight: 4, paddingVertical: 4, borderWidth: 1, borderColor: '#38bdf8' },
  micBtn: { padding: 10 },
  input: { flex: 1, fontSize: 14, color: '#0f172a', paddingVertical: 8, paddingHorizontal: 4 },
  sendBtn: { backgroundColor: '#f0f9ff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#38bdf8' },
  sendBtnTxt: { color: '#0f172a', fontSize: 14, fontWeight: '500' },
  
  checkboxRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 6 },
  checkbox: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: '#38bdf8', backgroundColor: '#e0f2fe' },
  checkboxTxt: { fontSize: 12, color: '#0f172a', fontWeight: '500' },
  
  sourcesCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2fe', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#38bdf8', marginTop: 12 },
  sourcesTitle: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  sourcesSub: { fontSize: 11, color: '#475569', marginTop: 2 }
});
