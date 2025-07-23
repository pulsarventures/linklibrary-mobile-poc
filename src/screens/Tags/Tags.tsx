import type { RootTabParamList } from '@/navigation/types';
import type { Tag } from '@/types/tag.types';
import type { NavigationProp } from '@react-navigation/native';

import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { SPACING } from '@/theme/styles/spacing';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

import { IconByVariant } from '@/components/atoms';
import { TagFormModal, TagItem } from '@/components/molecules';
import { SafeScreen } from '@/components/templates';

export default function Tags() {
  const { colors } = useTheme();
  const { createTag, deleteTag, isCreating, isDeleting, isLoading, isUpdating, tags, updateTag } = useTagsStore();
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  
  // Debug logging
  console.log('📱 Tags screen render:', { 
    isCreating, 
    isDeleting, 
    isLoading, 
    isUpdating, 
    tags: tags.map(t => ({ id: t.id, name: t.name })),
    tagsCount: tags.length
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTag, setEditingTag] = useState<null | Tag>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleTagPress = (tag: Tag) => {
    console.log('🏷️ Tag pressed:', { id: tag.id, name: tag.name });
    // First navigate to Links tab, then set params to ensure they're received
    navigation.navigate('Links', { 
      tagId: tag.id,
      tagName: tag.name,
      // Clear any collection params to avoid conflicts
      collectionId: undefined,
      collectionName: undefined
    });
    console.log('🏷️ Navigation called to Links with params:', { 
      tagId: tag.id, 
      tagName: tag.name,
      collectionId: undefined,
      collectionName: undefined
    });
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
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleCreateTag}
        style={[styles.floatingButton, { backgroundColor: colors.accent.primary }]}
      >
        <IconByVariant
          color={colors.text.inverse}
          name="add"
          size={24}
        />
      </TouchableOpacity>
      
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
  floatingButton: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 35,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 56,
  },
  list: {
    flexGrow: 1,
  },
}); 