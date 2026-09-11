import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { X, MapPin, Search } from 'lucide-react-native';
import { useGeoSearch } from '../api/client';
import { useLocation } from '../context/LocationContext';
import { useTranslation } from 'react-i18next';
import { Location } from '../types';
import { useTheme } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function LocationPicker({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const { setLocation } = useLocation();
  const { colors, isDark } = useTheme();
  const s = createStyles(colors, isDark);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the query to avoid spamming the API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading, isError } = useGeoSearch(debouncedQuery);

  function handleSelect(loc: Location) {
    setLocation(loc);
    setQuery('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.title}>{t('changeLocation')}</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <X color={colors.textMuted} size={24} />
          </TouchableOpacity>
        </View>

        <View style={s.searchBar}>
          <Search color={colors.textMuted} size={20} />
          <TextInput
            style={s.input}
            placeholder={t('searchLocations')}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X color={colors.textMuted} size={16} />
            </TouchableOpacity>
          )}
        </View>

        {isLoading && query.length > 2 && (
          <View style={s.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {isError && (
          <View style={s.center}>
            <Text style={s.errorTxt}>{t('failedToSearch')}</Text>
          </View>
        )}

        {!isLoading && !isError && results && results.length === 0 && debouncedQuery.length > 2 && (
          <View style={s.center}>
            <Text style={s.emptyTxt}>{t('noLocationsFound')}</Text>
          </View>
        )}

        <FlatList
          data={results || []}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={s.resultItem} onPress={() => handleSelect(item)}>
              <View style={s.iconBox}>
                <MapPin color={colors.primary} size={18} />
              </View>
              <View style={s.resultText}>
                <Text style={s.resultName}>{item.place_name || item.label.split(',')[0]}</Text>
                <Text style={s.resultSub}>{item.district ? `${item.district}, ` : ''}{item.state}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  title: { fontSize: 18, fontWeight: '700', color: colors.text },
  closeBtn: { padding: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, margin: 16, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: colors.text },
  center: { padding: 24, alignItems: 'center' },
  errorTxt: { color: '#ef4444' },
  emptyTxt: { color: colors.textMuted },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#f1f5f9', backgroundColor: colors.card },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.skyCard, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  resultText: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: '600', color: colors.text },
  resultSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
