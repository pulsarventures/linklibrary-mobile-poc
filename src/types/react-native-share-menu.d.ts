declare module 'react-native-receive-sharing-intent' {
  type SharedFile = {
    contentUri?: string;
    fileName?: string;
    filePath?: string;
    mimeType?: string;
    text?: string;
    weblink?: string;
  }

  const ReceiveSharingIntent: {
    clearReceivedFiles: () => void;
    getReceivedFiles: (
      success: (files: SharedFile[]) => void,
      error: (error: any) => void
    ) => void;
  };

  export default ReceiveSharingIntent;
} 