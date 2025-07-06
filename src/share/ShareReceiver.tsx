import React, { useEffect } from 'react';
import ShareMenu from 'react-native-share-menu';

interface ShareReceiverProps {
  onUrl: (url: string) => void;
}

const ShareReceiver: React.FC<ShareReceiverProps> = ({ onUrl }) => {
  useEffect(() => {
    const handleShare = (item: any) => {
      if (item && item.data) {
        // If multiple items, pick the first URL
        const url = Array.isArray(item.data) ? item.data[0] : item.data;
        if (typeof url === 'string' && url.startsWith('http')) {
          onUrl(url);
        }
      }
    };
    ShareMenu.getInitialShare(handleShare);
    const listener = ShareMenu.addNewShareListener(handleShare);
    return () => listener.remove();
  }, [onUrl]);
  return null;
};

export default ShareReceiver; 