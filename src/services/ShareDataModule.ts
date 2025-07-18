import { NativeModules } from 'react-native';

export const ShareDataModule = {
  getSharedData: (): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        if (NativeModules.AppGroupsModule) {
          console.log('📤 ShareDataModule: Native module found, calling getSharedContent');
          NativeModules.AppGroupsModule.getSharedContent()
            .then((data: any) => {
              console.log('📤 ShareDataModule: Received data:', data);
              resolve(data);
            })
            .catch((error: any) => {
              console.log('📤 ShareDataModule: Error getting shared data:', error);
              reject(error);
            });
        } else {
          console.log('📤 ShareDataModule: Native module not found');
          resolve(null);
        }
      } catch (error) {
        console.log('📤 ShareDataModule: Exception calling native module:', error);
        resolve(null);
      }
    });
  }
}; 