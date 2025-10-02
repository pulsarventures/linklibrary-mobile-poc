import React, { useEffect } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';

type ShareReceiverProps = {
  readonly onUrl: (url: string) => void;
}

const ShareReceiver: React.FC<ShareReceiverProps> = ({ onUrl }) => {
  useEffect(() => {
    
    // Only initialize share receiver on platforms that support it
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return;
    }

    let ReceiveSharingIntent: any = null;

    // Simplified approach focusing on the core issue
    const initializeShareReceiver = async () => {
      try {
        ReceiveSharingIntent = (await import('react-native-receive-sharing-intent')).default;
        
        // Set up share handling
        setupShareHandling();
        
        // Also set up linking as backup
        setupLinkingFallback();
        
      } catch {
        // Try alternative approach using Linking
        setupLinkingFallback();
      }
    };

    const extractUrlFromContent = (content: any): null | string => {
      try {
        
        // Handle string content directly
        if (typeof content === 'string') {
          if (content.startsWith('http')) {
            return content;
          }
          const urlMatch = /https?:\/\/\S+/.exec(content);
          if (urlMatch) {
            return urlMatch[0];
          }
        }

        // Handle object with weblink
        if (content?.weblink && typeof content.weblink === 'string' && content.weblink.startsWith('http')) {
          return content.weblink;
        }
        
        // Handle object with contentUri
        if (content?.contentUri && typeof content.contentUri === 'string' && content.contentUri.startsWith('http')) {
          return content.contentUri;
        }

        // Handle object with text
        if (content?.text && typeof content.text === 'string') {
          const urlMatch = content.text.match(/https?:\/\/\S+/);
          if (urlMatch) {
            return urlMatch[0];
          }
        }

        return null;
      } catch (error) {
        console.error('📤 Error extracting URL from content:', error);
        return null;
      }
    };

    const processSharedFiles = (files: any[]) => {
      try {
        
        if (Array.isArray(files) && files.length > 0) {
          for (const file of files) {
            const url = extractUrlFromContent(file);
            if (url) {
              
              // Process URL directly without alert
              onUrl(url);
              
              return; // Process only the first valid URL
            }
          }
          
          // No URL found - silently ignore
        } else {
          // No files received - silently ignore
        }
      } catch (error) {
        console.error('📤 Error processing shared files:', error);
        console.error('Share Error:', error);
      }
    };

    const setupShareHandling = () => {
      if (!ReceiveSharingIntent) {
        return;
      }


      // Handle shared content when app is opened via share
      const handleInitialShare = () => {
        try {
          ReceiveSharingIntent.getReceivedFiles(
            (files: any[]) => {
              if (files && files.length > 0) {
                processSharedFiles(files);
              } else {
              }
            },
            (error: any) => {
              if (error && !error?.message?.includes('NullPointerException')) {
                console.error('📤 Initial share error:', error);
              } else {
              }
            }
          );
        } catch {
        }
      };

      // Handle new shared content while app is running
      try {
        ReceiveSharingIntent.getReceivedFiles(
          (files: any[]) => {
            processSharedFiles(files);
          },
          (error: any) => {
            if (error && !error?.message?.includes('NullPointerException')) {
              console.error('📤 New share error:', error);
            }
          }
        );
      } catch {
      }

      // Check for initial share immediately
      handleInitialShare();
      
      // Also check with delays
      setTimeout(() => {
        handleInitialShare();
      }, 1000);
      
      setTimeout(() => {
        handleInitialShare();
      }, 3000);
    };

    // Fallback using Linking API for deep links
    const setupLinkingFallback = () => {
      
      const handleUrl = (url: string) => {
        if (url && url.startsWith('http')) {
          // Process URL directly without alert
          onUrl(url);
        }
      };

      // Handle initial URL
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleUrl(url);
        }
      }).catch((error) => {
      });

      // Handle URLs while app is running
      const linkingListener = Linking.addEventListener('url', ({ url }) => {
        handleUrl(url);
      });

      return () => {
        linkingListener.remove();
      };
    };

    // Monitor app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        setTimeout(() => {
          if (ReceiveSharingIntent) {
            try {
              ReceiveSharingIntent.getReceivedFiles(
                (files: any[]) => {
                  if (files && files.length > 0) {
                    processSharedFiles(files);
                  }
                },
                (error: any) => {
                  // Ignore errors on app state check
                }
              );
            } catch {
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
      appStateSubscription.remove();
      try {
        ReceiveSharingIntent?.clearReceivedFiles?.();
      } catch {
      }
    };
  }, [onUrl]);

  return null;
};

export default ShareReceiver; 