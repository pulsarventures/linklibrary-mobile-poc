import { Alert, Linking, Platform } from 'react-native';

// App URL schemes for various popular apps
const APP_SCHEMES = {
  instagram: {
    getAppUrl: (postId: string) => `instagram://media?id=${postId}`,
    patterns: [
      /instagram\.com\/p\/([\w-]+)/,
      /instagram\.com\/reel\/([\w-]+)/
    ],
  },
  linkedin: {
    getAppUrl: (path: string) => `linkedin://profile/${path}`,
    patterns: [
      /linkedin\.com\/in\/([^/]+)/,
      /linkedin\.com\/posts\/([^/]+)/
    ],
  },
  reddit: {
    getAppUrl: (subreddit: string, postId: string) => `reddit://reddit.com/r/${subreddit}/comments/${postId}`,
    patterns: [
      /reddit\.com\/r\/([^/]+)\/comments\/([^/]+)/
    ],
  },
  spotify: {
    getAppUrl: (type: string, id: string) => `spotify://${type}/${id}`,
    patterns: [
      /open\.spotify\.com\/(track|album|playlist|artist)\/([\dA-Za-z]+)/
    ],
  },
  twitter: {
    getAppUrl: (username: string, tweetId: string) => `twitter://status?id=${tweetId}`,
    patterns: [
      /twitter\.com\/([^/]+)\/status\/(\d+)/,
      /x\.com\/([^/]+)\/status\/(\d+)/
    ],
  },
  youtube: {
    getAppUrl: (videoId: string) => `vnd.youtube://${videoId}`,
    patterns: [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
      /youtube\.com\/shorts\/([\w-]+)/
    ],
  }
};

export async function openLink(url: string): Promise<void> {
  try {
    // Ensure URL has protocol
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = 'https://' + url;
    }

    console.log('Attempting to open URL:', normalizedUrl);

    // On Android, try to open in native apps first
    if (Platform.OS === 'android') {
      for (const [appName, config] of Object.entries(APP_SCHEMES)) {
        for (const pattern of config.patterns) {
          const match = normalizedUrl.match(pattern);
          if (match) {
            try {
              const appUrl = config.getAppUrl(...match.slice(1));
              console.log(`Trying ${appName} app URL:`, appUrl);
              
              // Don't check canOpenURL for Android deep links - just try to open
              await Linking.openURL(appUrl);
              return;
            } catch {
              // If app URL fails, continue with regular URL
              console.log(`${appName} app not available, will try browser`);
            }
          }
        }
      }
    }

    // For Android, directly try to open the URL without canOpenURL check
    if (Platform.OS === 'android') {
      try {
        await Linking.openURL(normalizedUrl);
        return;
      } catch (error) {
        console.error('Failed to open URL:', error);
        Alert.alert(
          'Unable to open link',
          'Please make sure you have a web browser installed.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // iOS - use canOpenURL check
      const canOpen = await Linking.canOpenURL(normalizedUrl);
      
      if (canOpen) {
        await Linking.openURL(normalizedUrl);
      } else {
        Alert.alert(
          'Unable to open link',
          'This link cannot be opened on your device.',
          [{ text: 'OK' }]
        );
      }
    }
  } catch (error) {
    console.error('Error opening link:', error);
    Alert.alert(
      'Error', 
      'An error occurred while trying to open the link.\n\nURL: ' + url,
      [{ text: 'OK' }]
    );
  }
}