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
import { Text, Input } from '@/components/ui';
import type { Tag } from '@/types/tag.types';
import { SPACING } from '@/theme/styles/spacing';
import { IconByVariant } from '@/components/atoms';

interface TagFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; color?: string }) => Promise<void>;
  tag?: Tag | null;
  loading?: boolean;
}

export function TagFormModal({
  visible,
  onClose,
  onSubmit,
  tag,
  loading = false,
}: TagFormModalProps) {
  const { colors } = useTheme();
  const nameInputRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('gray');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!tag;

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color || 'gray');
    } else {
      setName('');
      setColor('gray');
    }
    setErrors({});
  }, [tag, visible]);

  // Auto-focus name input when modal becomes visible for new tags
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
      newErrors.name = 'Tag name is required';
    }

    if (name.trim().length > 50) {
      newErrors.name = 'Tag name must be less than 50 characters';
    }

    // Check for special characters that might cause issues
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name.trim())) {
      newErrors.name = 'Tag name contains invalid characters';
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
        color: color || 'gray',
      });
      onClose();
    } catch (error) {
      console.error('Failed to save tag:', error);
      Alert.alert('Error', 'Failed to save tag. Please try again.');
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
            {isEditing ? 'Edit Tag' : 'New Tag'}
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
              placeholder="Enter tag name"
              error={errors.name}
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