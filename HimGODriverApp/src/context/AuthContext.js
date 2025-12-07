import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendOTP = useCallback(async (phone) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/send-otp', { phone });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error sending OTP';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (phone, otp, name, email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/verify-otp', {
        phone,
        otp,
        name,
        email
      });
      const { token, driver } = response.data;
      
      setToken(token);
      setUser(driver);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(driver));
      
      return driver;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error verifying OTP';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProfile = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.driver);
      return response.data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.driver);
      return response.data.driver;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    sendOTP,
    verifyOTP,
    getProfile,
    updateProfile,
    logout,
    isSignedIn: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
