const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    plateNumber: {
        type: String,
        required: true,
        unique: true
    },
    make: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    color: String,
    registrationNumber: String,
    insuranceExpiryDate: Date,
    registrationCertificate: String,
    insuranceCertificate: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
