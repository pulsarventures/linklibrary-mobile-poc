import AsyncStorage from '@react-native-async-storage/async-storage';

let logoutFlag: boolean | null = null;

export const checkLogoutFlag = async (): Promise<boolean> => {
  // Cache the flag for this session
  if (logoutFlag !== null) {
    return logoutFlag;
  }
  
  const flag = await AsyncStorage.getItem('@has_logged_out');
  logoutFlag = flag === 'true';
  
  if (logoutFlag) {
    console.log('🚫🚫🚫 LOGOUT GUARD ACTIVE - ALL AUTH BLOCKED');
  }
  
  return logoutFlag;
};

export const setLogoutFlag = async (): Promise<void> => {
  await AsyncStorage.setItem('@has_logged_out', 'true');
  logoutFlag = true;
  console.log('🔒 Logout flag set in guard');
};

export const clearLogoutFlag = async (): Promise<void> => {
  await AsyncStorage.removeItem('@has_logged_out');
  logoutFlag = false;
  console.log('🔓 Logout flag cleared in guard');
};