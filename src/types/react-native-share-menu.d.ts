declare module 'react-native-share-menu' {
  const ShareMenu: {
    getInitialShare: (callback: (item: any) => void) => void;
    addNewShareListener: (callback: (item: any) => void) => { remove: () => void };
  };
  export default ShareMenu;
} 