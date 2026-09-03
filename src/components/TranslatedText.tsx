import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { localizeDynamicText } from '../utils/localize';
import { fetchTranslation } from '../api/translate';

interface TranslatedTextProps extends TextProps {
  text: string;
  locName: string;
}

export function TranslatedText({ text, locName, ...props }: TranslatedTextProps) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language;
  
  // Try synchronous translation first
  const syncTranslation = localizeDynamicText(text, t, locName);
  
  // If the translation succeeds (doesn't just return the original English text), use it
  const isTranslatedSync = syncTranslation !== text;
  
  const [asyncText, setAsyncText] = useState<string | null>(null);

  useEffect(() => {
    // If it's already translated, or we are in English, do nothing
    if (isTranslatedSync || lng === 'en') {
      setAsyncText(null);
      return;
    }

    // Otherwise, we must fetch from LibreTranslate
    let isMounted = true;
    
    fetchTranslation(text, lng).then(translated => {
      if (isMounted) {
        setAsyncText(translated);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, lng, isTranslatedSync]);

  // If we have an async translation, show it.
  // Otherwise, fallback to the synchronous result (which might just be the English string while loading)
  const displayString = asyncText !== null ? asyncText : syncTranslation;

  return (
    <Text {...props}>
      {displayString}
    </Text>
  );
}
