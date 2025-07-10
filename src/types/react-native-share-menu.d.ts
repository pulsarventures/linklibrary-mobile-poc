declare module 'react-native-receive-sharing-intent' {
  interface SharedFile {
    weblink?: string;
    contentUri?: string;
    fileName?: string;
    filePath?: string;
    mimeType?: string;
    text?: string;
  }

  const ReceiveSharingIntent: {
    getReceivedFiles: (
      success: (files: SharedFile[]) => void,
      error: (error: any) => void
    ) => void;
    clearReceivedFiles: () => void;
  };

  export default ReceiveSharingIntent;
} 