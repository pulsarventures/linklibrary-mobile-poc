import type { Collection } from '@/types/collection.types';

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme';
import { SPACING } from '@/theme/styles/spacing';

import { IconByVariant } from '@/components/atoms';
import { Input, Text } from '@/components/ui';

type CollectionFormModalProps = {
  readonly collection?: Collection | null;
  readonly loading?: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: { color?: string; description?: string; icon?: string; name: string; }) => Promise<void>;
  readonly visible: boolean;
}

export function CollectionFormModal({
  collection,
  loading = false,
  onClose,
  onSubmit,
  visible,
}: CollectionFormModalProps) {
  const { colors } = useTheme();
  const nameInputReference = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('gray');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        nameInputReference.current?.focus();
      }, 100);
      return () => { clearTimeout(timer); };
    }
  }, [visible, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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
        color: color || 'gray',
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        name: name.trim(),
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

  const handleClear = () => {
    setName('');
    setDescription('');
    setIcon('');
    setColor('gray');
    setErrors({});
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
      animationType="slide"
      onRequestClose={handleClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border.primary }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={loading}
            onPress={handleClose}
            style={styles.headerButton}
          >
            <Text style={[styles.buttonText, { color: colors.text.secondary }]}>Cancel</Text>
          </TouchableOpacity>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClear}
              style={[styles.headerButton, styles.clearButton, { borderColor: colors.border.primary }]}
            >
              <Text style={[styles.buttonText, { color: colors.text.secondary }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={loading || !name.trim()}
              onPress={handleSubmit}
              style={[
                styles.headerButton,
                styles.addButton,
                { backgroundColor: colors.accent.primary },
                (loading || !name.trim()) && { opacity: 0.7 }
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : isEditing ? (
                <IconByVariant
                  color="#fff"
                  name="save"
                  size={16}
                />
              ) : (
                <Text style={[styles.buttonText, { color: '#fff' }]}>+ Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {loading ? <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.accent.primary} size="large" />
            </View> : null}

          {/* Name Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Name *
            </Text>
            <Input
              error={errors.name}
              maxLength={100}
              onChangeText={setName}
              placeholder="Enter collection name"
              ref={nameInputReference}
              value={name}
            />
          </View>

          {/* Description Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Description
            </Text>
            <Input
              error={errors.description}
              maxLength={500}
              multiline
              numberOfLines={3}
              onChangeText={setDescription}
              placeholder="Enter collection description (optional)"
              value={description}
            />
          </View>

          {/* Icon Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Icon
            </Text>
            <Input
              maxLength={50}
              onChangeText={setIcon}
              placeholder="Enter icon name (optional)"
              value={icon}
            />
          </View>

          {/* Color Selection */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text.primary }]}>
              Color
            </Text>
            <View style={styles.colorGrid}>
              {colorOptions.map((colorOption) => {
                const isSelected = color === colorOption.value;
                const colorOptionStyle = [
                  styles.colorOption,
                  { backgroundColor: colorOption.value },
                  isSelected && { borderColor: colors.accent.primary }
                ];
                
                return (
                  <Pressable
                    key={colorOption.value}
                    onPress={() => { setColor(colorOption.value); }}
                    style={colorOptionStyle}
                  >
                    {isSelected ? <IconByVariant color="white" name="check" size={16} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  colorOption: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  field: {
    marginBottom: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
}); 