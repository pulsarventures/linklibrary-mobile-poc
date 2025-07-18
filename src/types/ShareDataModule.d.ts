declare module 'react-native' {
  type NativeModulesStatic = {
    ShareDataModule: {
      getSharedData(): Promise<{
        data: string;
        type: 'text' | 'url';
      }>;
    };
  }
} 