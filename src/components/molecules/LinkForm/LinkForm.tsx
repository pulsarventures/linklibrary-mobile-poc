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
import { TagFormModal } from '@/components/molecules';
import { CollectionFormModal } from '@/components/molecules/CollectionFormModal';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
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
  
  const isEditing = !!initialData?.id;
  const [selectedCollection, setSelectedCollection] = useState<null | number>(
    initialData?.collection_id ? Number(initialData.collection_id) : null
  );
  const [selectedTags, setSelectedTags] = useState<number[]>(
    initialData?.tag_ids ? initialData.tag_ids.map(Number) : []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingMetadata, setIsExtractingMetadata] = useState(false);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [tagModalVisible, setTagModalVisible] = useState(false);
  
  // Use tags store for creating new tags
  const { createTag, isCreating: isCreatingTag } = useTagsStore();
  
  // Use collections store for creating new collections
  const { createCollection } = useCollectionsStore();
  
  // State for create collection modal
  const [createCollectionModalVisible, setCreateCollectionModalVisible] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  
  // State for create tag modal with local loading
  const [isCreatingTagLocal, setIsCreatingTagLocal] = useState(false);
  
  // Track previous tags count to detect new tag creation
  const [previousTagsCount, setPreviousTagsCount] = useState(tags?.length || 0);

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
      if (initialData.collection_id && selectedCollection !== Number(initialData.collection_id)) {
        setSelectedCollection(Number(initialData.collection_id));
      }
      if (initialData.tag_ids && initialData.tag_ids.length > 0) {
        const currentTagsString = JSON.stringify(selectedTags.sort());
        const initialTagsString = JSON.stringify(initialData.tag_ids.map(Number).sort());
        if (currentTagsString !== initialTagsString) {
          setSelectedTags(initialData.tag_ids.map(Number));
        }
      }
    }
  }, [initialData, collections, tags]);

  // Auto-extract metadata when component mounts with initial URL (e.g., shared URL)
  useEffect(() => {
    if (initialData?.url && !initialData?.title && !initialData?.summary) {
      // This is a new link creation with shared URL - extract metadata
      console.log('Auto-extracting metadata for shared URL:', initialData.url);
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

  // Auto-select newly created tags
  useEffect(() => {
    if (tags && tags.length > previousTagsCount) {
      // A new tag was added, find the newest one (highest ID)
      const newestTag = tags.reduce((newest, tag) => 
        tag.id > newest.id ? tag : newest
      );
      
      // Auto-select it if it's not already selected
      if (!selectedTags.includes(newestTag.id)) {
        setSelectedTags(prev => [...prev, newestTag.id]);
        
        // Remove tag creation success toast
      }
      
      // Stop the local loading animation since the tag was successfully created
      setIsCreatingTagLocal(false);
    }
    
    // Update the previous count
    setPreviousTagsCount(tags?.length || 0);
  }, [tags, previousTagsCount, selectedTags]);

  const handleUrlBlur = async (urlValue: string) => {
    // Skip metadata extraction only if we're editing an existing link with title/summary
    if (initialData && (initialData.title || initialData.summary)) return;
    
    let processedUrl = urlValue.trim();
    
    // Skip if URL is empty
    if (!processedUrl) {
      return;
    }
    
    // Add https:// prefix if no protocol is present
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
      // Update URL state with the corrected URL
      setUrl(processedUrl);
    }

    // Skip if URL is invalid after processing
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
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

      // Update title and summary if they're empty, but preserve the URL
      setTitle(previous => previous.trim() || metadata.title || "");
      setSummary(previous => previous.trim() || metadata.description || "");

      // Ensure URL is preserved after metadata extraction
      if (url !== processedUrl) {
        setUrl(processedUrl);
      }

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
      
      // Remove success toast message
      
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

  const handleClear = () => {
    setUrl('');
    setTitle('');
    setSummary('');
    setNotes('');
    setIsFavorite(false);
    setSelectedTags([]);
    
    // Reset to default collection
    const defaultCol = collections.find((c: Collection) => c.name.toLowerCase() === 'default');
    setSelectedCollection(defaultCol ? defaultCol.id : null);
  };

  const handleCreateTag = async (data: { color?: string; name: string; }) => {
    // Close the modal immediately for better UX
    setTagModalVisible(false);
    
    // Start spinning animation on + button
    setIsCreatingTagLocal(true);
    
    try {
      // Create the tag using the store mutation
      createTag({ color: data.color || 'gray', name: data.name });
      
      // Note: Tag auto-selection and success message are handled by the useEffect
      // that monitors tags array changes
    } catch (error) {
      console.error('❌ Failed to create tag:', error);
      Toast.show({
        text1: 'Failed to create tag',
        text2: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      });
    } finally {
      // Stop spinning animation after a short delay to ensure the mutation has processed
      setTimeout(() => {
        setIsCreatingTagLocal(false);
      }, 1000);
    }
  };

  const handleCreateCollection = async (data: { color?: string; description?: string; icon?: string; name: string; }) => {
    // Close the modal immediately for better UX
    setCreateCollectionModalVisible(false);
    
    // Start spinning animation on + button
    setIsCreatingCollection(true);
    
    try {
      // Create the collection using the store (backend call)
      const newCollection = await createCollection(data);
      
      // Auto-select the newly created collection
      if (newCollection?.id) {
        setSelectedCollection(newCollection.id);
      }
      
      // Remove collection creation success toast
    } catch (error) {
      console.error('❌ Failed to create collection:', error);
      Toast.show({
        text1: 'Failed to create collection',
        text2: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      });
    } finally {
      // Stop spinning animation
      setIsCreatingCollection(false);
    }
  };

  return (
    <RNScrollView contentContainerStyle={styles.container}>
      {/* Header Buttons */}
      <RNView style={styles.headerContainer}>
        {/* Cancel Button - Left Side */}
        <RNTouchableOpacity
          activeOpacity={0.7}
          onPress={onCancel || (() => {})}
          style={[styles.headerButton, styles.cancelButton]}
        >
          <RNText style={[styles.buttonText, { color: colors.text.secondary }]}>Cancel</RNText>
        </RNTouchableOpacity>

        {/* Action Buttons - Right Side */}
        <RNView style={styles.headerButtons}>
          <RNTouchableOpacity
            activeOpacity={0.7}
            onPress={handleClear}
            style={[styles.headerButton, styles.clearButton, { borderColor: colors.border.primary }]}
          >
            <RNText style={[styles.buttonText, { color: colors.text.secondary }]}>Clear</RNText>
          </RNTouchableOpacity>
          <RNTouchableOpacity
            activeOpacity={0.7}
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={[
              styles.headerButton,
              styles.addButton,
              { backgroundColor: isDark ? '#6b7280' : '#000000' },
              isSubmitting && { opacity: 0.7 }
            ]}
          >
            {isSubmitting ? (
              <RNActivityIndicator color="#fff" size="small" />
            ) : isEditing ? (
              <IconByVariant
                color="#fff"
                name="save"
                size={16}
              />
            ) : (
              <RNText style={[styles.buttonText, { color: '#fff' }]}>+ Add</RNText>
            )}
          </RNTouchableOpacity>
        </RNView>
      </RNView>

      {/* Rest of the form content */}
      <RNView>
        <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>URL</RNText>
        <RNView style={styles.urlContainer}>
          <RNTextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onBlur={() => handleUrlBlur(url)}
            onChangeText={setUrl}
            placeholder="Enter URL"
            placeholderTextColor={colors.text.tertiary}
            style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
            value={url}
          />
          {isExtractingMetadata ? <RNView style={styles.loadingIndicator}>
              <RNActivityIndicator color={colors.accent.primary} size="small" />
            </RNView> : null}
        </RNView>
      </RNView>

      <RNView>
        <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Title</RNText>
        <RNTextInput
          onChangeText={setTitle}
          placeholder="Enter title (auto-generated if empty)"
          placeholderTextColor={colors.text.tertiary}
          style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
          value={title}
        />
      </RNView>

      <RNView>
        <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Summary</RNText>
        <RNTextInput
          multiline
          numberOfLines={4}
          onChangeText={setSummary}
          placeholder="Enter summary (auto-generated if empty)"
          placeholderTextColor={colors.text.tertiary}
          style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
          textAlignVertical="top"
          value={summary}
        />
      </RNView>

      <RNView>
        <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Notes</RNText>
        <RNTextInput
          multiline
          numberOfLines={4}
          onChangeText={setNotes}
          placeholder="Enter notes (optional)"
          placeholderTextColor={colors.text.tertiary}
          style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary, minHeight: 80 }]}
          textAlignVertical="top"
          value={notes}
        />
      </RNView>

      {/* Collection Picker */}
      <RNView style={styles.sectionHeader}>
        <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Collection</RNText>
        <RNTouchableOpacity
          onPress={() => setCreateCollectionModalVisible(true)}
          style={[styles.addIconButton, isCreatingCollection && { opacity: 0.7 }]}
          disabled={isCreatingCollection}
        >
          {isCreatingCollection ? (
            <RNActivityIndicator
              color={colors.accent.primary}
              size="small"
            />
          ) : (
            <IconByVariant
              name="add"
              size={20}
              color={colors.accent.primary}
            />
          )}
        </RNTouchableOpacity>
      </RNView>
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
      <RNView style={styles.sectionHeader}>
        <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Tags</RNText>
        <RNTouchableOpacity
          onPress={() => setTagModalVisible(true)}
          style={[styles.addIconButton, isCreatingTagLocal && { opacity: 0.7 }]}
          disabled={isCreatingTagLocal}
        >
          {isCreatingTagLocal ? (
            <RNActivityIndicator
              color={colors.accent.primary}
              size="small"
            />
          ) : (
            <IconByVariant
              name="add"
              size={20}
              color={colors.accent.primary}
            />
          )}
        </RNTouchableOpacity>
      </RNView>
      <RNView style={styles.tagsWrap}>
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
                  backgroundColor: isDark ? '#6b7280' : '#000000',
                  borderColor: isDark ? '#6b7280' : '#000000',
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
              style={[styles.button, { backgroundColor: isDark ? '#6b7280' : '#000000' }]}
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
          isFavorite && { backgroundColor: (isDark ? '#6b7280' : '#000000') + '22', borderColor: isDark ? '#6b7280' : '#000000' },
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

      {/* Collection Creation Modal */}
      <CollectionFormModal
        onClose={() => setCreateCollectionModalVisible(false)}
        onSubmit={handleCreateCollection}
        visible={createCollectionModalVisible}
      />

      {/* Tag Creation Modal */}
      <TagFormModal
        onClose={() => setTagModalVisible(false)}
        onSubmit={handleCreateTag}
        visible={tagModalVisible}
      />
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
  container: { gap: 12, padding: 24 },
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
  input: { borderRadius: 8, borderWidth: 1, fontSize: 16, marginBottom: 4, padding: 12 },
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
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 4,
  },
  tagsWrap: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  urlContainer: { position: 'relative' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  headerButton: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 4,
  },
  addIconButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    padding: 6,
    width: 32,
  },
}); 