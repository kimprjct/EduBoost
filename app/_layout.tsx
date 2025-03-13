import React, { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeModal from '../components/WelcomeModal';
import { colors, typography, spacing, borderRadius, layout } from './theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const WELCOME_SHOWN_KEY = 'welcome_shown';

const AnimatedLogo = ({ logoHeight }) => (
  <View style={styles.logoContainer}>
    <Image 
      source={require('../assets/images/logoWB.png')}
      style={[styles.logo, { height: logoHeight, width: logoHeight * (240 / 70) }]} // Adjust width based on height
      resizeMode="contain"
    />
  </View>
);

export default function AppLayout() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(80); // Default header height

  useEffect(() => {
    // You can dynamically calculate the header height if needed
    // For simplicity, we're using the default value here
    setHeaderHeight(80);
  }, []);

  const logoHeight = headerHeight * 0.875; // 87.5% of the header height

  useEffect(() => {
    const initApp = async () => {
      try {
        setIsLoading(true);
        const welcomeShown = await AsyncStorage.getItem(WELCOME_SHOWN_KEY);
        setShowWelcome(!welcomeShown);
      } catch (error) {
        console.error('Error loading app:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const handleWelcomeClose = async () => {
    try {
      await AsyncStorage.setItem(WELCOME_SHOWN_KEY, 'true');
      setShowWelcome(false);
    } catch (error) {
      console.error('Error saving welcome state:', error);
      setShowWelcome(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#151530', '#1C1C3D']} style={StyleSheet.absoluteFill} />

      {/* Header - Visible on Both Web & Mobile */}
      <View style={styles.header}>
        <View style={{ justifyContent: 'center', height: '100%' }}>
          <AnimatedLogo logoHeight={logoHeight} />
        </View>
      </View>

      {/* Page Content */}
      <View style={styles.content}>
        <Slot />
      </View>

      {/* Navigation Bar - Visible on Both Web & Mobile */}
      <View style={styles.navbar}>
        <TouchableOpacity style={[styles.navButton, layout.glowEffect]} onPress={() => router.push('/')}>
          <MaterialIcons name="home" size={24} color={colors.primary} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, layout.glowEffect]} onPress={() => router.push('/materials')}>
          <MaterialIcons name="library-books" size={24} color={colors.secondary} />
          <Text style={styles.navText}>Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, layout.glowEffect]} onPress={() => router.push('/goals')}>
          <MaterialIcons name="flag" size={24} color={colors.accent} />
          <Text style={styles.navText}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, layout.glowEffect]} onPress={() => router.push('/progress')}>
          <MaterialIcons name="trending-up" size={24} color={colors.success} />
          <Text style={styles.navText}>Progress</Text>
        </TouchableOpacity>
      </View>

      <WelcomeModal visible={showWelcome} onClose={handleWelcomeClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1F', // Slightly lighter dark blue
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151530', // Slightly lighter dark blue
  },
  loadingText: {
    fontSize: typography.sizes.lg,
    color: colors.text.accent,
    ...layout.glowEffect,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.light,
    height: 80,
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'flex-start', // Align to the left
    alignItems: 'center', // Keep vertical centering
    padding: spacing.sm,
  },
  logoContainer: {
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
  },
  logo: {
    // Remove width and height here
  },
  content: {
    flex: 1,
    overflow: 'auto',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  navButton: {
    alignItems: 'center',
    padding: spacing.sm,
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  navText: {
    fontSize: typography.sizes.xs,
    color: colors.text.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
