import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { colors } = useTheme();

  const handleToggle = () => {
    if (currentLanguage === 'en') changeLanguage('hi');
    else if (currentLanguage === 'hi') changeLanguage('bn');
    else changeLanguage('en');
  };

  const getLabel = () => {
    if (currentLanguage === 'en') return 'EN';
    if (currentLanguage === 'hi') return 'हिं';
    if (currentLanguage === 'bn') return 'বাং';
    return 'EN';
  };

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleToggle}>
      <Text style={[styles.text, { color: colors.text }]}>{getLabel()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  }
});
