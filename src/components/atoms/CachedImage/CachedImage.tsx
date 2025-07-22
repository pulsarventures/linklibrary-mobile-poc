import React, { useState, useEffect, useRef } from 'react';
import { Image, ImageProps, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  src: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  showLoadingIndicator?: boolean;
}

// Simple in-memory cache for images
const imageCache = new Map<string, { loaded: boolean; error: boolean }>();

export function CachedImage({ 
  src, 
  fallback, 
  onLoad, 
  onError, 
  showLoadingIndicator = true,
  style,
  ...props 
}: CachedImageProps) {
  const { colors } = useTheme();
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>(() => {
    const cached = imageCache.get(src);
    if (cached?.loaded) return 'loaded';
    if (cached?.error) return 'error';
    return 'loading';
  });

  const imageRef = useRef<Image>(null);

  useEffect(() => {
    if (!src) {
      setImageState('error');
      return;
    }

    // Check cache first
    const cached = imageCache.get(src);
    if (cached?.loaded) {
      setImageState('loaded');
      onLoad?.();
      return;
    }
    if (cached?.error) {
      setImageState('error');
      onError?.();
      return;
    }

    // For React Native, we rely on the Image component's built-in caching
    // and onLoad/onError handlers to manage the cache state
  }, [src, onLoad, onError]);

  const handleLoad = () => {
    imageCache.set(src, { loaded: true, error: false });
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    imageCache.set(src, { loaded: false, error: true });
    setImageState('error');
    onError?.();
  };

  if (imageState === 'error') {
    return (
      <View style={[styles.container, style]}>
        {fallback || (
          <View style={[styles.fallback, { backgroundColor: colors.background.subtle }]} />
        )}
      </View>
    );
  }

  if (imageState === 'loading' && showLoadingIndicator) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color={colors.text.primary} />
      </View>
    );
  }

  return (
    <Image
      ref={imageRef}
      source={{ uri: src }}
      style={[
        styles.image,
        imageState === 'loading' && styles.loading,
        style,
      ]}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loading: {
    opacity: 0,
  },
  fallback: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
}); 