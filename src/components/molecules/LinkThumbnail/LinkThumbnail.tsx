import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';
import { CachedImage } from '@/components/atoms';
import { IconByVariant } from '@/components/atoms';

interface LinkThumbnailProps {
  url: string;
  faviconUrl?: string;
  title?: string;
  sourceName?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: any;
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
    console.log('Getting initials for URL:', url);
    const domain = extractDomain(url);
    
    // Handle YouTube URLs specially
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return 'YT';
    }

    // Handle common domains
    const domainMap: Record<string, string> = {
      'openai.com': 'OA',
      'github.com': 'GH',
      'twitter.com': 'TW',
      'x.com': 'TW',
      'google.com': 'GO',
      'facebook.com': 'FB',
      'stackoverflow.com': 'SO',
      'medium.com': 'MD',
      'reddit.com': 'RD',
      'linkedin.com': 'LI',
      'chatgpt.com': 'CG',
      'instagram.com': 'IG',
      'microsoft.com': 'MS',
      'amazon.com': 'AM',
      'netflix.com': 'NF',
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
    console.log('Domain parts:', parts);

    // For subdomains, use the main domain part
    if (parts.length > 2) {
      const mainDomain = parts[parts.length - 2];
      console.log('Using main domain for subdomain:', mainDomain);
      return mainDomain.substring(0, 2).toUpperCase();
    }

    // For regular domains, use the first part
    if (parts.length >= 2) {
      const domainName = parts[0];
      console.log('Using first part of domain:', domainName);
      if (domainName.length >= 2) {
        return domainName.substring(0, 2).toUpperCase();
      }
    }

    // Fallback to first two characters of the full domain
    console.log('Falling back to full domain:', domain);
    return domain.substring(0, 2).toUpperCase();
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
      'youtube.com': '#EF4444', // red-500
      'youtu.be': '#EF4444', // red-500
      'github.com': '#333333',
      'twitter.com': '#1DA1F2',
      'x.com': '#000000',
      'facebook.com': '#1877F2',
      'instagram.com': '#E4405F',
      'linkedin.com': '#0A66C2',
      'openai.com': '#3B82F6', // blue-500
      'chatgpt.com': '#10B981', // emerald-500
      'google.com': '#4285F4',
      'microsoft.com': '#00A4EF',
      'amazon.com': '#FF9900',
      'netflix.com': '#E50914',
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
    for (let i = 0; i < domain.length; i++) {
      hash = domain.charCodeAt(i) + ((hash << 5) - hash);
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
  url, 
  faviconUrl, 
  title, 
  sourceName, 
  size = 'md', 
  style 
}: LinkThumbnailProps) {
  const { colors } = useTheme();
  const [showFavicon, setShowFavicon] = useState(false);
  const [faviconSrc, setFaviconSrc] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const isYouTube = isYouTubeUrl(url);
  const domainInitials = getDomainInitials(url);
  const domainColor = getDomainColor(url);

  const sizeStyles = {
    sm: { width: 32, height: 32, fontSize: 12 },
    md: { width: 40, height: 40, fontSize: 14 },
    lg: { width: 48, height: 48, fontSize: 16 },
  };

  const currentSize = sizeStyles[size];

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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
    setFaviconSrc(null);

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
                  setFaviconSrc(proxyUrl);
                  setShowFavicon(true);
                  console.log('✅ Favicon loaded from proxy');
                }
              })
              .catch(() => {
                console.log('❌ Failed to load favicon from proxy');
              });
            return;
          }

          const currentUrl = faviconUrls[index];
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          fetch(currentUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'image/webp,image/png,image/svg+xml,image/*,*/*',
            },
          })
            .then(response => {
              clearTimeout(timeoutId);
              if (response.ok && response.headers.get('content-type')?.includes('image')) {
                setFaviconSrc(currentUrl);
                setShowFavicon(true);
                console.log('✅ Favicon loaded from:', currentUrl);
              } else {
                throw new Error('Invalid response');
              }
            })
            .catch(error => {
              if (error.name === 'AbortError') {
                console.log('⏰ Favicon timeout for:', currentUrl);
              } else {
                console.log('❌ Failed to load favicon from:', currentUrl);
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
        <IconByVariant name="play" size={currentSize.width * 0.6} color="#FFFFFF" />
      </View>
    );
  }

  // Show favicon if loaded successfully
  if (showFavicon && faviconSrc) {
    return (
      <View
        style={[
          styles.container,
          currentSize,
          { 
            backgroundColor: colors.background.subtle,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.05)',
          },
          style,
        ]}
      >
        <View style={styles.faviconContainer}>
          <CachedImage
            src={faviconSrc}
            style={[styles.favicon, { width: currentSize.width * 0.75, height: currentSize.height * 0.75 }]}
            showLoadingIndicator={false}
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
            fontSize: currentSize.fontSize,
            color: '#FFFFFF',
          },
        ]}
      >
        {domainInitials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  faviconContainer: {
    width: '75%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favicon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  avatarText: {
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
}); 