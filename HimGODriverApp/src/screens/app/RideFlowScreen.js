import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RideFlowScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rides Screen</Text>
      <Text style={styles.subtitle}>Active rides and history will appear here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default RideFlowScreen;
