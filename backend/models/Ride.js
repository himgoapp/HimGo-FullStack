const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    passengerName: { type: String, default: null },
    passengerPhone: { type: String, default: null },
    pickup: { type: String, required: true },
    dropoff: { type: String, required: true },
    distance: { type: String, default: null },
    fare: { type: Number, default: 0 },
    status: { type: String, enum: ['requested','accepted','started','completed','cancelled'], default: 'requested' }
}, { timestamps: true });

module.exports = mongoose.model('Ride', RideSchema);
