import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { tokens } from '../theme/tokens';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage } = useLanguage();

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
    <TouchableOpacity style={styles.button} onPress={handleToggle}>
      <Text style={styles.text}>{getLabel()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: tokens.colors.background.secondary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.borders.default,
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.text.primary,
  }
});
