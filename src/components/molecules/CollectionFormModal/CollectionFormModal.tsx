import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useTheme } from '@/theme';
import { Text, Button, Input } from '@/components/ui';
import type { Collection } from '@/types/collection.types';
import { SPACING } from '@/theme/styles/spacing';
import { IconByVariant } from '@/components/atoms';

interface CollectionFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string; icon?: string; color?: string }) => Promise<void>;
  collection?: Collection | null;
  loading?: boolean;
}

export function CollectionFormModal({
  visible,
  onClose,
  onSubmit,
  collection,
  loading = false,
}: CollectionFormModalProps) {
  const { colors } = useTheme();
  const nameInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('gray');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!collection;

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || '');
      setIcon(collection.icon || '');
      setColor(collection.color || 'gray');
    } else {
      setName('');
      setDescription('');
      setIcon('');
      setColor('gray');
    }
    setErrors({});
  }, [collection, visible]);

  // Auto-focus name input when modal becomes visible for new collections
  useEffect(() => {
    if (visible && !isEditing) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, isEditing]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Collection name is required';
    }

    if (name.trim().length > 100) {
      newErrors.name = 'Collection name must be less than 100 characters';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        color: color || 'gray',
      });
      onClose();
    } catch (error) {
      console.error('Failed to save collection:', error);
      Alert.alert('Error', 'Failed to save collection. Please try again.');
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const colorOptions = [
    { label: 'Gray', value: 'gray' },
    { label: 'Blue', value: 'blue' },
    { label: 'Green', value: 'green' },
    { label: 'Red', value: 'red' },
    { label: 'Yellow', value: 'yellow' },
    { label: 'Purple', value: 'purple' },
    { label: 'Pink', value: 'pink' },
    { label: 'Orange', value: 'orange' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border.primary }]}>
          <Pressable onPress={handleClose} disabled={loading}>
            <Text style={[styles.cancelButton, { color: colors.text.secondary }]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            {isEditing ? 'Edit Collection' : 'New Collection'}
          </Text>
          <Pressable onPress={handleSubmit} disabled={loading || !name.trim()}>
            <Text
              style={[
                styles.saveButton,
                {
                  color: loading || !name.trim() ? colors.text.tertiary : colors.accent.primary,
                },
              ]}
            >
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.accent.primary} />
            </View>
          )}

          {/* Name Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Name *
            </Text>
            <Input
              ref={nameInputRef}
              value={name}
              onChangeText={setName}
              placeholder="Enter collection name"
              error={errors.name}
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Description
            </Text>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder="Enter collection description (optional)"
              multiline
              numberOfLines={3}
              error={errors.description}
              maxLength={500}
            />
          </View>

          {/* Icon Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Icon
            </Text>
            <Input
              value={icon}
              onChangeText={setIcon}
              placeholder="Enter icon name (optional)"
              maxLength={50}
            />
          </View>

          {/* Color Selection */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Color
            </Text>
            <View style={styles.colorGrid}>
              {colorOptions.map((colorOption) => (
                <Pressable
                  key={colorOption.value}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: colorOption.value,
                      borderColor: color === colorOption.value ? colors.accent.primary : 'transparent',
                    },
                  ]}
                  onPress={() => setColor(colorOption.value)}
                >
                  {color === colorOption.value && (
                    <IconByVariant name="check" size={16} color="white" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 