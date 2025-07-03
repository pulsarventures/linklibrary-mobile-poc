import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { useTheme } from '../../theme';
import { Text as CustomText } from '../../components/text';
import { Button } from '../../components/button';
import CheckIcon from '../../assets/images/check.svg';
import AddIcon from '../../assets/images/add.svg';

const NavItem = ({ title }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.navItem}>
      <CustomText style={[styles.navText, { color: colors.text }]}>{title}</CustomText>
    </TouchableOpacity>
  );
};

const Landing = ({ navigation }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1C1C1C',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logo: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '600',
      marginRight: 32,
    },
    navContainer: {
      flexDirection: 'row',
      gap: 24,
    },
    navItem: {
      paddingVertical: 8,
    },
    navText: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.8,
    },
    headerButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    loginButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    signUpButton: {
      backgroundColor: '#FFFFFF',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    mainSection: {
      flex: 1,
      flexDirection: 'row',
      paddingTop: 80,
    },
    leftContent: {
      flex: 1,
      paddingRight: 40,
    },
    rightContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 8,
      lineHeight: 56,
    },
    titleHighlight: {
      color: '#3B82F6',
    },
    subtitle: {
      fontSize: 18,
      color: '#FFFFFF',
      opacity: 0.8,
      marginBottom: 32,
      lineHeight: 28,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    startButton: {
      backgroundColor: '#FFFFFF',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    signInButton: {
      borderColor: '#FFFFFF',
      borderWidth: 1,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    whiteText: {
      color: '#FFFFFF',
    },
    blackText: {
      color: '#000000',
    },
    noCardText: {
      color: '#10B981',
      fontSize: 14,
      flexDirection: 'row',
      alignItems: 'center',
    },
    mockupContainer: {
      backgroundColor: '#1F2937',
      borderRadius: 12,
      padding: 20,
      width: '100%',
      aspectRatio: 1.2,
      position: 'relative',
    },
    checkIcon: {
      width: 16,
      height: 16,
      marginRight: 8,
      tintColor: '#10B981',
    },
    mockupTopBar: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: '#3B82F6',
      height: 4,
      width: '100%',
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    },
    mockupContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addIcon: {
      width: 48,
      height: 48,
      marginBottom: 16,
      tintColor: '#3B82F6',
    },
    mockupLines: {
      width: '100%',
      height: 8,
      backgroundColor: '#374151',
      marginVertical: 4,
      borderRadius: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <CustomText style={styles.logo}>Link Library</CustomText>
          <View style={styles.navContainer}>
            <NavItem title="Features" />
            <NavItem title="How It Works" />
            <NavItem title="Pricing" />
            <NavItem title="FAQ" />
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <CustomText style={[styles.buttonText, styles.whiteText]}>Login</CustomText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <CustomText style={[styles.buttonText, styles.blackText]}>Sign Up</CustomText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.mainSection}>
          {/* Left Content */}
          <View style={styles.leftContent}>
            <CustomText style={styles.title}>
              Organize Your Digital Life{'\n'}
              <CustomText style={styles.titleHighlight}>with Link Library</CustomText>
            </CustomText>
            <CustomText style={styles.subtitle}>
              Link Library intelligently saves, organizes, and resurfaces your favorite web content when you need it most.
            </CustomText>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => navigation.navigate('SignUp')}
              >
                <CustomText style={[styles.buttonText, styles.blackText]}>Start for Free</CustomText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.signInButton}
                onPress={() => navigation.navigate('Login')}
              >
                <CustomText style={[styles.buttonText, styles.whiteText]}>Sign In</CustomText>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckIcon width={16} height={16} style={styles.checkIcon} />
              <CustomText style={styles.noCardText}>No credit card required</CustomText>
            </View>
          </View>

          {/* Right Content */}
          <View style={styles.rightContent}>
            <View style={styles.mockupContainer}>
              <View style={styles.mockupTopBar} />
              <View style={styles.mockupContent}>
                <AddIcon width={48} height={48} style={styles.addIcon} />
                <View style={{ width: '80%' }}>
                  <View style={styles.mockupLines} />
                  <View style={styles.mockupLines} />
                  <View style={styles.mockupLines} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Landing; 