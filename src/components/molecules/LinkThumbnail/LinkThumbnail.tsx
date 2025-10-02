import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme';

import { CachedImage } from '@/components/atoms';
import { IconByVariant } from '@/components/atoms';

type LinkThumbnailProps = {
  readonly faviconUrl?: string;
  readonly size?: 'lg' | 'md' | 'sm';
  readonly sourceName?: string;
  readonly style?: any;
  readonly title?: string;
  readonly url: string;
}

// Utility functions for domain handling
// Extract domain from URL
const extractDomain = (url: string): string => {
  try {
    // Remove protocol
    let domain = url.replace(/^https?:\/\//, '');
    // Remove path and query
    domain = domain.split('/')[0];
    // Remove www.
    domain = domain.replace(/^www\./, '');
    return domain;
  } catch {
    return '';
  }
};

const getDomainInitials = (url: string): string => {
  try {
    const domain = extractDomain(url);
    
    // Handle YouTube URLs specially
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return 'YT';
    }

    // Handle common domains
    const domainMap: Record<string, string> = {
      'amazon.com': 'AM',
      'chatgpt.com': 'CG',
      'facebook.com': 'FB',
      'github.com': 'GH',
      'google.com': 'GO',
      'instagram.com': 'IG',
      'linkedin.com': 'LI',
      'medium.com': 'MD',
      'microsoft.com': 'MS',
      'netflix.com': 'NF',
      'openai.com': 'OA',
      'reddit.com': 'RD',
      'stackoverflow.com': 'SO',
      'twitter.com': 'TW',
      'x.com': 'TW',
    };

    // Check for exact domain match
    if (domainMap[domain]) {
      return domainMap[domain];
    }

    // Check for subdomain match
    for (const [key, value] of Object.entries(domainMap)) {
      if (domain.endsWith(key)) {
        return value;
      }
    }

    // Split domain into parts
    const parts = domain.split('.');

    // For subdomains, use the main domain part
    if (parts.length > 2) {
      const mainDomain = parts.at(-2);
      return mainDomain.slice(0, 2).toUpperCase();
    }

    // For regular domains, use the first part
    if (parts.length >= 2) {
      const domainName = parts[0];
      if (domainName.length >= 2) {
        return domainName.slice(0, 2).toUpperCase();
      }
    }

    // Fallback to first two characters of the full domain
    return domain.slice(0, 2).toUpperCase();
  } catch (error) {
    console.error('Error getting domain initials:', error);
    return 'LI';
  }
};

const getDomainColor = (url: string): string => {
  try {
    const domain = extractDomain(url);
    if (!domain) return '#6B7280'; // gray-500

    // Special cases for known domains
    const colorMap: Record<string, string> = {
      'amazon.com': '#FF9900',
      'chatgpt.com': '#10B981', // emerald-500
      'facebook.com': '#1877F2',
      'github.com': '#333333',
      'google.com': '#4285F4',
      'instagram.com': '#E4405F',
      'linkedin.com': '#0A66C2',
      'microsoft.com': '#00A4EF',
      'netflix.com': '#E50914',
      'openai.com': '#3B82F6', // blue-500
      'twitter.com': '#1DA1F2',
      'x.com': '#000000',
      'youtu.be': '#EF4444', // red-500
      'youtube.com': '#EF4444', // red-500
    };

    // Check for exact domain match
    if (colorMap[domain]) {
      return colorMap[domain];
    }

    // Check for subdomain match
    for (const [key, value] of Object.entries(colorMap)) {
      if (domain.endsWith(key)) {
        return value;
      }
    }

    // Generate color from domain hash
    let hash = 0;
    for (let index = 0; index < domain.length; index++) {
      hash = domain.charCodeAt(index) + ((hash << 5) - hash);
    }

    const colors = [
      '#3B82F6', // blue-500
      '#22C55E', // green-500
      '#A855F7', // purple-500
      '#EC4899', // pink-500
      '#6366F1', // indigo-500
      '#14B8A6', // teal-500
      '#F97316', // orange-500
      '#EF4444', // red-500
      '#06B6D4', // cyan-500
      '#10B981', // emerald-500
    ];

    return colors[Math.abs(hash) % colors.length];
  } catch {
    return '#6B7280'; // gray-500
  }
};

const isYouTubeUrl = (url: string): boolean => {
  try {
    const domain = extractDomain(url);
    return domain.includes('youtube.com') || domain.includes('youtu.be');
  } catch {
    return false;
  }
};

