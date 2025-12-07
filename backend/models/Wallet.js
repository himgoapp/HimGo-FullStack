const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', WalletSchema);
