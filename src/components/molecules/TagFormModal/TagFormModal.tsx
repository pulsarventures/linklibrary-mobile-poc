import type { Tag } from '@/types/tag.types';

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

type TagFormModalProps = {
  readonly loading?: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (data: { color?: string; name: string; }) => Promise<void>;
  readonly tag?: null | Tag;
  readonly visible: boolean;
}

export function TagFormModal({
  loading = false,
  onClose,
  onSubmit,
  tag,
  visible,
}: TagFormModalProps) {
  const { colors, isDark } = useTheme();
  const nameInputReference = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('gray');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
        nameInputReference.current?.focus();
      }, 100);
      return () => { clearTimeout(timer); };
    }
  }, [visible, isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Tag name is required';
    }

    if (name.trim().length > 50) {
      newErrors.name = 'Tag name must be less than 50 characters';
    }

    // Check for special characters that might cause issues
    const invalidChars = /["*/:<>?\\|]/;
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
        color: color || 'gray',
        name: name.trim(),
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

  const handleClear = () => {
    setName('');
    setColor('gray');
    setErrors({});
  };

  const colorOptions = [
    { label: 'Gray', value: 'gray', color: '#6B7280' },
    { label: 'Blue', value: 'blue', color: '#3B82F6' },
    { label: 'Green', value: 'green', color: '#10B981' },
    { label: 'Red', value: 'red', color: '#EF4444' },
    { label: 'Yellow', value: 'yellow', color: '#F59E0B' },
    { label: 'Purple', value: 'purple', color: '#8B5CF6' },
    { label: 'Pink', value: 'pink', color: '#EC4899' },
    { label: 'Orange', value: 'orange', color: '#F97316' },
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
                { backgroundColor: isDark ? '#6b7280' : '#000000' },
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
              maxLength={50}
              onChangeText={setName}
              placeholder="Enter tag name"
              ref={nameInputReference}
              value={name}
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
                  onPress={() => { setColor(colorOption.value); }}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor: colorOption.color,
                      borderColor: color === colorOption.value ? colors.accent.primary : 'transparent',
                    },
                  ]}
                >
                  {color === colorOption.value && (
                    <IconByVariant color="white" name="check" size={16} />
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