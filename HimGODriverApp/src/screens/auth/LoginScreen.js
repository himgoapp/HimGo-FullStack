import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendOTP } = useAuth();

  const handleSendOTP = async () => {
    if (!phone || phone.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone',
        text2: 'Please enter a valid 10-digit phone number',
      });
      return;
    }

    setLoading(true);
    try {
      await sendOTP(phone);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Check your SMS for the OTP code',
      });
      navigation.navigate('OTP', { phone });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to send OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('KYC');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🚗</Text>
          <Text style={styles.title}>Welcome Back Driver!</Text>
          <Text style={styles.subtitle}>Enter your mobile number to continue</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputGroup}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Text>
            <Text style={styles.buttonIcon}>✈️</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New driver? </Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.footerLink}>Register Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  countryCode: {
    width: 80,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#e6f7f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#00914e',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00914e',
  },
});

export default LoginScreen;
