import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageProps, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

type CachedImageProps = {
  readonly fallback?: React.ReactNode;
  readonly onError?: () => void;
  readonly onLoad?: () => void;
  readonly showLoadingIndicator?: boolean;
  readonly src: string;
} & Omit<ImageProps, 'source'>

// Simple in-memory cache for images
const imageCache = new Map<string, { error: boolean; loaded: boolean; }>();

export function CachedImage({ 
  fallback, 
  onError, 
  onLoad, 
  showLoadingIndicator = true, 
  src,
  style,
  ...props 
}: CachedImageProps) {
  const { colors } = useTheme();
  const [imageState, setImageState] = useState<'error' | 'loaded' | 'loading'>(() => {
    const cached = imageCache.get(src);
    if (cached?.loaded) return 'loaded';
    if (cached?.error) return 'error';
    return 'loading';
  });

  const imageReference = useRef<Image>(null);

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
    imageCache.set(src, { error: false, loaded: true });
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    imageCache.set(src, { error: true, loaded: false });
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
        <ActivityIndicator color={colors.text.primary} size="small" />
      </View>
    );
  }

  return (
    <Image
      onError={handleError}
      onLoad={handleLoad}
      ref={imageReference}
      source={{ uri: src }}
      style={[
        styles.image,
        imageState === 'loading' && styles.loading,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    borderRadius: 8,
    height: '100%',
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  loading: {
    opacity: 0,
  },
}); 