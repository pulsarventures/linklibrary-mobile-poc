import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { IconByVariant } from '../IconByVariant/IconByVariant';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

interface LinkThumbnailProps {
  url: string;
  faviconUrl?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
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
        const initials = domainName.substring(0, 2).toUpperCase();
        return initials;
      } else if (domainName.length === 1 && parts[1]) {
        const initials = (domainName + parts[1].charAt(0)).toUpperCase();
        return initials;
      }
    }

    const initials = domain.substring(0, 2).toUpperCase();
    return initials;
  } catch (error) {
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
    const initials = words[0].substring(0, 2).toUpperCase();
    return initials;
  }
  
  return 'WB';
};

const getDomainColor = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
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
  url, 
  faviconUrl, 
  title, 
  size = 'md' 
}: LinkThumbnailProps) {
  const { colors } = useTheme();
  const [showFavicon, setShowFavicon] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [currentFaviconUrl, setCurrentFaviconUrl] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const fallbackSourcesRef = useRef<string[]>([]);

  const isYouTube = isYouTubeUrl(url);
  const isVideo = isVideoUrl(url);
  const domainInitials = getDomainInitials(url, title);
  const domainColor = getDomainColor(url);

  const sizes = {
    sm: { container: 32, icon: 16, text: 10 },
    md: { container: 48, icon: 24, text: 12 },
    lg: { container: 64, icon: 32, text: 14 },
  };

  const currentSize = sizes[size];

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Create a stable reference for tryFavicon function
  const tryFaviconRef = useRef<(src: string, fallbackSources: string[]) => void>();
  
  tryFaviconRef.current = (src: string, fallbackSources: string[] = []) => {
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Store fallback sources for error handling
    fallbackSourcesRef.current = fallbackSources;

    // Set the current source to try (but don't show it yet - wait for onLoad)
    setCurrentFaviconUrl(src);
    setShowFavicon(false); // Don't show until loaded
    setFaviconError(false);

    // Set timeout to try next source or fallback to initials
    timeoutRef.current = setTimeout(() => {
      if (fallbackSources.length > 0) {
        // Try next favicon source
        const nextSrc = fallbackSources[0];
        const remainingSources = fallbackSources.slice(1);
        tryFaviconRef.current?.(nextSrc, remainingSources);
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
      const urlObj = new URL(url);
      const domain = urlObj.origin;
      const hostname = urlObj.hostname;
      
      // 1. First priority: provided faviconUrl
      if (faviconUrl) {
        faviconSources.push(faviconUrl);
      }
      
      // 2. Google favicon service (most reliable) - prioritize this
      faviconSources.push(`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`);
      
      // 3. Standard favicon.ico
      faviconSources.push(`${domain}/favicon.ico`);
      
      // 4. Alternative favicon service
      faviconSources.push(`https://icons.duckduckgo.com/ip3/${hostname}.ico`);
      
    } catch (error) {
      // Still try Google service with raw URL (might work in some cases)
      faviconSources.push(`https://www.google.com/s2/favicons?domain=${url}&sz=32`);
    }


    if (faviconSources.length > 0) {
      const [firstSrc, ...remainingSources] = faviconSources;
      tryFaviconRef.current?.(firstSrc, remainingSources);
    } else {
      // No sources, use initials
      setFaviconError(true);
      setShowFavicon(false);
    }
  }, [url, faviconUrl, isVideo]);

  const handleFaviconLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowFavicon(true);
    setFaviconError(false);
  };

  const handleFaviconError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Try next fallback source if available
    const fallbackSources = fallbackSourcesRef.current;
    if (fallbackSources.length > 0) {
      const nextSrc = fallbackSources[0];
      const remainingSources = fallbackSources.slice(1);
      
      // Use setTimeout to avoid synchronous state updates
      setTimeout(() => {
        tryFaviconRef.current?.(nextSrc, remainingSources);
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
      width: currentSize.container,
      height: currentSize.container,
      backgroundColor: colors.background.subtle,
      borderColor: colors.border.primary,
    }
  ];

  // Special handling for YouTube/Video URLs
  if (isYouTube) {
    return (
      <View style={[containerStyle, { backgroundColor: '#FF0000' }]}>
        <IconByVariant
          name="fire"
          size={currentSize.icon * 0.6}
          color="#FFFFFF"
        />
      </View>
    );
  }

  if (isVideo) {
    return (
      <View style={[containerStyle, { backgroundColor: '#8B5CF6' }]}>
        <IconByVariant
          name="fire"
          size={currentSize.icon * 0.6}
          color="#FFFFFF"
        />
      </View>
    );
  }

  // Show favicon if available and loaded successfully
  if (showFavicon && currentFaviconUrl && !faviconError) {
    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: currentFaviconUrl }}
          style={[
            styles.favicon,
            {
              width: currentSize.container * 0.7,
              height: currentSize.container * 0.7,
            }
          ]}
          onLoad={handleFaviconLoad}
          onError={handleFaviconError}
          resizeMode="contain"
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
            fontSize: currentSize.text,
            color: '#FFFFFF',
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
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  favicon: {
    borderRadius: 4,
  },
  initialsText: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});