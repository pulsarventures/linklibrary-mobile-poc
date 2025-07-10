import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';
import { Container } from '@/components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function Landing({ navigation }: Props) {
  const { colors, isDark } = useTheme();

  return (
    <Container>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: colors.text.primary }]}>Link Library</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Organize Your{'\n'}
            Digital Life
          </Text>
          <Text style={[styles.titleHighlight, { color: colors.accent.primary }]}>with Link Library</Text>
          
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Save, organize, and rediscover your favorite web content when you need it most.
          </Text>

          {/* Illustration */}
          <View style={styles.illustration}>
            <View style={[styles.mockupContainer, { backgroundColor: colors.background.secondary }]}>
              <View style={styles.mockupContent}>
                <View style={[styles.addIcon, { backgroundColor: colors.accent.primary }]}>
                  <Text style={[styles.plusIcon, { color: colors.text.inverse }]}>+</Text>
                </View>
                <View style={styles.mockupLines}>
                  <View style={[styles.line, { backgroundColor: colors.border.primary }]} />
                  <View style={[styles.line, { backgroundColor: colors.border.primary }]} />
                  <View style={[styles.line, { backgroundColor: colors.border.primary }]} />
                </View>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>            
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: colors.accent.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.loginButtonText, { color: colors.text.inverse }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleHighlight: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  illustration: {
    width: '100%',
    aspectRatio: 1.2,
    marginBottom: 40,
  },
  mockupContainer: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
  },
  mockupContent: {
    alignItems: 'center',
    gap: 24,
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  mockupLines: {
    width: '100%',
    gap: 12,
  },
  line: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 