import type { Link } from '@/types/link.types';
import type { Collection } from '@/types/collection.types';
import type { Tag } from '@/types/tag.types';

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator as RNActivityIndicator,
  Alert as RNAlert,
  FlatList,
  Modal,
  ScrollView as RNScrollView,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme';
import { IconByVariant } from '@/components/atoms';
import { extractURLMetadata } from '@/utils/extractURLMetadata';

interface LinkFormProps {
  initialData?: Partial<Link>;
  collections: Collection[];
  tags: Tag[];
  onSubmit: (data: Partial<Link>) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function LinkForm({
  initialData,
  collections = [],
  tags = [],
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: LinkFormProps) {
  const { colors, isDark } = useTheme();
  const [url, setUrl] = useState(initialData?.url || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isFavorite, setIsFavorite] = useState(initialData?.is_favorite || false);
  const [selectedCollection, setSelectedCollection] = useState<null | number>(initialData?.collection_id || null);
  const [selectedTags, setSelectedTags] = useState<number[]>(initialData?.tag_ids || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [collectionSearch, setCollectionSearch] = useState('');

  // Filtered collections for search
  const filteredCollections = collections.filter((col: Collection) =>
    col.name.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  // Set default collection to 'Default' if no initial collection
  useEffect(() => {
    if (collections.length && selectedCollection === null) {
      const defaultCol = collections.find((c: Collection) => c.name.toLowerCase() === 'default');
      if (defaultCol) setSelectedCollection(defaultCol.id);
    }
  }, [collections, selectedCollection]);

  // Ensure selectedCollection and selectedTags are properly set when initialData and collections/tags are available
  useEffect(() => {
    if (initialData && collections.length > 0 && tags.length > 0) {
      // Re-set the collection and tags from initialData if they haven't been set yet
      if (initialData.collection_id && selectedCollection !== initialData.collection_id) {
        setSelectedCollection(initialData.collection_id);
      }
      if (initialData.tag_ids && initialData.tag_ids.length > 0) {
        const currentTagsString = JSON.stringify(selectedTags.sort());
        const initialTagsString = JSON.stringify(initialData.tag_ids.sort());
        if (currentTagsString !== initialTagsString) {
          setSelectedTags(initialData.tag_ids);
        }
      }
    }
  }, [initialData, collections, tags]);

  // Auto-extract metadata when component mounts with initial URL (e.g., shared URL)
  useEffect(() => {
    if (initialData?.url && !initialData?.title && !initialData?.summary) {
      // This is a new link creation with shared URL - extract metadata
      handleUrlBlur(initialData.url);
    }
  }, []); // Only run on mount

  // Debug logging for edit functionality
  useEffect(() => {
    if (initialData) {
      console.log('🔧 LinkForm received initialData:', {
        collection_id: initialData.collection_id,
        tag_ids: initialData.tag_ids,
        selectedCollection,
        selectedTags,
        collectionsLength: collections.length,
        tagsLength: tags.length
      });
    }
  }, [initialData, collections, tags, selectedCollection, selectedTags]);

  const handleUrlBlur = async (urlValue: string) => {
    // Skip metadata extraction only if we're editing an existing link with title/summary
    if (initialData && (initialData.title || initialData.summary)) return;
    
    let processedUrl = urlValue.trim();
    
    // Add https:// prefix if no protocol is present
    if (processedUrl && !/^https?:\/\//i.test(processedUrl)) {
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
      setTitle(previous => previous.trim() || metadata.title || "");
      setSummary(previous => previous.trim() || metadata.description || "");

      // Show alert if metadata extraction failed
      if (!metadata.title && !metadata.description) {
        RNAlert.alert("Metadata Extraction", "Could not extract metadata from the website");
      }
    } catch (error) {
      console.error("Failed to extract metadata:", error);
      RNAlert.alert("Metadata Extraction", "Failed to extract metadata");
    } finally {
      setIsExtractingMetadata(false);
    }
  };

  const validateForm = () => {
    // URL required and must be valid
    if (!url.trim()) {
      RNAlert.alert('Validation Error', 'URL is required.');
      return false;
    }
    // Simple URL validation
    const urlPattern = /^(https?:\/\/)[^\s#$./?].\S*$/i;
    if (!urlPattern.test(url.trim())) {
      RNAlert.alert('Validation Error', 'Please enter a valid URL (must start with http:// or https://).');
      return false;
    }
    // Title required
    if (!title.trim()) {
      RNAlert.alert('Validation Error', 'Title is required.');
      return false;
    }
    // Collection required
    if (!selectedCollection) {
      RNAlert.alert('Validation Error', 'Please select a collection.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const linkData = {
        collection_id: selectedCollection ? String(selectedCollection) : undefined,
        input_source: 'mobile',
        is_favorite: isFavorite,
        notes: notes.trim(),
        summary: summary.trim(),
        tag_ids: selectedTags.map(String),
        title: title.trim(),
        url: url.trim(),
      };

      await onSubmit(linkData);
      
      // Show success message
      Toast.show({
        type: 'success',
        text1: initialData ? 'Link Updated!' : 'Link Created!',
        text2: initialData ? 'Your link has been updated successfully' : 'Your link has been saved successfully',
      });
      
    } catch (error) {
      console.error('❌ Failed to save link:', error);
      
      // Show error message
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to save link',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RNScrollView contentContainerStyle={styles.container}>
      <RNView style={styles.urlContainer}>
        <RNTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onBlur={() => handleUrlBlur(url)}
          onChangeText={setUrl}
          placeholder="URL"
          placeholderTextColor={colors.text.tertiary}
          style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
          value={url}
        />
        {isExtractingMetadata ? <RNView style={styles.loadingIndicator}>
            <RNActivityIndicator color={colors.accent.primary} size="small" />
          </RNView> : null}
      </RNView>

      <RNTextInput
        onChangeText={setTitle}
        placeholder="Title (auto-generated if empty)"
        placeholderTextColor={colors.text.tertiary}
        style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
        value={title}
      />

      <RNTextInput
        multiline
        numberOfLines={4}
        onChangeText={setSummary}
        placeholder="Summary (auto-generated if empty)"
        placeholderTextColor={colors.text.tertiary}
        style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
        textAlignVertical="top"
        value={summary}
      />

      <RNTextInput
        multiline
        numberOfLines={4}
        onChangeText={setNotes}
        placeholder="Notes"
        placeholderTextColor={colors.text.tertiary}
        style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary, minHeight: 80 }]}
        textAlignVertical="top"
        value={notes}
      />

      {/* Collection Picker */}
      <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Collection</RNText>
      <RNTouchableOpacity
        style={[styles.dropdownButton, isDark && {
          backgroundColor: '#23242a',
          borderColor: '#333',
        }]}
        onPress={() => setCollectionModalVisible(true)}
      >
        <RNText style={{ color: selectedCollection ? colors.text.primary : colors.text.tertiary }}>
          {selectedCollection
            ? collections.find((c: Collection) => c.id === selectedCollection)?.name
            : 'Select collection'}
        </RNText>
      </RNTouchableOpacity>

      {/* Tag Selector */}
      <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Tags</RNText>
      <RNView style={styles.tagsWrap}>
        <RNTouchableOpacity
          style={[styles.chip, { borderStyle: 'dashed', borderColor: colors.accent.primary }, isDark && { backgroundColor: '#23242a', borderColor: '#333' }]}
          onPress={() => RNAlert.alert('Add Tag', 'Add Tag button pressed!')}
        >
          <RNText style={{ color: colors.accent.primary, fontWeight: 'bold' }}>+ Add Tag</RNText>
        </RNTouchableOpacity>
        {(tags || []).map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <RNTouchableOpacity
              key={tag.id}
              onPress={() =>
                { setSelectedTags(isSelected
                  ? selectedTags.filter(t => t !== tag.id)
                  : [...selectedTags, tag.id]); }
              }
              style={[
                styles.chip,
                isDark && { backgroundColor: '#23242a', borderColor: '#333' },
                isSelected && {
                  backgroundColor: colors.accent.primary,
                  borderColor: colors.accent.primary,
                  elevation: 2,
                  shadowColor: colors.accent.primary,
                  shadowOpacity: 0.18,
                  shadowRadius: 4,
                },
              ]}
            >
              <RNText style={{ color: isSelected ? '#fff' : colors.text.primary, fontWeight: isSelected ? 'bold' : 'normal' }}>#{tag.name}</RNText>
            </RNTouchableOpacity>
          );
        })}
      </RNView>

      {/* Collection Modal */}
      <Modal
        visible={collectionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCollectionModalVisible(false)}
      >
        <RNView style={[styles.modalOverlay, isDark && { backgroundColor: 'rgba(24,26,32,0.95)' }]}>
          <RNView style={[styles.modalContent, isDark && { backgroundColor: '#23242a' }]}>
            <RNTextInput
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
                <RNTouchableOpacity
                  style={[styles.modalItem, isDark && { borderBottomColor: '#333' }]}
                  onPress={() => {
                    setSelectedCollection(item.id);
                    setCollectionModalVisible(false);
                    setCollectionSearch('');
                  }}
                >
                  <RNText style={{ color: colors.text.primary }}>{item.name}</RNText>
                </RNTouchableOpacity>
              )}
              ListEmptyComponent={<RNText style={{ color: colors.text.tertiary, textAlign: 'center', marginVertical: 16 }}>No collections found</RNText>}
            />
            <RNTouchableOpacity
              style={[styles.button, { backgroundColor: colors.accent.primary }]}
              onPress={() => setCollectionModalVisible(false)}
            >
              <RNText style={{ color: '#fff', textAlign: 'center' }}>Close</RNText>
            </RNTouchableOpacity>
          </RNView>
        </RNView>
      </Modal>

      {/* Favorite Button */}
      <RNTouchableOpacity
        onPress={() => { setIsFavorite(fav => !fav); }}
        style={[
          styles.favoriteButton,
          isFavorite && { backgroundColor: colors.accent.primary + '22', borderColor: colors.accent.primary },
          isDark && { backgroundColor: '#23242a', borderColor: '#333' }
        ]}
      >
        <IconByVariant
          color={isFavorite ? colors.accent.primary : colors.text.secondary}
          name="star"
          size={20}
          style={{ marginRight: 8, opacity: isFavorite ? 1 : 0.4 }}
        />
        <RNText style={{ color: isFavorite ? colors.accent.primary : colors.text.secondary, fontWeight: '600' }}>
          Favorite
        </RNText>
      </RNTouchableOpacity>

      {/* Button Row */}
      <RNView style={{ flexDirection: 'row', gap: 32, justifyContent: 'center', marginTop: 16 }}>
        {onCancel && (
          <RNTouchableOpacity
            activeOpacity={0.7}
            onPress={onCancel}
            style={[styles.iconButton, styles.clearIconButton, { shadowColor: colors.text.primary }]}
          >
            <IconByVariant color={colors.text.secondary} name="trash" size={20} />
          </RNTouchableOpacity>
        )}
        <RNTouchableOpacity
          activeOpacity={0.7}
          disabled={isSubmitting}
          onPress={handleSubmit}
          style={[
            styles.iconButton, 
            styles.createIconButton, 
            { backgroundColor: colors.accent.primary, shadowColor: colors.accent.primary },
            isSubmitting && { opacity: 0.7 }
          ]}
        >
          {isSubmitting ? (
            <RNActivityIndicator color="#fff" size="small" />
          ) : (
            <IconByVariant color="#fff" name="send" size={20} />
          )}
        </RNTouchableOpacity>
      </RNView>
    </RNScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearIconButton: {
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderWidth: 1,
  },
  container: { gap: 16, padding: 24 },
  createIconButton: {
    backgroundColor: '#007AFF', // fallback if accent.primary missing
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  favoriteButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 26,
    elevation: 4,
    height: 52,
    justifyContent: 'center',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    width: 52,
  },
  input: { borderRadius: 8, borderWidth: 1, fontSize: 16, marginBottom: 8, padding: 12 },
  loadingIndicator: { 
    position: 'absolute', 
    right: 12, 
    top: '50%', 
    transform: [{ translateY: -8 }] 
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: '80%',
  },
  modalItem: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    flex: 1,
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  tagsWrap: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  urlContainer: { position: 'relative' },
}); 