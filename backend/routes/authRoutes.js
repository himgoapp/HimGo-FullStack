const express = require('express');
const { sendOTP, verifyOTP, getProfile, updateProfile, checkKYCStatus } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes for login flow
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// Private routes for authenticated drivers
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/check-kyc', protect, checkKYCStatus);

module.exports = router;
