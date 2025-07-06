import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { SafeScreen } from '@/components/templates';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';
import { SPACING } from '@/theme/styles/spacing';
import { useTagsStore } from '@/hooks/domain/tags/useTagsStore';
import { TagItem } from '@/components/molecules/TagItem/TagItem';
import type { Tag } from '@/types/tag.types';

export default function Tags() {
  const { colors } = useTheme();
  const { tags, isLoading, deleteTag } = useTagsStore();
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const handleTagPress = (tag: Tag) => {
    setSelectedTag(tag);
  };

  const handleEditTag = (tag: Tag) => {
    // TODO: Implement edit tag modal
    console.log('Edit tag:', tag);
  };

  const handleDeleteTag = async (tag: Tag) => {
    try {
      await deleteTag(tag.id);
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  };

  const handleCreateTag = () => {
    // TODO: Implement create tag modal
    console.log('Create new tag');
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
        <Text 
          variant="title"
          weight="bold"
          style={[styles.title, { color: colors.text.primary }]}
        >
          Tags
        </Text>

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
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: SPACING.md,
  },
  list: {
    flexGrow: 1,
  },
}); 