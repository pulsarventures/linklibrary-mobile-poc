import type { Collection } from '@/types/collection.types';
import type { Link } from '@/types/link.types';
import type { Tag } from '@/types/tag.types';

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';

import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { Button, Input, Text } from '@/components/ui';

type LinkFormModalProps = {
  readonly collections: Collection[];
  readonly isVisible: boolean;
  readonly link?: Link;
  readonly onClose: () => void;
  readonly onSubmit: (data: Partial<Link>) => Promise<void>;
  readonly tags: Tag[];
}

export function LinkFormModal({ 
  collections, 
  isVisible, 
  link,
  onClose,
  onSubmit,
  tags,
}: LinkFormModalProps) {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

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
        collection_id: collectionId,
        is_favorite: link?.is_favorite,
        notes: notes.trim(),
        summary: summary.trim(),
        tag_ids: tagIds,
        title: title.trim(),
        url: url.trim(),
      });

      onClose();
    } catch (error_) {
      console.error('Failed to submit link:', error_);
      setError(error_ instanceof Error ? error_.message : 'Failed to save link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      hideModalContentWhileAnimating
      isVisible={isVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      style={styles.modal}
      useNativeDriver
    >
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          {link ? 'Edit Link' : 'Add Link'}
        </Text>

        <ScrollView style={styles.form}>
          <Input
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            label="URL"
            onChangeText={setUrl}
            placeholder="https://example.com"
            value={url}
          />

          <Input
            label="Title"
            onChangeText={setTitle}
            placeholder="Link title"
            value={title}
          />

          <Input
            label="Summary"
            multiline
            numberOfLines={2}
            onChangeText={setSummary}
            placeholder="Brief summary"
            value={summary}
          />

          <Input
            label="Notes"
            multiline
            numberOfLines={3}
            onChangeText={setNotes}
            placeholder="Your notes"
            value={notes}
          />

          {/* TODO: Add collection and tag selectors */}

          {error ? <Text style={[styles.error, { color: colors.text.error }]}>
              {error}
            </Text> : null}
        </ScrollView>

        <View style={styles.buttons}>
          <Button
            onPress={onClose}
            style={styles.button}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            loading={isLoading}
            onPress={handleSubmit}
            style={styles.button}
            variant="primary"
          >
            Save
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 100,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    padding: SPACING.lg,
  },
  error: {
    fontSize: 14,
    marginTop: SPACING.sm,
  },
  form: {
    marginBottom: SPACING.lg,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.lg,
  },
}); 