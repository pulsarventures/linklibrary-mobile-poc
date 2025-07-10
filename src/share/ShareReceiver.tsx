import React, { useEffect } from 'react';
import { Platform, Linking, AppState, Alert } from 'react-native';

interface ShareReceiverProps {
  onUrl: (url: string) => void;
}

const ShareReceiver: React.FC<ShareReceiverProps> = ({ onUrl }) => {
  useEffect(() => {
    console.log('📤 🚀 ShareReceiver starting initialization...');
    
    // Only initialize share receiver on platforms that support it
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      console.log('📤 Share receiver not supported on this platform');
      return;
    }

    let ReceiveSharingIntent: any = null;

    // Simplified approach focusing on the core issue
    const initializeShareReceiver = async () => {
      try {
        console.log('📤 Loading react-native-receive-sharing-intent...');
        ReceiveSharingIntent = (await import('react-native-receive-sharing-intent')).default;
        console.log('📤 ✅ Share receiver package loaded successfully');
        
        // Set up share handling
        setupShareHandling();
        
        // Also set up linking as backup
        setupLinkingFallback();
        
      } catch (error) {
        console.log('📤 ❌ Share receiver package failed to load:', error);
        // Try alternative approach using Linking
        setupLinkingFallback();
      }
    };

    const extractUrlFromContent = (content: any): string | null => {
      try {
        console.log('📤 🔍 Extracting URL from content:', JSON.stringify(content, null, 2));
        
        // Handle string content directly
        if (typeof content === 'string') {
          console.log('📤 Checking direct string:', content);
          if (content.startsWith('http')) {
            console.log('📤 ✅ Found direct URL string:', content);
            return content;
          }
          const urlMatch = content.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            console.log('📤 ✅ Found URL in string:', urlMatch[0]);
            return urlMatch[0];
          }
        }

        // Handle object with weblink
        if (content?.weblink && typeof content.weblink === 'string' && content.weblink.startsWith('http')) {
          console.log('📤 ✅ Found URL in weblink:', content.weblink);
          return content.weblink;
        }
        
        // Handle object with contentUri
        if (content?.contentUri && typeof content.contentUri === 'string' && content.contentUri.startsWith('http')) {
          console.log('📤 ✅ Found URL in contentUri:', content.contentUri);
          return content.contentUri;
        }

        // Handle object with text
        if (content?.text && typeof content.text === 'string') {
          console.log('📤 Checking text content:', content.text);
          const urlMatch = content.text.match(/https?:\/\/[^\s]+/);
          if (urlMatch) {
            console.log('📤 ✅ Found URL in text:', urlMatch[0]);
            return urlMatch[0];
          }
        }

        console.log('📤 ❌ No URL found in content');
        return null;
      } catch (error) {
        console.error('📤 Error extracting URL from content:', error);
        return null;
      }
    };

    const processSharedFiles = (files: any[]) => {
      try {
        console.log('📤 🔄 Processing shared files:', JSON.stringify(files, null, 2));
        
        if (Array.isArray(files) && files.length > 0) {
          for (const file of files) {
            const url = extractUrlFromContent(file);
            if (url) {
              console.log('📤 🎯 Successfully extracted URL:', url);
              
              // Show alert for debugging
              Alert.alert(
                'Share Detected!',
                `URL: ${url}`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open', onPress: () => onUrl(url) }
                ]
              );
              
              return; // Process only the first valid URL
            }
          }
          
          console.log('📤 ❌ No URL found in any shared content');
          Alert.alert('Share Debug', 'No URL found in shared content');
        } else {
          console.log('📤 ❌ No files received or files is not an array');
          Alert.alert('Share Debug', 'No files received');
        }
      } catch (error) {
        console.error('📤 Error processing shared files:', error);
        Alert.alert('Share Error', `Error: ${error}`);
      }
    };

    const setupShareHandling = () => {
      if (!ReceiveSharingIntent) {
        console.log('📤 Share receiver not available');
        return;
      }

      console.log('📤 🔧 Setting up share handling...');

      // Handle shared content when app is opened via share
      const handleInitialShare = () => {
        try {
          console.log('📤 🔍 Checking for initial share...');
          ReceiveSharingIntent.getReceivedFiles(
            (files: any[]) => {
              console.log('📤 📥 Initial share received, files:', files);
              if (files && files.length > 0) {
                processSharedFiles(files);
              } else {
                console.log('📤 No initial share files');
              }
            },
            (error: any) => {
              if (error && !error?.message?.includes('NullPointerException')) {
                console.error('📤 Initial share error:', error);
              } else {
                console.log('📤 No initial share content available (normal)');
              }
            }
          );
        } catch (error) {
          console.log('📤 Initial share check failed:', error);
        }
      };

      // Handle new shared content while app is running
      try {
        console.log('📤 🎧 Setting up new share listener...');
        ReceiveSharingIntent.getReceivedFiles(
          (files: any[]) => {
            console.log('📤 📥 New share received, files:', files);
            processSharedFiles(files);
          },
          (error: any) => {
            if (error && !error?.message?.includes('NullPointerException')) {
              console.error('📤 New share error:', error);
            }
          }
        );
      } catch (error) {
        console.log('📤 Share listener setup failed:', error);
      }

      // Check for initial share immediately
      handleInitialShare();
      
      // Also check with delays
      setTimeout(() => {
        console.log('📤 🔍 Delayed initial share check (1s)...');
        handleInitialShare();
      }, 1000);
      
      setTimeout(() => {
        console.log('📤 🔍 Delayed initial share check (3s)...');
        handleInitialShare();
      }, 3000);
    };

    // Fallback using Linking API for deep links
    const setupLinkingFallback = () => {
      console.log('📤 🔧 Setting up Linking fallback...');
      
      const handleUrl = (url: string) => {
        console.log('📤 📥 Received URL via Linking:', url);
        if (url && url.startsWith('http')) {
          Alert.alert(
            'Link Detected!',
            `URL: ${url}`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open', onPress: () => onUrl(url) }
            ]
          );
        }
      };

      // Handle initial URL
      Linking.getInitialURL().then((url) => {
        if (url) {
          console.log('📤 📥 Initial URL from Linking:', url);
          handleUrl(url);
        }
      }).catch((error) => {
        console.log('📤 No initial URL from Linking:', error);
      });

      // Handle URLs while app is running
      const linkingListener = Linking.addEventListener('url', ({ url }) => {
        console.log('📤 📥 New URL from Linking:', url);
        handleUrl(url);
      });

      return () => {
        linkingListener?.remove();
      };
    };

    // Monitor app state changes
    const handleAppStateChange = (nextAppState: string) => {
      console.log('📤 App state changed to:', nextAppState);
      if (nextAppState === 'active') {
        console.log('📤 🔍 App became active, checking for shares...');
        setTimeout(() => {
          if (ReceiveSharingIntent) {
            try {
              ReceiveSharingIntent.getReceivedFiles(
                (files: any[]) => {
                  if (files && files.length > 0) {
                    console.log('📤 📥 Share found on app activation:', files);
                    processSharedFiles(files);
                  }
                },
                (error: any) => {
                  // Ignore errors on app state check
                }
              );
            } catch (error) {
              // Ignore errors
            }
          }
        }, 500);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Initialize the share receiver
    initializeShareReceiver();

    // Cleanup function
    return () => {
      appStateSubscription?.remove();
      try {
        ReceiveSharingIntent?.clearReceivedFiles?.();
      } catch (error) {
        console.log('📤 Final cleanup failed:', error);
      }
    };
  }, [onUrl]);

  return null;
};

export default ShareReceiver; 