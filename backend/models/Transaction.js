const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true
    },
    type: {
        type: String,
        enum: ['ride_earning', 'wallet_topup', 'withdrawal', 'commission', 'refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: String,
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride'
    },
    paymentGateway: {
        type: String,
        enum: ['razorpay', 'bank_transfer', 'manual'],
        default: 'razorpay'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    balanceBefore: Number,
    balanceAfter: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
