import type { Tag } from '@/types/tag.types';

import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { SPACING } from '@/theme/styles/spacing';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

import { TagFormModal, TagItem } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';
import { Button, Text } from '@/components/ui';

export default function Tags() {
  const { colors } = useTheme();
  const { createTag, deleteTag, isCreating, isDeleting, isLoading, isUpdating, tags, updateTag } = useTagsStore();
  const queryClient = useQueryClient();
  
  // Debug logging
  console.log('📱 Tags screen render:', { 
    isCreating, 
    isDeleting, 
    isLoading, 
    isUpdating, 
    tags: tags.map(t => ({ id: t.id, name: t.name })),
    tagsCount: tags.length
  });
  const [selectedTag, setSelectedTag] = useState<null | Tag>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTag, setEditingTag] = useState<null | Tag>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleTagPress = (tag: Tag) => {
    setSelectedTag(tag);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setShowFormModal(true);
  };

  const handleDeleteTag = async (tag: Tag) => {
    Alert.alert(
      'Delete Tag',
      `Are you sure you want to delete "${tag.name}"? This action cannot be undone.`,
      [
        { style: 'cancel', text: 'Cancel' },
        { 
          onPress: async () => {
            try {
              await deleteTag(tag.id);
              Toast.show({
                text1: 'Tag deleted successfully',
                type: 'success',
              });
            } catch (error) {
              console.error('Failed to delete tag:', error);
              Toast.show({
                text1: 'Failed to delete tag',
                text2: error instanceof Error ? error.message : 'Please try again',
                type: 'error',
              });
            }
          }, 
          style: 'destructive',
          text: 'Delete'
        }
      ]
    );
  };

  const handleCreateTag = () => {
    setEditingTag(null);
    setShowFormModal(true);
  };

  const handleCreateTagSubmit = async (data: { color?: string; name: string; }) => {
    try {
      console.log('🔄 Creating tag:', data);
      await createTag({ color: data.color || 'gray', name: data.name });
      console.log('✅ Tag creation completed');
      Toast.show({
        text1: 'Tag created successfully',
        type: 'success',
      });
      setShowFormModal(false);
    } catch (error) {
      console.error('❌ Failed to create tag:', error);
      Toast.show({
        text1: 'Failed to create tag',
        text2: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      });
    }
  };

  const handleUpdateTagSubmit = async (data: { color?: string; name: string; }) => {
    if (!editingTag) return;
    
    try {
      await updateTag({ data: { color: data.color || 'gray', name: data.name }, id: editingTag.id });
      Toast.show({
        text1: 'Tag updated successfully',
        type: 'success',
      });
      setShowFormModal(false);
      setEditingTag(null);
    } catch (error) {
      console.error('Failed to update tag:', error);
      Toast.show({
        text1: 'Failed to update tag',
        text2: error instanceof Error ? error.message : 'Please try again',
        type: 'error',
      });
    }
  };

  const handleFormSubmit = async (data: { color?: string; name: string; }) => {
    await (editingTag ? handleUpdateTagSubmit(data) : handleCreateTagSubmit(data));
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingTag(null);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing tags...');
      await queryClient.invalidateQueries({ queryKey: ['tags'] });
      await queryClient.refetchQueries({ queryKey: ['tags'] });
      console.log('✅ Tags refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh tags:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator color={colors.text.primary} size="large" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            onPress={handleCreateTag}
            style={styles.createButton}
            variant="primary"
          >
            Create
          </Button>
        </View>

        <FlatList
          contentContainerStyle={styles.list}
          data={tags}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              colors={[colors.text.primary]}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              tintColor={colors.text.primary}
            />
          }
          renderItem={({ item }) => (
            <TagItem
              onDelete={() => handleDeleteTag(item)}
              onEdit={() => { handleEditTag(item); }}
              onPress={() => { handleTagPress(item); }}
              tag={item}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      <TagFormModal
        loading={isCreating || isUpdating}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        tag={editingTag}
        visible={showFormModal}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  createButton: {
    height: 40,
    minWidth: 100,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  list: {
    flexGrow: 1,
  },
}); 