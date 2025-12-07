const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created','paid','failed'], default: 'created' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