export function LinkThumbnail({ 
  faviconUrl, 
  size = 'md', 
  sourceName, 
  style, 
  title, 
  url 
}: LinkThumbnailProps) {
  const { colors } = useTheme();
  const [showFavicon, setShowFavicon] = useState(false);
  const [faviconSource, setFaviconSource] = useState<null | string>(null);
  const timeoutReference = useRef<NodeJS.Timeout>();

  const isYouTube = isYouTubeUrl(url);
  const domainInitials = getDomainInitials(url);
  const domainColor = getDomainColor(url);

  const sizeStyles = {
    lg: { fontSize: 16, height: 48, width: 48 },
    md: { fontSize: 14, height: 40, width: 40 },
    sm: { fontSize: 12, height: 32, width: 32 },
  };

  const currentSize = sizeStyles[size];

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }
    };
  }, []);

  // Extract domain from URL
const extractDomain = (url: string): string => {
  try {
    // Remove protocol
    let domain = url.replace(/^https?:\/\//, '');
    // Remove path and query
    domain = domain.split('/')[0];
    // Remove www.
    domain = domain.replace(/^www\./, '');
    return domain;
  } catch {
    return '';
  }
};

// Try to load favicon
useEffect(() => {
    if (!url || isYouTube) return;

    // Start with CSS avatar, try to load favicon in background
    setShowFavicon(false);
    setFaviconSource(null);

    const loadFavicon = () => {
      try {
        const domain = extractDomain(url);
        
        if (!domain) return;

        // Try multiple favicon services in order
        const faviconUrls = [
          // Try provided favicon URL first if it's from a trusted source
          faviconUrl?.startsWith('https://') ? faviconUrl : null,
          // DuckDuckGo's favicon service (very reliable)
          `https://icons.duckduckgo.com/ip3/${domain}.ico`,
          // Google's favicon service with larger size
          `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
          // Favicon Kit service
          `https://api.faviconkit.com/${domain}/144`,
          // Icon Horse service (good quality)
          `https://icon.horse/icon/${domain}`,
          // Fallback to Google's service with domain
          `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        ].filter((url): url is string => !!url); // Type guard to remove null/undefined

        // Try each URL in sequence
        let index = 0;
        const tryNextFavicon = () => {
          if (index >= faviconUrls.length) {
            // Try proxy service as last resort
            const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(domain)}/favicon.ico&n=-1`;
            fetch(proxyUrl)
              .then(response => {
                if (response.ok) {
                  setFaviconSource(proxyUrl);
                  setShowFavicon(true);
                }
              })
              .catch(() => {
              });
            return;
          }

          const currentUrl = faviconUrls[index];
          const controller = new AbortController();
          const timeoutId = setTimeout(() => { controller.abort(); }, 3000);

          fetch(currentUrl, {
            headers: {
              'Accept': 'image/webp,image/png,image/svg+xml,image/*,*/*',
            },
            method: 'GET',
            signal: controller.signal,
          })
            .then(response => {
              clearTimeout(timeoutId);
              if (response.ok && response.headers.get('content-type')?.includes('image')) {
                setFaviconSource(currentUrl);
                setShowFavicon(true);
              } else {
                throw new Error('Invalid response');
              }
            })
            .catch(error => {
              if (error.name === 'AbortError') {
              } else {
              }
              index++;
              tryNextFavicon();
            });
        };

        tryNextFavicon();
      } catch (error) {
        console.error('Error loading favicon:', error);
      }
    };

    loadFavicon();
  }, [url, faviconUrl, isYouTube]);

  // Special handling for YouTube videos
  if (isYouTube) {
    return (
      <View
        style={[
          styles.container,
          currentSize,
          { backgroundColor: '#FF0000' },
          style,
        ]}
      >
        <IconByVariant color="#FFFFFF" name="play" size={currentSize.width * 0.6} />
      </View>
    );
  }

  // Show favicon if loaded successfully
  if (showFavicon && faviconSource) {
    return (
      <View
        style={[
          styles.container,
          currentSize,
          { 
            backgroundColor: colors.background.subtle,
            borderColor: 'rgba(0,0,0,0.05)',
            borderWidth: 1,
          },
          style,
        ]}
      >
        <View style={styles.faviconContainer}>
          <CachedImage
            showLoadingIndicator={false}
            src={faviconSource}
            style={[styles.favicon, { height: currentSize.height * 0.75, width: currentSize.width * 0.75 }]}
          />
        </View>
      </View>
    );
  }

  // Default: Show CSS avatar (immediate, no loading)
  return (
    <View
      style={[
        styles.container,
        currentSize,
        { backgroundColor: domainColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          { 
            color: '#FFFFFF',
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {domainInitials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarText: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  container: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  favicon: {
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
  },
  faviconContainer: {
    alignItems: 'center',
    height: '75%',
    justifyContent: 'center',
    width: '75%',
  },
}); 