import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { earningsAPI } from '../../services/api';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { isConnected, goOnline, goOffline } = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState({ today: 0, rides: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await earningsAPI.getTodayEarnings();
      setEarnings({
        today: response.data.totalEarnings,
        rides: response.data.completedRides,
      });
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = () => {
    if (isOnline) {
      goOffline();
    } else {
      goOnline({ latitude: 0, longitude: 0 });
    }
    setIsOnline(!isOnline);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Text style={styles.greeting}>👋 Hello {user?.name}</Text>
          <Text style={styles.subtitle}>Rating: ⭐ {user?.rating || 5.0}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusInfo}>
          <Text style={styles.statusLabel}>You are</Text>
          <Text style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.statusToggle,
            isOnline && styles.statusToggleActive
          ]}
          onPress={toggleOnlineStatus}
        >
          <Text style={styles.toggleIcon}>{isOnline ? '🟢' : '⭕'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.earningsSection}>
        <Text style={styles.sectionTitle}>Today's Earnings</Text>
        <View style={styles.earningsGrid}>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsAmount}>₹{earnings.today}</Text>
            <Text style={styles.earningsLabel}>Total Earned</Text>
          </View>
          <View style={styles.earningsCard}>
            <Text style={styles.earningsAmount}>{earnings.rides}</Text>
            <Text style={styles.earningsLabel}>Rides</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionText}>View Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📞</Text>
          <Text style={styles.actionText}>Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ffe6e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 20,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#00914e',
    borderRadius: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statusToggle: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusToggleActive: {
    backgroundColor: 'white',
  },
  toggleIcon: {
    fontSize: 24,
  },
  earningsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: '#00914e',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default DashboardScreen;
