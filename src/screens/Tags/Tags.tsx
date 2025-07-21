import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, Alert, RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { SafeScreen } from '@/components/templates';
import { Text, Button } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';
import { SPACING } from '@/theme/styles/spacing';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { TagItem, TagFormModal } from '@/components/molecules';
import type { Tag } from '@/types/tag.types';
import Toast from 'react-native-toast-message';

export default function Tags() {
  const { colors } = useTheme();
  const { tags, isLoading, createTag, updateTag, deleteTag, isCreating, isUpdating, isDeleting } = useTagsStore();
  const queryClient = useQueryClient();
  
  // Debug logging
  console.log('📱 Tags screen render:', { 
    tagsCount: tags.length, 
    isLoading, 
    isCreating, 
    isUpdating, 
    isDeleting,
    tags: tags.map(t => ({ id: t.id, name: t.name }))
  });
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
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
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTag(tag.id);
              Toast.show({
                type: 'success',
                text1: 'Tag deleted successfully',
              });
            } catch (error) {
              console.error('Failed to delete tag:', error);
              Toast.show({
                type: 'error',
                text1: 'Failed to delete tag',
                text2: error instanceof Error ? error.message : 'Please try again',
              });
            }
          }
        }
      ]
    );
  };

  const handleCreateTag = () => {
    setEditingTag(null);
    setShowFormModal(true);
  };

  const handleCreateTagSubmit = async (data: { name: string; color?: string }) => {
    try {
      console.log('🔄 Creating tag:', data);
      await createTag({ name: data.name, color: data.color || 'gray' });
      console.log('✅ Tag creation completed');
      Toast.show({
        type: 'success',
        text1: 'Tag created successfully',
      });
      setShowFormModal(false);
    } catch (error) {
      console.error('❌ Failed to create tag:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to create tag',
        text2: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleUpdateTagSubmit = async (data: { name: string; color?: string }) => {
    if (!editingTag) return;
    
    try {
      await updateTag({ id: editingTag.id, data: { name: data.name, color: data.color || 'gray' } });
      Toast.show({
        type: 'success',
        text1: 'Tag updated successfully',
      });
      setShowFormModal(false);
      setEditingTag(null);
    } catch (error) {
      console.error('Failed to update tag:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update tag',
        text2: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleFormSubmit = async (data: { name: string; color?: string }) => {
    if (editingTag) {
      await handleUpdateTagSubmit(data);
    } else {
      await handleCreateTagSubmit(data);
    }
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
          <ActivityIndicator size="large" color={colors.text.primary} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            variant="primary"
            onPress={handleCreateTag}
            style={styles.createButton}
          >
            Create
          </Button>
        </View>

        <FlatList
          data={tags}
          renderItem={({ item }) => (
            <TagItem
              tag={item}
              onPress={() => handleTagPress(item)}
              onEdit={() => handleEditTag(item)}
              onDelete={() => handleDeleteTag(item)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.text.primary]}
              tintColor={colors.text.primary}
            />
          }
        />
      </View>
      
      <TagFormModal
        visible={showFormModal}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        tag={editingTag}
        loading={isCreating || isUpdating}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    minWidth: 100,
    height: 40,
  },
  list: {
    flexGrow: 1,
  },
}); 