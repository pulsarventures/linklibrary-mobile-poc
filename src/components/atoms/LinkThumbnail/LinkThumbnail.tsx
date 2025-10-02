import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from '@/components/ui';

import { IconByVariant } from '../IconByVariant/IconByVariant';

type LinkThumbnailProps = {
  readonly className?: string;
  readonly faviconUrl?: string;
  readonly size?: 'lg' | 'md' | 'sm';
  readonly title?: string;
  readonly url: string;
}

// Utility functions for domain handling  
const getDomainInitials = (url: string, title?: string): string => {
  // Getting initials for URL
  
  try {
    if (!url) {
      return getTitleInitials(title);
    }

    const domain = new URL(url).hostname.replace('www.', '');
    
    const parts = domain.split('.');

    if (parts.length >= 2) {
      const domainName = parts[0];
      if (domainName.length >= 2) {
        const initials = domainName.slice(0, 2).toUpperCase();
        return initials;
      } else if (domainName.length === 1 && parts[1]) {
        const initials = (domainName + parts[1].charAt(0)).toUpperCase();
        return initials;
      }
    }

    const initials = domain.slice(0, 2).toUpperCase();
    return initials;
  } catch {
    return getTitleInitials(title);
  }
};

const getTitleInitials = (title?: string): string => {
  if (!title) {
    return 'WB'; // "Web Bookmark" instead of "LI"
  }
  
  const words = title.trim().split(' ').filter(word => word.length > 0);
  if (words.length >= 2) {
    const initials = (words[0][0] + words[1][0]).toUpperCase();
    return initials;
  } else if (words.length === 1 && words[0].length >= 2) {
    const initials = words[0].slice(0, 2).toUpperCase();
    return initials;
  }
  
  return 'WB';
};

const getDomainColor = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    let hash = 0;
    for (let index = 0; index < domain.length; index++) {
      hash = domain.charCodeAt(index) + ((hash << 5) - hash);
    }

    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#6366F1', // indigo
      '#14B8A6', // teal
      '#F97316', // orange
      '#EF4444', // red
      '#06B6D4', // cyan
      '#059669', // emerald
    ];

    return colors[Math.abs(hash) % colors.length];
  } catch {
    return '#6B7280'; // gray
  }
};

const isYouTubeUrl = (url: string): boolean => {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return domain.includes('youtube') || domain.includes('youtu.be');
  } catch {
    return false;
  }
};

const isVideoUrl = (url: string): boolean => {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    return domain.includes('youtube') || 
           domain.includes('youtu.be') ||
           domain.includes('vimeo') ||
           domain.includes('twitch');
  } catch {
    return false;
  }
};

