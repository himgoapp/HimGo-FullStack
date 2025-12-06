const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 10,
        maxlength: 10,
    },
    // Profile Setup fields
    name: {
        type: String,
        default: null,
        trim: true,
    },
    email: {
        type: String,
        default: null,
        trim: true,
        unique: true,
        sparse: true, // Allows null values but enforces uniqueness when a value exists
    },
    profilePicture: {
        type: String,
        default: 'default.png',
    },
    // OTP fields (temporary storage for verification)
    otp: {
        type: String,
        select: false, // OTP should never be returned in queries
    },
    otpExpires: {
        type: Date,
        select: false,
    },
    // Authentication status
    isVerified: {
        type: Boolean,
        default: false,
    },
    // User type (future use)
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);