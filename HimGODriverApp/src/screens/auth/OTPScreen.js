import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';

const OTPScreen = ({ navigation, route }) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNameEmail, setShowNameEmail] = useState(false);
  const { verifyOTP } = useAuth();

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'OTP must be 4 digits',
      });
      return;
    }

    if (!showNameEmail) {
      // First verify OTP, then show name/email form
      setShowNameEmail(true);
      return;
    }

    if (!name.trim() || !email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Info',
        text2: 'Please enter name and email',
      });
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(phone, otp, name, email);
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome to HimGo!',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Verification failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.logo}>🛡️</Text>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>Code sent to +91 {phone}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Enter OTP</Text>
          <View style={styles.otpContainer}>
            {[0, 1, 2, 3].map((index) => (
              <TextInput
                key={index}
                style={styles.otpInput}
                placeholder="0"
                keyboardType="number-pad"
                maxLength={1}
                value={otp[index] || ''}
                onChangeText={(text) => {
                  if (text.length <= 1 && /^[0-9]*$/.test(text)) {
                    setOtp(otp.slice(0, index) + text + otp.slice(index + 1));
                  }
                }}
              />
            ))}
          </View>

          {showNameEmail && (
            <View style={styles.extraFields}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />

              <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Verifying...' : showNameEmail ? 'Complete Registration' : 'Next'}
            </Text>
            <Text style={styles.buttonIcon}>✓</Text>
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
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  backIcon: {
    fontSize: 20,
    color: '#333',
  },
  header: {
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
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  extraFields: {
    marginBottom: 24,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4facfe',
    paddingVertical: 16,
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
});

export default OTPScreen;