export function LinkThumbnail({ 
  faviconUrl, 
  size = 'md', 
  title, 
  url 
}: LinkThumbnailProps) {
  const { colors } = useTheme();
  const [showFavicon, setShowFavicon] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [currentFaviconUrl, setCurrentFaviconUrl] = useState<null | string>(null);
  const timeoutReference = useRef<NodeJS.Timeout>();
  const fallbackSourcesReference = useRef<string[]>([]);

  const isYouTube = isYouTubeUrl(url);
  const isVideo = isVideoUrl(url);
  const domainInitials = getDomainInitials(url, title);
  const domainColor = getDomainColor(url);

  const sizes = {
    lg: { container: 64, icon: 32, text: 14 },
    md: { container: 48, icon: 24, text: 12 },
    sm: { container: 32, icon: 16, text: 10 },
  };

  const currentSize = sizes[size];

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }
    };
  }, []);

  // Create a stable reference for tryFavicon function
  const tryFaviconReference = useRef<(source: string, fallbackSources: string[]) => void>();
  
  tryFaviconReference.current = (source: string, fallbackSources: string[] = []) => {
    
    // Clear previous timeout
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
    }

    // Store fallback sources for error handling
    fallbackSourcesReference.current = fallbackSources;

    // Set the current source to try (but don't show it yet - wait for onLoad)
    setCurrentFaviconUrl(source);
    setShowFavicon(false); // Don't show until loaded
    setFaviconError(false);

    // Set timeout to try next source or fallback to initials
    timeoutReference.current = setTimeout(() => {
      if (fallbackSources.length > 0) {
        // Try next favicon source
        const nextSource = fallbackSources[0];
        const remainingSources = fallbackSources.slice(1);
        tryFaviconReference.current(nextSource, remainingSources);
      } else {
        // All sources failed, use initials
        setFaviconError(true);
        setShowFavicon(false);
        setCurrentFaviconUrl(null);
      }
    }, 2000); // 2 second timeout per source
  };

  // Try to load favicon with timeout - prioritize favicon like web app
  useEffect(() => {
    if (!url || isVideo) return;

    // Reset states
    setShowFavicon(false);
    setFaviconError(false);

    // Build favicon sources list (like your web app)
    const faviconSources: string[] = [];
    
    try {
      const urlObject = new URL(url);
      const domain = urlObject.origin;
      const hostname = urlObject.hostname;
      
      // 1. First priority: provided faviconUrl
      if (faviconUrl) {
        faviconSources.push(faviconUrl);
      }
      
      // 2. Google favicon service (most reliable) - prioritize this
      faviconSources.push(`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`, `${domain}/favicon.ico`, `https://icons.duckduckgo.com/ip3/${hostname}.ico`);
      
    } catch {
      // Still try Google service with raw URL (might work in some cases)
      faviconSources.push(`https://www.google.com/s2/favicons?domain=${url}&sz=32`);
    }


    if (faviconSources.length > 0) {
      const [firstSource, ...remainingSources] = faviconSources;
      tryFaviconReference.current(firstSource, remainingSources);
    } else {
      // No sources, use initials
      setFaviconError(true);
      setShowFavicon(false);
    }
  }, [url, faviconUrl, isVideo]);

  const handleFaviconLoad = () => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
    }
    setShowFavicon(true);
    setFaviconError(false);
  };

  const handleFaviconError = () => {
    if (timeoutReference.current) {
      clearTimeout(timeoutReference.current);
    }

    // Try next fallback source if available
    const fallbackSources = fallbackSourcesReference.current;
    if (fallbackSources.length > 0) {
      const nextSource = fallbackSources[0];
      const remainingSources = fallbackSources.slice(1);
      
      // Use setTimeout to avoid synchronous state updates
      setTimeout(() => {
        tryFaviconReference.current(nextSource, remainingSources);
      }, 100);
    } else {
      // No more fallback sources, use initials
      setShowFavicon(false);
      setFaviconError(true);
      setCurrentFaviconUrl(null);
    }
  };

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background.subtle,
      borderColor: colors.border.primary,
      height: currentSize.container,
      width: currentSize.container,
    }
  ];

  // Special handling for YouTube/Video URLs
  if (isYouTube) {
    return (
      <View style={[containerStyle, { backgroundColor: '#FF0000' }]}>
        <IconByVariant
          color="#FFFFFF"
          name="fire"
          size={currentSize.icon * 0.6}
        />
      </View>
    );
  }

  if (isVideo) {
    return (
      <View style={[containerStyle, { backgroundColor: '#8B5CF6' }]}>
        <IconByVariant
          color="#FFFFFF"
          name="fire"
          size={currentSize.icon * 0.6}
        />
      </View>
    );
  }

  // Show favicon if available and loaded successfully
  if (showFavicon && currentFaviconUrl && !faviconError) {
    return (
      <View style={containerStyle}>
        <Image
          onError={handleFaviconError}
          onLoad={handleFaviconLoad}
          resizeMode="contain"
          source={{ uri: currentFaviconUrl }}
          style={[
            styles.favicon,
            {
              height: currentSize.container * 0.7,
              width: currentSize.container * 0.7,
            }
          ]}
        />
      </View>
    );
  }

  // Default: Show CSS-style avatar with domain initials
  return (
    <View style={[containerStyle, { backgroundColor: domainColor }]}>
      <Text
        style={[
          styles.initialsText,
          {
            color: '#FFFFFF',
            fontSize: currentSize.text,
          }
        ]}
      >
        {domainInitials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  favicon: {
    borderRadius: 4,
  },
  initialsText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});