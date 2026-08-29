import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { X, MapPin, Search } from 'lucide-react-native';
import { useGeoSearch } from '../api/client';
import { useLocation } from '../context/LocationContext';
import { Location } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function LocationPicker({ visible, onClose }: Props) {
  const { setLocation } = useLocation();
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
          <Text style={s.title}>Change Location</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <X color="#64748b" size={24} />
          </TouchableOpacity>
        </View>

        <View style={s.searchBar}>
          <Search color="#94a3b8" size={20} />
          <TextInput
            style={s.input}
            placeholder="Search city, town, or district in India..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X color="#94a3b8" size={16} />
            </TouchableOpacity>
          )}
        </View>

        {isLoading && query.length > 2 && (
          <View style={s.center}>
            <ActivityIndicator color="#3b82f6" />
          </View>
        )}

        {isError && (
          <View style={s.center}>
            <Text style={s.errorTxt}>Failed to search locations</Text>
          </View>
        )}

        {!isLoading && !isError && results && results.length === 0 && debouncedQuery.length > 2 && (
          <View style={s.center}>
            <Text style={s.emptyTxt}>No locations found</Text>
          </View>
        )}

        <FlatList
          data={results || []}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={s.resultItem} onPress={() => handleSelect(item)}>
              <View style={s.iconBox}>
                <MapPin color="#3b82f6" size={18} />
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  closeBtn: { padding: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 16, color: '#0f172a' },
  center: { padding: 24, alignItems: 'center' },
  errorTxt: { color: '#ef4444' },
  emptyTxt: { color: '#64748b' },
  resultItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', backgroundColor: '#fff' },
  iconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  resultText: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  resultSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
});
