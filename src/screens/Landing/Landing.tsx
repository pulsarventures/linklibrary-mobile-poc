import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import type { RootScreenProps } from '@/navigation/types';
import { Paths } from '@/navigation/paths';

function Landing({ navigation }: RootScreenProps<Paths.Landing>) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>Link Library</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={styles.title}>
            Organize Your{'\n'}
            Digital Life
          </Text>
          <Text style={styles.titleHighlight}>with Link Library</Text>
          
          <Text style={styles.subtitle}>
            Save, organize, and rediscover your favorite web content when you need it most.
          </Text>

          {/* Illustration */}
          <View style={styles.illustration}>
            <View style={styles.mockupContainer}>
              <View style={styles.mockupContent}>
                <View style={styles.addIcon}>
                  <Text style={styles.plusIcon}>+</Text>
                </View>
                <View style={styles.mockupLines}>
                  <View style={styles.line} />
                  <View style={styles.line} />
                  <View style={styles.line} />
                </View>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>            
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate(Paths.Login)}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1C',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleHighlight: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
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
    backgroundColor: '#2C2C2C',
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
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    color: '#FFFFFF',
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
    backgroundColor: '#3D3D3D',
    borderRadius: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Landing; 