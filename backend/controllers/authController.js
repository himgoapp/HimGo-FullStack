const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Utility to create a JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d',
    });
};

// @desc    Send OTP to user's mobile number
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOtp = async (req, res, next) => {
    const { phone } = req.body;

    if (!phone || phone.length !== 10) {
        return res.status(400).json({ message: 'Please provide a valid 10-digit phone number.' });
    }

    try {
        // Find user or create a new one
        let user = await User.findOne({ phone });

        if (!user) {
            user = await User.create({ phone });
        }

        // --- OTP Generation (Mocking SMS API) ---
        // For development, we use a fixed OTP (123456)
        const otpCode = '1234'; 
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

        user.otp = otpCode;
        user.otpExpires = otpExpires;
        await user.save({ validateBeforeSave: false }); // Bypass validation for otp fields

        // In a real app, integrate Twilio/Fast2SMS here to send otpCode to the 'phone' number.
        console.log(`[HIMGO] Development OTP for ${phone}: ${otpCode}`);

        res.status(200).json({
            status: 'success',
            message: 'OTP sent successfully (Development Mode: OTP is 123456).',
            // Send back a mock verification ID (useful for real SMS APIs)
            verificationId: crypto.randomBytes(16).toString('hex') 
        });

    } catch (error) {
        // Handle MongoDB duplicate key error if phone already exists
        if (error.code === 11000) {
            return res.status(400).json({ message: 'This phone number is already registered.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP and log in user
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res, next) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ message: 'Please provide phone number and OTP.' });
    }

    // 1. Find user, including the hidden OTP fields
    const user = await User.findOne({ phone }).select('+otp +otpExpires');

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // 2. Check if OTP matches and has not expired
    if (user.otp !== otp || user.otpExpires < Date.now()) {
        return res.status(401).json({ message: 'Invalid or expired OTP.' });
    }

    // 3. Verification successful: Clear OTP fields and set as verified
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    // 4. Create and send JWT Token
    const token = signToken(user._id);

    // Determine if user needs to complete profile setup (name and email are null)
    const needsProfileSetup = !user.name || !user.email;

    res.status(200).json({
        status: 'success',
        token,
        needsProfileSetup, // Frontend uses this to navigate to 'profile-setup' screen
        data: {
            user: {
                id: user._id,
                phone: user.phone,
                name: user.name,
                email: user.email,
            }
        },
    });
};

// @desc    Complete profile setup (name, email)
// @route   PUT /api/auth/profile-setup
// @access  Private (Requires JWT token)
exports.completeProfileSetup = async (req, res, next) => {
    // req.user is populated by the protect middleware (to be created later)
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Please provide name and email.' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user.id, 
            { name, email }, 
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Profile setup complete.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                }
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};