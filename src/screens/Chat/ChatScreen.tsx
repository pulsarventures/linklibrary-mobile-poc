import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';

import { IconByVariant } from '@/components/atoms';
import { SafeScreen } from '@/components/templates';
import { Text } from '@/components/ui';

export default function ChatScreen() {
  const { colors, isDark } = useTheme();

  const handleJoinWaitlist = () => {
    // Future: Open beta signup form or email
    console.log('Join waitlist pressed');
  };

  const styles = StyleSheet.create({
    comingSoon: {
      color: colors.accent.primary,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 16,
    },
    container: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    description: {
      color: colors.text.secondary,
      fontSize: 16,
      marginBottom: 8,
      paddingHorizontal: 32,
      textAlign: 'center',
    },
    featureIcon: {
      alignItems: 'center',
      backgroundColor: colors.accent.primary + '15',
      borderRadius: 16,
      height: 32,
      justifyContent: 'center',
      marginRight: 12,
      width: 32,
    },
    featureItem: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: 16,
    },
    featureList: {
      marginTop: 24,
      paddingHorizontal: 32,
      width: '100%',
    },
    featureText: {
      color: colors.text.secondary,
      flex: 1,
      fontSize: 15,
    },
    floatingButton: {
      alignItems: 'center',
      borderRadius: 28,
      bottom: 35,
      elevation: 8,
      height: 56,
      justifyContent: 'center',
      position: 'absolute',
      right: 20,
      shadowColor: '#000',
      shadowOffset: {
        height: 2,
        width: 0,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      width: 56,
    },
    iconContainer: {
      alignItems: 'center',
      backgroundColor: colors.accent.primary + '22',
      borderRadius: 40,
      height: 80,
      justifyContent: 'center',
      marginBottom: 24,
      width: 80,
    },
    title: {
      color: colors.text.primary,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 12,
      textAlign: 'center',
    },
  });

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <IconByVariant
            color={colors.accent.primary}
            name="message-circle"
            size={40}
          />
        </View>
        
        <Text style={styles.title}>Meet Linky</Text>
        <Text style={styles.description}>
          Your friendly AI companion for managing and discovering insights from your links
        </Text>
        
        <Text style={styles.comingSoon}>Coming Soon!</Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <IconByVariant color={colors.accent.primary} name="search" size={16} />
            </View>
            <Text style={styles.featureText}>
              Ask Linky to find specific links using natural language
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <IconByVariant color={colors.accent.primary} name="library" size={16} />
            </View>
            <Text style={styles.featureText}>
              Let Linky recommend content based on your interests
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <IconByVariant color={colors.accent.primary} name="tag" size={16} />
            </View>
            <Text style={styles.featureText}>
              Linky can auto-organize your links with smart tagging
            </Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
              <IconByVariant color={colors.accent.primary} name="fire" size={16} />
            </View>
            <Text style={styles.featureText}>
              Chat with Linky to get summaries and key insights
            </Text>
          </View>
        </View>
      </View>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleJoinWaitlist}
        style={[styles.floatingButton, { backgroundColor: isDark ? '#FF6B35' : '#F25D15' }]}
      >
        <IconByVariant
          color="#ffffff"
          name="bell"
          size={24}
        />
      </TouchableOpacity>
    </SafeScreen>
  );
}