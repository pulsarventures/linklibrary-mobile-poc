import type { RootStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider/ThemeProvider';

import { Button, Container } from '@/components/ui';

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
            <Button 
              onPress={() => { navigation.navigate('Login'); }}
              variant="primary"
              style={styles.loginButton}
            >
              Sign In
            </Button>
          </View>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  addIcon: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  buttonContainer: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustration: {
    aspectRatio: 1.2,
    marginBottom: 40,
    width: '100%',
  },
  line: {
    borderRadius: 4,
    height: 8,
  },
  loginButton: {
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logo: {
    fontSize: 24,
    fontWeight: '600',
  },
  mainContent: {
    alignItems: 'center',
    flex: 1,
  },
  mockupContainer: {
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  mockupContent: {
    alignItems: 'center',
    gap: 24,
  },
  mockupLines: {
    gap: 12,
    width: '100%',
  },
  plusIcon: {
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
    textAlign: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleHighlight: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
}); 