const Driver = require('../models/Driver');
const Wallet = require('../models/Wallet');
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');

// Temporary OTP storage (use Redis in production)
const otpStore = {};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Send OTP via SMS (mock implementation)
const sendOTP = (phone, otp) => {
    console.log(`[SMS Service] OTP for ${phone}: ${otp}`);
    otpStore[phone] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP to phone number
// @access  Public
exports.sendOTP = async (req, res, next) => {
    const { phone } = req.body;

    if (!phone || !/^[0-9]{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Please provide a valid 10-digit phone number.' });
    }

    try {
        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Send OTP (mock implementation)
        sendOTP(phone, otp);

        res.status(200).json({
            message: 'OTP sent successfully',
            phone,
            otp // For testing only; remove in production
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
};

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and create/login driver
// @access  Public
exports.verifyOTP = async (req, res, next) => {
    try {
        const { phone, otp, name, email } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ message: 'Phone and OTP required' });
        }

        // Verify OTP
        const storedOTP = otpStore[phone];
        if (!storedOTP || storedOTP.otp !== otp || storedOTP.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP after successful verification
        delete otpStore[phone];

        // Find or create driver
        let driver = await Driver.findOne({ phone });

        if (!driver) {
            // New driver registration
            if (!name) {
                return res.status(400).json({ message: 'Name required for new driver' });
            }

            driver = new Driver({
                phone,
                name,
                email
            });

            await driver.save();

            // Create wallet for new driver
            const wallet = new Wallet({
                driver: driver._id,
                balance: 0
            });
            await wallet.save();
        }

        // Generate JWT token
        const token = generateToken(driver._id);

        res.status(200).json({
            message: 'Login successful',
            token,
            driver: {
                id: driver._id,
                phone: driver.phone,
                name: driver.name,
                email: driver.email,
                kycStatus: driver.kycStatus,
                profilePhoto: driver.profilePhoto,
                rating: driver.rating
            }
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
};

// @route   GET /api/auth/profile
// @desc    Get current driver profile
// @access  Private
exports.getProfile = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.driver._id)
            .populate('vehicle');

        const wallet = await Wallet.findOne({ driver: req.driver._id });

        res.status(200).json({
            driver,
            walletBalance: wallet ? wallet.balance : 0
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// @route   PUT /api/auth/profile
// @desc    Update driver profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email, profilePhoto, bankDetails } = req.body;

        const driver = await Driver.findByIdAndUpdate(
            req.driver._id,
            {
                name: name || req.driver.name,
                email: email || req.driver.email,
                profilePhoto: profilePhoto || req.driver.profilePhoto,
                bankDetails: bankDetails || req.driver.bankDetails,
                updatedAt: Date.now()
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Profile updated successfully',
            driver
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// @route   GET /api/auth/check-kyc
// @desc    Check KYC status of driver
// @access  Private
exports.checkKYCStatus = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.driver._id).select('kycStatus documents');

        res.status(200).json({
            kycStatus: driver.kycStatus,
            documents: driver.documents,
            isComplete: driver.documents.license && driver.documents.registration && 
                       driver.documents.insurance && driver.documents.photo
        });
    } catch (error) {
        console.error('Error checking KYC:', error);
        res.status(500).json({ message: 'Error checking KYC status' });
    }
};

module.exports = exports;
