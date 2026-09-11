import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, Globe } from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme, colors } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();

  const styles = StyleSheet.create({
    safe: { flex: 1 },
    safeInner: { flex: 1 },
    container: { padding: 16 },
    header: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 24 },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    settingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
    settingDesc: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
    langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
    langBtnActive: { backgroundColor: '#0369a1', borderColor: '#0369a1' },
    langBtnTxt: { fontSize: 12, fontWeight: '700', color: colors.text },
    langBtnTxtActive: { color: '#fff' }
  });

  return (
    <LinearGradient colors={colors.backgroundGradient} style={styles.safe}>
      <SafeAreaView style={styles.safeInner}>
        <View style={styles.container}>
        <Text style={styles.header}>Settings</Text>

        <TouchableOpacity 
          style={styles.settingRow} 
          activeOpacity={0.7} 
          onPress={toggleTheme}
        >
          <View style={styles.settingLabelRow}>
            <View style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', padding: 8, borderRadius: 10 }}>
              {isDark ? <Moon size={20} color="#38bdf8" /> : <Sun size={20} color="#0369a1" />}
            </View>
            <View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDesc}>
                {isDark ? 'Dark theme is active' : 'Light theme is active'}
              </Text>
            </View>
          </View>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme} 
            trackColor={{ false: '#cbd5e1', true: '#0369a1' }}
            thumbColor={'#fff'}
          />
        </TouchableOpacity>

        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <View style={{ backgroundColor: isDark ? '#334155' : '#f1f5f9', padding: 8, borderRadius: 10 }}>
              <Globe size={20} color="#059669" />
            </View>
            <View>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingDesc}>
                {currentLanguage === 'hi' ? 'Hindi' : currentLanguage === 'bn' ? 'Bengali' : 'English'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
             <TouchableOpacity onPress={() => changeLanguage('en')} style={[styles.langBtn, currentLanguage === 'en' && styles.langBtnActive]}>
               <Text style={[styles.langBtnTxt, currentLanguage === 'en' && styles.langBtnTxtActive]}>EN</Text>
             </TouchableOpacity>
             <TouchableOpacity onPress={() => changeLanguage('hi')} style={[styles.langBtn, currentLanguage === 'hi' && styles.langBtnActive]}>
               <Text style={[styles.langBtnTxt, currentLanguage === 'hi' && styles.langBtnTxtActive]}>HI</Text>
             </TouchableOpacity>
             <TouchableOpacity onPress={() => changeLanguage('bn')} style={[styles.langBtn, currentLanguage === 'bn' && styles.langBtnActive]}>
               <Text style={[styles.langBtnTxt, currentLanguage === 'bn' && styles.langBtnTxtActive]}>BN</Text>
             </TouchableOpacity>
          </View>
        </View>

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
