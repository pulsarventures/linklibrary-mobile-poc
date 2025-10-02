import { ApiDebugUtils } from '@/utils/apiDebug';
import { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/types';
import { useCallback } from 'react';

import { useAuthStore } from '@/hooks/domain/user/useAuthStore';
import { useTheme } from '@/theme';
import { authApiService } from '@/services/auth-api.service';
import { storageService } from '@/services/storage';

import { IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';

export default function Settings() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout, deleteAccount, user, isAuthenticated } = useAuthStore();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  // Fetch user data when screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        // Check if we already have user data in the store
        const currentUser = useAuthStore.getState().user;
        if (currentUser && currentUser.id) {
          console.log('✅ Settings - Using existing user data from store');
          return;
        }
        
        console.log('🔍 Settings - No user data in store, fetching from /users/me...');
        
        try {
          // Just make the request without any custom timeout
          // The API client handles timeouts and retries
          const userData = await authApiService.me();
          console.log('📦 Settings - User data received:', JSON.stringify(userData, null, 2));
          
          if (userData && userData.id) {
            console.log('👤 Settings - Updating store with user data');
            useAuthStore.setState({ user: userData });
          } else {
            console.log('⚠️ Settings - No valid user data received');
          }
        } catch (error) {
          console.error('❌ Settings - Error fetching user:', error);
          
          // If it's an auth error, the API client will handle token refresh
          // and the auth interceptor will redirect to login if needed
          if (error?.message?.includes('Authentication required')) {
            console.log('🔐 Settings - User needs to re-authenticate');
          }
        }
      };
      
      // Check authentication state and only fetch user data if authenticated
      const authState = useAuthStore.getState();
      console.log('🔍 Settings - Auth state:', { isAuthenticated: authState.isAuthenticated, initialized: authState.initialized });
      
      if (authState.isAuthenticated) {
        console.log('🔄 Settings - Authenticated, fetching user data...');
        setIsLoadingUser(true);
        fetchUserData().finally(() => {
          setIsLoadingUser(false);
        });
      } else {
        console.log('🚫 Settings - Not authenticated, skipping user data fetch');
        // Make sure loading state is false when not authenticated
        setIsLoadingUser(false);
      }
    }, [])
  );
  
  // Debug logging
  console.log('Settings - User data:', user);
  console.log('Settings - User verified status:', user?.is_verified);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { style: 'cancel', text: 'Cancel' },
        { 
          onPress: logout, 
          style: 'destructive', 
          text: 'Logout' 
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAccount();
      // The deleteAccount function will set isAuthenticated to false
      // which will automatically navigate to Login screen
      // No manual navigation needed due to conditional navigation in Application.tsx
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to delete account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeleteConfirmText('');
    }
  };

  const handleRefreshUserData = async () => {
    setIsLoadingUser(true);
    try {
      console.log('🔄 Settings - Manual refresh of user data...');
      
      // Check current auth state
      const { isAuthenticated, user: currentUser } = useAuthStore.getState();
      console.log('🔍 Settings - Current auth state:', { isAuthenticated, hasUser: !!currentUser });
      
      // Check if we have valid tokens (only for debugging)
      const accessToken = await storageService.getAccessToken();
      const refreshToken = await storageService.getRefreshToken();
      console.log('🔍 Settings - Token state:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken
      });
      
      // Only initialize auth if not already authenticated
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated) {
        await useAuthStore.getState().initializeAuth();
      }
      
      // Then try to fetch user data
      const userData = await authApiService.me();
      if (userData && userData.id) {
        useAuthStore.setState({ user: userData });
        console.log('✅ Settings - User data refreshed successfully');
      }
    } catch (error) {
      console.error('❌ Settings - Failed to refresh user data:', error);
      
      // Show more detailed error information
      let errorMessage = 'Failed to refresh user data. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoadingUser(false);
    }
  };


  return (
    <SafeScreen>
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Settings</Text>
        
        {/* User Profile Section */}
        <View style={[styles.userSection, { backgroundColor: colors.background.secondary, borderColor: colors.border.primary }]}>
          <View style={styles.userAvatar}>
            <IconByVariant 
              color={colors.text.secondary} 
              name="user" 
              size={24}
            />
          </View>
          <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text.primary }]}>
          {isLoadingUser ? 'Loading...' : (user?.full_name || user?.email?.split('@')[0] || (isAuthenticated ? 'Authenticated User' : 'Not logged in'))}
        </Text>
        <Text style={[styles.userEmail, { color: colors.text.secondary }]}>
          {isLoadingUser ? 'Fetching user data...' : (user?.email || (isAuthenticated ? 'Tap refresh to load user data' : 'Please log in to view profile'))}
        </Text>
            <TouchableOpacity onPress={handleRefreshUserData} style={styles.refreshButton}>
              <IconByVariant 
                color={colors.text.secondary} 
                name="settings" 
                size={16}
              />
            </TouchableOpacity>
            {user && !user.is_verified && (
              <View style={styles.verificationBadge}>
                <IconByVariant 
                  color="#FFC107" 
                  name="bell" 
                  size={14}
                />
                <Text style={[styles.verificationText, { color: '#FFC107' }]}>
                  Unverified
                </Text>
              </View>
            )}
            {user && user.is_verified && (
              <View style={styles.verificationBadge}>
                <IconByVariant 
                  color={colors.success || '#4CAF50'} 
                  name="check" 
                  size={14}
                />
                <Text style={[styles.verificationText, { color: colors.success || '#4CAF50' }]}>
                  Verified
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Theme Toggle */}
        <View style={[styles.settingItem, { borderBottomColor: colors.border.primary }]}>
          <View style={styles.settingContent}>
            <IconByVariant 
              color={colors.text.primary} 
              name={isDark ? "moon" : "sun"} 
              size={24}
              style={styles.settingIcon}
            />
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, { color: colors.text.primary }]}>
                Theme
              </Text>
              <Text style={[styles.settingDescription, { color: colors.text.secondary }]}>
                {isDark ? 'Dark mode' : 'Light mode'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.toggleButton,
              { 
                backgroundColor: isDark ? colors.accent.primary : colors.background.secondary,
                borderColor: colors.border.primary 
              }
            ]}
          >
            <View style={[
              styles.toggleIndicator,
              {
                backgroundColor: isDark ? colors.background.primary : colors.accent.primary,
                transform: [{ translateX: isDark ? 20 : 0 }]
              }
            ]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.button, styles.logoutButton]}
        >
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>
            Logout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDeleteDialog(true)}
          style={[styles.button, styles.deleteAccountButton]}
        >
          <Text style={[styles.buttonText, { color: '#ffffff' }]}>
            Delete Account
          </Text>
        </TouchableOpacity>

        {/* Delete Account Confirmation Modal */}
        <Modal
          visible={showDeleteDialog}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowDeleteDialog(false);
            setDeleteConfirmText('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Delete Account
              </Text>
              
              <Text style={[styles.modalDescription, { color: colors.text.secondary }]}>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </Text>
              
              <Text style={[styles.modalLabel, { color: colors.text.primary }]}>
                Please type "DELETE" to confirm:
              </Text>
              
              <TextInput
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="Type DELETE to confirm"
                placeholderTextColor={colors.text.tertiary}
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.background.secondary,
                    borderColor: colors.border.primary,
                    color: colors.text.primary,
                  }
                ]}
                autoCapitalize="characters"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setShowDeleteDialog(false);
                    setDeleteConfirmText('');
                  }}
                  style={[styles.modalButton, { backgroundColor: colors.background.secondary }]}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text.primary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  style={[
                    styles.modalButton,
                    styles.deleteButton,
                    (deleteConfirmText !== 'DELETE' || isDeleting) && styles.disabledButton
                  ]}
                >
                  <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    gap: 20,
    padding: 20,
  },
  deleteAccountButton: {
    backgroundColor: '#ff0000',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#ff0000',
  },
  disabledButton: {
    opacity: 0.5,
  },
  logoutButton: {
    backgroundColor: '#F25D15',
    borderColor: '#F25D15',
    borderWidth: 1,
    marginTop: 'auto',
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    padding: 14,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '90%',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  modalInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginTop: 8,
    padding: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingItem: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  toggleButton: {
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
    width: 52,
  },
  toggleIndicator: {
    borderRadius: 14,
    height: 28,
    position: 'absolute',
    width: 28,
  },
  userAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
  },
  refreshButton: {
    padding: 4,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  userAvatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    marginRight: 12,
    width: 50,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userSection: {
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
  },
  verificationBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});