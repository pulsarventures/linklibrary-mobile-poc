import type { Collection } from '@/types/collection.types';
import type { Link } from '@/types/link.types';
import type { Tag } from '@/types/tag.types';

import { LinksApiService } from '@/services/links-api.service';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  ActivityIndicator as RNActivityIndicator,
  Alert as RNAlert,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  TouchableOpacity as RNTouchableOpacity,
  View as RNView,
  StyleSheet,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { useCollectionsStore } from '@/hooks/domain/collections/useCollectionsStore';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { useBackgroundDataLoader } from '@/hooks/useBackgroundDataLoader';
import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';
import { TagFormModal } from '@/components/molecules';
import { CollectionFormModal } from '@/components/molecules/CollectionFormModal';

type LinkFormProps = {
  readonly collections: Collection[];
  readonly initialData?: Partial<Link>;
  readonly onCancel?: () => void;
  readonly onSubmit: (data: Partial<Link>) => Promise<void>;
  readonly submitLabel?: string;
  readonly tags: Tag[];
}

export function LinkForm({
  collections = [],
  initialData,
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  tags = [],
}: LinkFormProps) {
  const { colors, isDark } = useTheme();
  const { hasCollections, hasTags, isLoadingCollections } = useBackgroundDataLoader();
  const [url, setUrl] = useState(initialData?.url || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isFavorite, setIsFavorite] = useState(initialData?.is_favorite || false);
  const [readStatus, setReadStatus] = useState(initialData?.read_status || 'unread');
  
  const isEditing = !!initialData?.id;
  
  // Handle form initialization based on initialData
  useEffect(() => {
    // If initialData exists, update ONLY the fields provided
    // This is crucial for shares which only provide URL
    if (initialData) {
      // Only update fields that are explicitly provided in initialData
      if ('url' in initialData) setUrl(initialData.url || '');
      if ('title' in initialData) setTitle(initialData.title || '');
      if ('summary' in initialData) setSummary(initialData.summary || '');
      if ('notes' in initialData) setNotes(initialData.notes || '');
      if ('is_favorite' in initialData) setIsFavorite(initialData.is_favorite || false);
      if ('read_status' in initialData) setReadStatus(initialData.read_status || 'unread');
      if ('collection_id' in initialData && initialData.collection_id !== undefined) {
        setSelectedCollection(Number(initialData.collection_id));
      }
      if ('tag_ids' in initialData && initialData.tag_ids !== undefined) {
        setSelectedTags(initialData.tag_ids.map(Number));
      }
    } else {
      // If no initialData, reset form to default state
      setUrl('');
      setTitle('');
      setSummary('');
      setNotes('');
      setIsFavorite(false);
      setReadStatus('unread');
      setSelectedTags([]);
      
      // Reset to default collection
      const defaultCol = collections.find((c: Collection) => c.name.toLowerCase() === 'default');
      setSelectedCollection(defaultCol ? defaultCol.id : null);
    }
  }, [initialData, collections]);
  
  const scrollViewReference = useRef<RNScrollView>(null);
  const [selectedCollection, setSelectedCollection] = useState<null | number>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
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
  const [previousTagsCount, setPreviousTagsCount] = useState(tags.length || 0);
  
  // State for collapsible additional details section
  const [isAdvancedSectionCollapsed, setIsAdvancedSectionCollapsed] = useState(true);
  
  // State for paste detection
  const pasteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPastedUrlRef = useRef<string>("");
  const [wasPasted, setWasPasted] = useState(false);

  // Filtered collections for search
  const filteredCollections = collections.filter((col: Collection) =>
    col.name.toLowerCase().includes(collectionSearch.toLowerCase())
  );

  // Set default collection to 'Default' if no initial collection and not editing
  useEffect(() => {
    if (collections.length > 0 && selectedCollection === null && !isEditing && !initialData?.collection_id) {
      const defaultCol = collections.find((c: Collection) => c.name.toLowerCase() === 'default');
      if (defaultCol) setSelectedCollection(defaultCol.id);
    }
  }, [collections, selectedCollection, isEditing, initialData]);

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
    if (initialData?.url && !initialData.title && !initialData.summary) {
      // This is a new link creation with shared URL - extract metadata
      console.log('Auto-extracting metadata for shared URL:', initialData.url);
      handleUrlBlur(initialData.url);
    }
  }, [initialData?.url]); // Run when initialData.url changes

  // Debug logging for edit functionality
  useEffect(() => {
    if (initialData) {
      console.log('🔧 LinkForm received initialData:', {
        collection_id: initialData.collection_id,
        collectionsLength: collections.length,
        selectedCollection,
        selectedTags,
        tag_ids: initialData.tag_ids,
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
        setSelectedTags(previous => [...previous, newestTag.id]);
        
        // Remove tag creation success toast
      }
      
      // Stop the local loading animation since the tag was successfully created
      setIsCreatingTagLocal(false);
    }
    
    // Update the previous count
    setPreviousTagsCount(tags.length || 0);
  }, [tags, previousTagsCount, selectedTags]);

  const handleUrlBlur = async (urlValue: string) => {
    // If a paste extraction is pending, skip blur extraction
    if (wasPasted) {
      setWasPasted(false);
      return;
    }

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
      return; // Exit early to avoid double processing
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
      // Use API metadata extraction
      const metadata = await LinksApiService.extractMetadata(processedUrl);
      console.log('Extracted metadata from API:', metadata);

      // Update title and summary if they're empty
      // API returns 'title' and 'summary' fields
      setTitle(previous => previous.trim() || metadata.title || "");
      // Truncate summary if it's too long (max 1000 chars)
      const truncatedSummary = metadata.summary ? 
        (metadata.summary.length > 1000 ? metadata.summary.substring(0, 997) + '...' : metadata.summary) : "";
      setSummary(previous => previous.trim() || truncatedSummary);

      // Ensure URL is preserved after metadata extraction
      if (url !== processedUrl) {
        setUrl(processedUrl);
      }

      // Show alert if metadata extraction failed
      if (!metadata.title && !metadata.summary) {
        RNAlert.alert("Metadata Extraction", "Could not extract metadata from the website");
      }
    } catch (error) {
      console.error("Failed to extract metadata from API:", error);
      // Fall back to local extraction if API fails
      try {
        const { extractURLMetadata } = await import('@/utils/extractURLMetadata');
        const localMetadata = await extractURLMetadata(processedUrl);
        console.log('Falling back to local metadata extraction:', localMetadata);
        
        setTitle(previous => previous.trim() || localMetadata.title || "");
        // Truncate description if too long
        const truncatedDesc = localMetadata.description ? 
          (localMetadata.description.length > 1000 ? localMetadata.description.substring(0, 997) + '...' : localMetadata.description) : "";
        setSummary(previous => previous.trim() || truncatedDesc);
        
        if (!localMetadata.title && !localMetadata.description) {
          RNAlert.alert("Metadata Extraction", "Could not extract metadata from the website");
        }
      } catch (fallbackError) {
        console.error("Local metadata extraction also failed:", fallbackError);
        RNAlert.alert("Metadata Extraction", "Failed to extract metadata");
      }
    } finally {
      setIsExtractingMetadata(false);
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    
    // Check if this looks like a paste (sudden large change in URL length)
    const isLikelyPaste = newUrl.length > url.length + 10; // More than 10 characters added at once
    
    if (isLikelyPaste) {
      // Mark as pasted to prevent double processing
      setWasPasted(true);

      // Clear any existing timeout
      if (pasteTimeoutRef.current) {
        clearTimeout(pasteTimeoutRef.current);
      }

      // Set new timeout for metadata extraction
      pasteTimeoutRef.current = setTimeout(() => {
        handleUrlBlur(newUrl);
      }, 500);
    }
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (pasteTimeoutRef.current) clearTimeout(pasteTimeoutRef.current);
    };
  }, []);

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
        read_status: readStatus,
        summary: summary.trim(),
        tag_ids: selectedTags.map(String),
        title: title.trim(),
        url: url.trim(),
      };

      // Call onSubmit for optimistic updates - this returns immediately
      await onSubmit(linkData);

      // For create operations, clear the form
      if (!isEditing) {
        handleClear();
      }

      setIsSubmitting(false);

    } catch (error) {
      console.error('❌ Failed to save link:', error);

      // Show error message
      Toast.show({
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to save link',
        type: 'error',
      });
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setTitle('');
    setSummary('');
    setNotes('');
    setIsFavorite(false);
    setReadStatus('unread');
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
      if (newCollection.id) {
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
    <RNView style={{ flex: 1 }}>
      {/* Fixed Header Buttons */}
      <RNView style={[styles.fixedHeader, { backgroundColor: colors.background.primary, borderBottomColor: colors.border.primary }]}>
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
            disabled={isSubmitting || isExtractingMetadata}
            onPress={handleSubmit}
            style={[
              styles.headerButton,
              styles.addButton,
              { backgroundColor: '#F25D15' },
              (isSubmitting || isExtractingMetadata) && { opacity: 0.7 }
            ]}
          >
            {(isSubmitting || isExtractingMetadata) ? (
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

      <RNScrollView 
        contentContainerStyle={styles.container}
        ref={scrollViewReference}
        showsVerticalScrollIndicator
      >

      {/* Main Fields - Always Visible */}
      {/* URL */}
      <RNView>
        <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>URL</RNText>
        <RNTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          onBlur={() => handleUrlBlur(url)}
          onChangeText={handleUrlChange}
          placeholder="Enter URL"
          placeholderTextColor={colors.text.tertiary}
          style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
          value={url}
        />
      </RNView>

      {/* Notes */}
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

      {/* Collapsible Advanced Section */}
      <RNView style={[styles.advancedSection, { borderTopColor: colors.border.primary }]}>
        <RNTouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsAdvancedSectionCollapsed(!isAdvancedSectionCollapsed)}
          style={styles.advancedSectionHeader}
        >
          <RNText style={[styles.advancedSectionTitle, { color: colors.text.primary }]}>
            Additional Details
          </RNText>
          <IconByVariant
            color={colors.text.secondary}
            name="chevron-down"
            size={20}
            style={{ transform: [{ rotate: isAdvancedSectionCollapsed ? '0deg' : '180deg' }] }}
          />
        </RNTouchableOpacity>

        {!isAdvancedSectionCollapsed && (
          <RNView style={styles.advancedSectionContent}>
            {/* Title */}
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

            {/* Summary */}
            <RNView>
              <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Summary</RNText>
              <RNTextInput
                multiline
                numberOfLines={4}
                maxLength={1000}
                onChangeText={setSummary}
                placeholder="Enter summary (auto-generated if empty)"
                placeholderTextColor={colors.text.tertiary}
                style={[styles.input, { borderColor: colors.border.primary, color: colors.text.primary }]}
                textAlignVertical="top"
                value={summary}
              />
              <RNText style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                {summary.length}/1000
              </RNText>
            </RNView>

            {/* Collection Picker */}
            <RNView style={styles.sectionHeader}>
              <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Collection</RNText>
              <RNTouchableOpacity
                disabled={isCreatingCollection}
                onPress={() => { setCreateCollectionModalVisible(true); }}
                style={[styles.addIconButton, isCreatingCollection && { opacity: 0.7 }]}
              >
                {isCreatingCollection ? (
                  <RNActivityIndicator
                    color={colors.accent.primary}
                    size="small"
                  />
                ) : (
                  <IconByVariant
                    color={colors.accent.primary}
                    name="add"
                    size={20}
                  />
                )}
              </RNTouchableOpacity>
            </RNView>
            <RNTouchableOpacity
              disabled={isLoadingCollections ? !hasCollections : false}
              onPress={() => { setCollectionModalVisible(true); }}
              style={[styles.dropdownButton, isDark && {
                backgroundColor: '#23242a',
                borderColor: '#333',
              }]}
            >
              <RNText style={{ color: selectedCollection ? colors.text.primary : colors.text.tertiary }}>
                {isLoadingCollections && !hasCollections ? (
                  'Loading collections...'
                ) : selectedCollection ? (
                  collections.find((c: Collection) => c.id === selectedCollection)?.name
                ) : (
                  'Select collection'
                )}
              </RNText>
              {isLoadingCollections && !hasCollections ? <RNActivityIndicator
                  color={colors.text.tertiary}
                  size="small"
                  style={{ marginLeft: 8 }}
                /> : null}
            </RNTouchableOpacity>

            {/* Tag Selector */}
            <RNView style={styles.sectionHeader}>
              <RNText style={[styles.sectionHeading, { color: colors.text.primary }]}>Tags</RNText>
              <RNTouchableOpacity
                disabled={isCreatingTagLocal}
                onPress={() => { setTagModalVisible(true); }}
                style={[styles.addIconButton, isCreatingTagLocal && { opacity: 0.7 }]}
              >
                {isCreatingTagLocal ? (
                  <RNActivityIndicator
                    color={colors.accent.primary}
                    size="small"
                  />
                ) : (
                  <IconByVariant
                    color={colors.accent.primary}
                    name="add"
                    size={20}
                  />
                )}
              </RNTouchableOpacity>
            </RNView>
            <RNView style={styles.tagsWrap}>
              {!hasTags && tags.length === 0 ? (
                <RNView style={[styles.chip, { backgroundColor: colors.background.subtle, borderColor: colors.border.primary }]}>
                  <RNActivityIndicator
                    color={colors.text.tertiary}
                    size="small"
                    style={{ marginRight: 8 }}
                  />
                  <RNText style={{ color: colors.text.tertiary }}>Loading tags...</RNText>
                </RNView>
              ) : (
                (tags || []).map((tag) => {
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
                          backgroundColor: '#F25D15',
                          borderColor: '#F25D15',
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
                })
              )}
            </RNView>

            {/* Favorite and Reading List Toggles */}
            <RNView style={styles.toggleButtonsContainer}>
              <RNTouchableOpacity
                onPress={() => { setIsFavorite(fav => !fav); }}
                style={[
                  styles.toggleButton,
                  isFavorite && { backgroundColor: '#F25D15' + '22', borderColor: '#F25D15' },
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

              <RNTouchableOpacity
                onPress={() => {
                  const newStatus = readStatus === 'unread' ? 'to_read' : 'unread';
                  setReadStatus(newStatus);
                }}
                style={[
                  styles.toggleButton,
                  readStatus !== 'unread' && { backgroundColor: '#3B82F6' + '22', borderColor: '#3B82F6' },
                  isDark && { backgroundColor: '#23242a', borderColor: '#333' }
                ]}
              >
                <IconByVariant
                  color={readStatus !== 'unread' ? '#3B82F6' : colors.text.secondary}
                  name="library"
                  size={20}
                  style={{ marginRight: 8, opacity: readStatus !== 'unread' ? 1 : 0.4 }}
                />
                <RNText style={{ color: readStatus !== 'unread' ? '#3B82F6' : colors.text.secondary, fontWeight: '600' }}>
                  Reading List
                </RNText>
              </RNTouchableOpacity>
            </RNView>
          </RNView>
        )}
      </RNView>

      {/* Collection Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => { setCollectionModalVisible(false); }}
        transparent
        visible={collectionModalVisible}
      >
        <RNView style={[styles.modalOverlay, isDark && { backgroundColor: 'rgba(24,26,32,0.95)' }]}>
          <RNView style={[styles.modalContent, isDark && { backgroundColor: '#23242a' }]}>
            <RNTextInput
              onChangeText={setCollectionSearch}
              placeholder="Search collections..."
              placeholderTextColor={colors.text.tertiary}
              style={[styles.input, { marginBottom: 8 }]}
              value={collectionSearch}
            />
            <FlatList
              data={filteredCollections}
              keyExtractor={item => item.id.toString()}
              ListEmptyComponent={<RNText style={{ color: colors.text.tertiary, marginVertical: 16, textAlign: 'center' }}>No collections found</RNText>}
              renderItem={({ item }) => (
                <RNTouchableOpacity
                  onPress={() => {
                    setSelectedCollection(item.id);
                    setCollectionModalVisible(false);
                    setCollectionSearch('');
                  }}
                  style={[styles.modalItem, isDark && { borderBottomColor: '#333' }]}
                >
                  <RNText style={{ color: colors.text.primary }}>{item.name}</RNText>
                </RNTouchableOpacity>
              )}
            />
            <RNTouchableOpacity
              onPress={() => { setCollectionModalVisible(false); }}
              style={[styles.button, { backgroundColor: '#F25D15' }]}
            >
              <RNText style={{ color: '#fff', textAlign: 'center' }}>Close</RNText>
            </RNTouchableOpacity>
          </RNView>
        </RNView>
      </Modal>

      {/* Collection Creation Modal */}
      <CollectionFormModal
        onClose={() => { setCreateCollectionModalVisible(false); }}
        onSubmit={handleCreateCollection}
        visible={createCollectionModalVisible}
      />

      {/* Tag Creation Modal */}
      <TagFormModal
        onClose={() => { setTagModalVisible(false); }}
        onSubmit={handleCreateTag}
        visible={tagModalVisible}
      />
    </RNScrollView>
  </RNView>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#F25D15',
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
  button: {
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
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
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  clearIconButton: {
    backgroundColor: '#fff',
    borderColor: '#eee',
    borderWidth: 1,
  },
  container: { gap: 12, padding: 24 },
  createIconButton: {
    backgroundColor: '#F25D15', // fallback if accent.primary missing
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
  fixedHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerButton: {
    alignItems: 'center',
    borderRadius: 6,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
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
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '70%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
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
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 4,
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
  advancedSection: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 16,
  },
  advancedSectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  advancedSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  advancedSectionContent: {
    gap: 12,
  },
  toggleButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  toggleButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
}); 