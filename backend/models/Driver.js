const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DriverSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true,
        match: /^[0-9]{10}$/
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        sparse: true
    },
    profilePhoto: {
        type: String,
        default: null
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    rating: {
        type: Number,
        default: 5,
        min: 0,
        max: 5
    },
    totalRides: {
        type: Number,
        default: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    kycStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    documents: {
        license: { url: String, verified: Boolean },
        registration: { url: String, verified: Boolean },
        insurance: { url: String, verified: Boolean },
        photo: { url: String, verified: Boolean }
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        holderName: String,
        bankName: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create geospatial index for location queries
DriverSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Driver', DriverSchema);
