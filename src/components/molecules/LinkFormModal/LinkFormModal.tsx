import type { Link } from '@/types/link.types';
import type { Collection } from '@/types/collection.types';
import type { Tag } from '@/types/tag.types';

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import Modal from 'react-native-modal';

import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';
import { Button, Input, Text } from '@/components/ui';

interface LinkFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Link>) => Promise<void>;
  link?: Link;
  collections: Collection[];
  tags: Tag[];
}

export function LinkFormModal({ 
  isVisible, 
  onClose, 
  onSubmit,
  link,
  collections,
  tags,
}: LinkFormModalProps) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [url, setUrl] = useState(link?.url || '');
  const [title, setTitle] = useState(link?.title || '');
  const [summary, setSummary] = useState(link?.summary || '');
  const [notes, setNotes] = useState(link?.notes || '');
  const [collectionId, setCollectionId] = useState(link?.collection_id || '');
  const [tagIds, setTagIds] = useState<string[]>(link?.tag_ids || []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isVisible && link) {
      setUrl(link.url);
      setTitle(link.title);
      setSummary(link.summary || '');
      setNotes(link.notes || '');
      setCollectionId(link.collection_id);
      setTagIds(link.tag_ids);
    } else {
      setUrl('');
      setTitle('');
      setSummary('');
      setNotes('');
      setCollectionId('');
      setTagIds([]);
    }
    setError(null);
  }, [isVisible, link]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Basic validation
      if (!url.trim()) {
        setError('URL is required');
        return;
      }

      await onSubmit({
        url: url.trim(),
        title: title.trim(),
        summary: summary.trim(),
        notes: notes.trim(),
        collection_id: collectionId,
        tag_ids: tagIds,
        is_favorite: link?.is_favorite,
      });

      onClose();
    } catch (err) {
      console.error('Failed to submit link:', err);
      setError(err instanceof Error ? err.message : 'Failed to save link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modal}
    >
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {link ? 'Edit Link' : 'Add Link'}
        </Text>

        <ScrollView style={styles.form}>
          <Input
            label="URL"
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <Input
            label="Title"
            value={title}
            onChangeText={setTitle}
            placeholder="Link title"
          />

          <Input
            label="Summary"
            value={summary}
            onChangeText={setSummary}
            placeholder="Brief summary"
            multiline
            numberOfLines={2}
          />

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Your notes"
            multiline
            numberOfLines={3}
          />

          {/* TODO: Add collection and tag selectors */}

          {error && (
            <Text style={[styles.error, { color: colors.text.error }]}>
              {error}
            </Text>
          )}
        </ScrollView>

        <View style={styles.buttons}>
          <Button
            onPress={onClose}
            variant="secondary"
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit}
            variant="primary"
            style={styles.button}
            loading={isLoading}
          >
            Save
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: SPACING.lg,
    maxHeight: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  error: {
    marginTop: SPACING.sm,
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  button: {
    minWidth: 100,
  },
}); 