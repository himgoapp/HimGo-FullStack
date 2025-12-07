import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:5000/api'; // Change to your backend URL

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('userToken');
      // Navigate to login (handled by app state)
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  sendOTP: (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone, otp, name, email) =>
    api.post('/auth/verify-otp', { phone, otp, name, email }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  checkKYC: () => api.get('/auth/check-kyc'),
};

// KYC APIs
export const kycAPI = {
  uploadDocument: (formData) =>
    api.post('/kyc/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getKYCStatus: () => api.get('/kyc/status'),
};

// Ride APIs
export const rideAPI = {
  requestRide: (rideData) => api.post('/rides/request', rideData),
  acceptRide: (rideId) => api.post(`/rides/${rideId}/accept`),
  startRide: (rideId) => api.post(`/rides/${rideId}/start`),
  endRide: (rideId) => api.post(`/rides/${rideId}/end`),
  cancelRide: (rideId, reason) =>
    api.post(`/rides/${rideId}/cancel`, { reason }),
  getRideDetails: (rideId) => api.get(`/rides/${rideId}`),
  getHistory: (page = 1, limit = 10, status) =>
    api.get(`/rides/driver/history`, {
      params: { page, limit, status },
    }),
  rateRide: (rideId, rating, review) =>
    api.post(`/rides/${rideId}/rate`, { rating, review }),
};

// Earnings APIs
export const earningsAPI = {
  getTodayEarnings: () => api.get('/earnings/today'),
  getWeeklyEarnings: () => api.get('/earnings/week'),
  getMonthlyEarnings: () => api.get('/earnings/month'),
  getTransactions: (page = 1, limit = 20, type) =>
    api.get('/earnings/transactions', { params: { page, limit, type } }),
  getStats: () => api.get('/earnings/stats'),
};

// Wallet APIs
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  createTopupOrder: (amount) => api.post('/wallet/topup', { amount }),
  verifyPayment: (razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    api.post('/wallet/verify-payment', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }),
  requestPayout: (amount) => api.post('/wallet/request-payout', { amount }),
  getPayouts: () => api.get('/wallet/payouts'),
  updateBankDetails: (bankDetails) =>
    api.put('/wallet/bank-details', bankDetails),
};

export default api;
