import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, Button, ScrollView, Alert, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator, Platform } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { SafeScreen } from '@/components/templates';
import { useTheme } from '@/theme';
import { IconByVariant } from '@/components/atoms';
import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { extractURLMetadata } from '@/utils/extractURLMetadata';
import type { RootTabParamList } from '@/navigation/types';

type AddLinkScreenRouteProp = RouteProp<RootTabParamList, 'Add'>;

export default function AddLinkScreen() {
  const route = useRoute<AddLinkScreenRouteProp>();
  const { colors, isDark } = useTheme();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [collectionSearch, setCollectionSearch] = useState('');
  
  // Metadata extraction state
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [wasPasted, setWasPasted] = useState(false);
  const pasteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Real collections and tags from store
  const { collections, fetchCollections, loading: collectionsLoading, loaded: collectionsLoaded } = useCollectionsStore();
  const { tags, isLoading: tagsLoading } = useTagsStore();

  // Handle shared URL from route params
  useEffect(() => {
    if (route.params?.sharedUrl) {
      console.log('📤 Processing shared URL:', route.params.sharedUrl);
      setUrl(route.params.sharedUrl);
      
      // Show toast notification
      Toast.show({
        type: 'success',
        text1: 'URL Received',
        text2: 'Shared link has been added to the form',
        position: 'top',
      });
      
      // Auto-extract metadata for shared URLs
      handleUrlBlur(route.params.sharedUrl);
    }
  }, [route.params?.sharedUrl]);

  useEffect(() => {
    if (!collectionsLoaded) {
      fetchCollections();
    }
  }, [collectionsLoaded, fetchCollections]);

  // Set default collection to 'Default' after collections are loaded
  useEffect(() => {
    if (collections.length > 0 && selectedCollection === null) {
      const defaultCol = collections.find(c => c.name.toLowerCase() === 'default');
      if (defaultCol) setSelectedCollection(defaultCol.id);
    }
  }, [collections, selectedCollection]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (pasteTimeoutRef.current) clearTimeout(pasteTimeoutRef.current);
    };
  }, []);

  const handleUrlBlur = async (urlValue: string) => {
    // If a paste extraction is pending, skip blur extraction
    if (wasPasted) {
      setWasPasted(false);
      return;
    }
    
    let processedUrl = urlValue.trim();
    
    // Add https:// prefix if no protocol is present
    if (processedUrl && !processedUrl.match(/^https?:\/\//i)) {
      processedUrl = 'https://' + processedUrl;
      setUrl(processedUrl);
    }

    // Skip if URL is empty or invalid
    if (!processedUrl || (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://"))) {
      return;
    }

    // Skip if user has already entered both title and summary
    if (title.trim() && summary.trim()) {
      return;
    }

    setIsExtractingMetadata(true);
    try {
      const metadata = await extractURLMetadata(processedUrl);
      console.log('Extracted metadata:', metadata);

      // Update title and summary if they're empty
      setTitle(prev => prev.trim() || metadata.title || "");
      setSummary(prev => prev.trim() || metadata.description || "");

      // Show alert if metadata extraction failed
      if (!metadata.title && !metadata.description) {
        Alert.alert("Metadata Extraction", "Could not extract metadata from the website");
      }
    } catch (error) {
      console.error("Failed to extract metadata:", error);
      Alert.alert("Metadata Extraction", "Failed to extract metadata");
    } finally {
      setIsExtractingMetadata(false);
    }
  };

  const handleUrlPaste = (e: any) => {
    const pastedUrl = e.nativeEvent.text || '';
    if (!pastedUrl) return;
    
    setWasPasted(true);
    setUrl(pastedUrl);
    
    if (pasteTimeoutRef.current) clearTimeout(pasteTimeoutRef.current);
    pasteTimeoutRef.current = setTimeout(async () => {
      await handleUrlBlur(pastedUrl);
      setWasPasted(false);
    }, 500); // 0.5 second delay
  };

  // Add this function to validate the form
  const validateForm = () => {
    // URL required and must be valid
    if (!url.trim()) {
      Alert.alert('Validation Error', 'URL is required.');
      return false;
    }
    // Simple URL validation
    const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
    if (!urlPattern.test(url.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid URL (must start with http:// or https://).');
      return false;
    }
    // Title required
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required.');
      return false;
    }
    // Collection required
    if (!selectedCollection) {
      Alert.alert('Validation Error', 'Please select a collection.');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    Alert.alert('Link created!', `Collection: ${selectedCollection}, Tags: ${selectedTags.join(', ')}, Favorite: ${isFavorite}`);
  };

  // Filtered collections for search
  const filteredCollections = collections.filter(col =>
    col.name.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  // Add this function to reset all fields
  const handleClear = () => {
    setUrl('');
    setTitle('');
    setSummary('');
    setNotes('');
    setIsFavorite(false);
    setSelectedCollection(null);
    setSelectedTags([]);
  };

  return (
    <SafeScreen>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.urlContainer}>
          <TextInput
            style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
            placeholder="URL"
            placeholderTextColor={colors.text.tertiary}
            value={url}
            onChangeText={setUrl}
            onBlur={() => handleUrlBlur(url)}
            onEndEditing={handleUrlPaste}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {isExtractingMetadata && (
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size="small" color={colors.accent.primary} />
            </View>
          )}
        </View>
        <TextInput
          style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
          placeholder="Title (auto-generated if empty)"
          placeholderTextColor={colors.text.tertiary}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
          placeholder="Summary (auto-generated if empty)"
          placeholderTextColor={colors.text.tertiary}
          value={summary}
          onChangeText={setSummary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <TextInput
          style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary, minHeight: 80 }]}
          placeholder="Notes"
          placeholderTextColor={colors.text.tertiary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Collection Picker */}
        <Text style={[styles.sectionHeading, { color: colors.text.primary }]}>Collection</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, isDark && {
            backgroundColor: '#23242a',
            borderColor: '#333',
          }]}
          onPress={() => setCollectionModalVisible(true)}
        >
          <Text style={{ color: selectedCollection ? colors.text.primary : colors.text.tertiary }}>
            {selectedCollection
              ? collections.find(c => c.id === selectedCollection)?.name
              : collectionsLoading ? 'Loading...' : 'Select collection'}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={collectionModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setCollectionModalVisible(false)}
        >
          <View style={[styles.modalOverlay, isDark && { backgroundColor: 'rgba(24,26,32,0.95)' }] }>
            <View style={[styles.modalContent, isDark && { backgroundColor: '#23242a' }] }>
              <TextInput
                style={[styles.input, { marginBottom: 8 }]}
                placeholder="Search collections..."
                value={collectionSearch}
                onChangeText={setCollectionSearch}
                placeholderTextColor={colors.text.tertiary}
              />
              <FlatList
                data={filteredCollections}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, isDark && { borderBottomColor: '#333' }]}
                    onPress={() => {
                      setSelectedCollection(item.id);
                      setCollectionModalVisible(false);
                      setCollectionSearch('');
                    }}
                  >
                    <Text style={{ color: colors.text.primary }}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={{ color: colors.text.tertiary, textAlign: 'center', marginVertical: 16 }}>No collections found</Text>}
              />
              <Button title="Close" onPress={() => setCollectionModalVisible(false)} />
            </View>
          </View>
        </Modal>

        {/* Tag Selector */}
        <Text style={[styles.sectionHeading, { color: colors.text.primary }]}>Tags</Text>
        <View style={styles.tagsWrap}>
          <TouchableOpacity
            style={[styles.chip, { borderStyle: 'dashed', borderColor: colors.accent.primary }, isDark && { backgroundColor: '#23242a', borderColor: '#333' }]}
            onPress={() => Alert.alert('Add Tag', 'Add Tag button pressed!')}
          >
            <Text style={{ color: colors.accent.primary, fontWeight: 'bold' }}>+ Add Tag</Text>
          </TouchableOpacity>
          {tagsLoading ? (
            <Text style={{ color: colors.text.tertiary, marginLeft: 8 }}>Loading...</Text>
          ) : (
            tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.chip,
                    isDark && { backgroundColor: '#23242a', borderColor: '#333' },
                    isSelected && {
                      backgroundColor: colors.accent.primary,
                      borderColor: colors.accent.primary,
                      shadowColor: colors.accent.primary,
                      shadowOpacity: 0.18,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                  onPress={() =>
                    setSelectedTags(isSelected
                      ? selectedTags.filter(t => t !== tag.id)
                      : [...selectedTags, tag.id])
                  }
                >
                  <Text style={{ color: isSelected ? '#fff' : colors.text.primary, fontWeight: isSelected ? 'bold' : 'normal' }}>#{tag.name}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Favorite Button */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite && { backgroundColor: colors.accent.primary + '22', borderColor: colors.accent.primary },
            isDark && { backgroundColor: '#23242a', borderColor: '#333' }
          ]}
          onPress={() => setIsFavorite(fav => !fav)}
        >
          <IconByVariant
            name="star"
            size={20}
            color={isFavorite ? colors.accent.primary : colors.text.secondary}
            style={{ marginRight: 8, opacity: isFavorite ? 1 : 0.4 }}
          />
          <Text style={{ color: isFavorite ? colors.accent.primary : colors.text.secondary, fontWeight: '600' }}>
            Favorite
          </Text>
        </TouchableOpacity>

        {/* Button Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 16 }}>
          <TouchableOpacity
            style={[styles.iconButton, styles.clearIconButton, { shadowColor: colors.text.primary }]}
            onPress={handleClear}
            activeOpacity={0.7}
          >
            <IconByVariant name="trash" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.createIconButton, { backgroundColor: colors.accent.primary, shadowColor: colors.accent.primary }]}
            onPress={handleSubmit}
            activeOpacity={0.7}
          >
            <IconByVariant name="send" size={20} color={'#fff'} />
          </TouchableOpacity>
        </View>
              </ScrollView>
      </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
  urlContainer: { position: 'relative' },
  loadingIndicator: { 
    position: 'absolute', 
    right: 12, 
    top: '50%', 
    transform: [{ translateY: -8 }] 
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  clearIconButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
  },
  createIconButton: {
    backgroundColor: '#007AFF', // fallback if accent.primary missing
  },
}); 