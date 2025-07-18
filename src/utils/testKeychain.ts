import * as Keychain from 'react-native-keychain';

export const testKeychain = async () => {
  console.log('🔐 Testing Keychain availability...');
  
  try {
    // Test 1: Check if module is loaded
    console.log('🔐 Keychain module loaded:', !!Keychain);
    console.log('🔐 Keychain module keys:', Object.keys(Keychain));
    
    // Test 2: Check if basic methods exist
    console.log('🔐 setGenericPassword exists:', typeof Keychain.setGenericPassword === 'function');
    console.log('🔐 getGenericPassword exists:', typeof Keychain.getGenericPassword === 'function');
    console.log('🔐 resetGenericPassword exists:', typeof Keychain.resetGenericPassword === 'function');
    
    // Test 3: Try to check supported biometry (this might fail on simulator)
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      console.log('🔐 Supported biometry:', biometryType);
    } catch (biometryError) {
      console.log('🔐 Biometry check failed (normal on simulator):', biometryError);
    }
    
    // Test 4: Try to set a test value
    try {
      await Keychain.setGenericPassword('test_key', 'test_value', {
        service: 'test_service',
      });
      console.log('🔐 Test value set successfully');
      
      // Test 5: Try to get the test value
      const credentials = await Keychain.getGenericPassword({
        service: 'test_service',
      });
      console.log('🔐 Test value retrieved:', credentials && typeof credentials === 'object' ? credentials.password : 'not found');
      
      // Test 6: Clean up test value
      await Keychain.resetGenericPassword({
        service: 'test_service',
      });
      console.log('🔐 Test value cleaned up');
      
      console.log('🔐 ✅ Keychain is working properly!');
      return true;
    } catch (operationError) {
      console.error('🔐 ❌ Keychain operations failed:', operationError);
      return false;
    }
  } catch (error) {
    console.error('🔐 ❌ Keychain test failed:', error);
    return false;
  }
}; 