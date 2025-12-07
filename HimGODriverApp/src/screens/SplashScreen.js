import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

const SplashScreen = () => {
  const { isSignedIn } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🏔️</Text>
        <Text style={styles.appName}>HimGo Driver</Text>
        <Text style={styles.tagline}>Drive. Earn. Grow.</Text>
      </View>
      <ActivityIndicator size="large" color="#00914e" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00914e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#e6f7f0',
    fontWeight: '500',
  },
  loader: {
    marginTop: 30,
  },
});

export default SplashScreen;
