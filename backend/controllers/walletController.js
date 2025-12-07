const Driver = require('../models/Driver');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Razorpay = require('razorpay');

// Initialize Razorpay (lazy initialization with default values)
let razorpay = null;

const getRazorpayInstance = () => {
    if (!razorpay) {
        const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890123';
        const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_1234567890123';
        razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret
        });
    }
    return razorpay;
};

// @route   GET /api/wallet/balance
// @desc    Get wallet balance
// @access  Private
exports.getWalletBalance = async (req, res, next) => {
    try {
        const wallet = await Wallet.findOne({ driver: req.driver._id });

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.status(200).json({
            balance: Math.round(wallet.balance),
            totalEarnings: Math.round(wallet.totalEarnings),
            totalWithdrawn: Math.round(wallet.totalWithdrawn)
        });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ message: 'Error fetching wallet balance' });
    }
};

// @route   POST /api/wallet/topup
// @desc    Create Razorpay order for wallet topup
// @access  Private
exports.createTopupOrder = async (req, res, next) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        const { amount } = req.body;

        if (!amount || amount < 100) {
            return res.status(400).json({ message: 'Minimum topup amount is ₹100' });
        }

        if (amount > 100000) {
            return res.status(400).json({ message: 'Maximum topup amount is ₹100,000' });
        }

        // Create Razorpay order
        const order = await razorpayInstance.orders.create({
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `topup_${req.driver._id}_${Date.now()}`,
            notes: {
                driverId: req.driver._id,
                type: 'wallet_topup'
            }
        });

        res.status(201).json({
            orderId: order.id,
            amount: order.amount / 100,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Error creating payment order' });
    }
};

// @route   POST /api/wallet/verify-payment
// @desc    Verify Razorpay payment and add to wallet
// @access  Private
exports.verifyPayment = async (req, res, next) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        const crypto = require('crypto');

        // Verify signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_1234567890123');
        hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
        const generated_signature = hmac.digest('hex');

        if (generated_signature !== razorpaySignature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Fetch payment details
        const payment = await razorpayInstance.payments.fetch(razorpayPaymentId);

        if (payment.status !== 'captured') {
            return res.status(400).json({ message: 'Payment not captured' });
        }

        // Get wallet
        const wallet = await Wallet.findOne({ driver: req.driver._id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const amount = payment.amount / 100; // Convert from paise

        // Update wallet
        wallet.balance += amount;
        await wallet.save();

        // Create transaction record
        const transaction = new Transaction({
            driver: req.driver._id,
            wallet: wallet._id,
            type: 'wallet_topup',
            amount: amount,
            paymentGateway: 'razorpay',
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
            status: 'success',
            balanceBefore: wallet.balance - amount,
            balanceAfter: wallet.balance,
            description: `Wallet topup of ₹${amount}`
        });
        await transaction.save();

        res.status(200).json({
            message: 'Payment verified and wallet updated',
            balance: Math.round(wallet.balance),
            transactionId: transaction._id
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};

// @route   POST /api/wallet/request-payout
// @desc    Request payout from wallet
// @access  Private
exports.requestPayout = async (req, res, next) => {
    try {
        const { amount } = req.body;

        const wallet = await Wallet.findOne({ driver: req.driver._id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (amount < 500) {
            return res.status(400).json({ message: 'Minimum payout amount is ₹500' });
        }

        if (amount > wallet.balance) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        const driver = await Driver.findById(req.driver._id);
        if (!driver.bankDetails || !driver.bankDetails.accountNumber) {
            return res.status(400).json({ message: 'Bank details not configured. Please update your profile.' });
        }

        // Create payout transaction (pending)
        const transaction = new Transaction({
            driver: req.driver._id,
            wallet: wallet._id,
            type: 'withdrawal',
            amount: amount,
            paymentGateway: 'bank_transfer',
            status: 'pending',
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance - amount,
            description: `Payout request to ${driver.bankDetails.bankName}`
        });
        await transaction.save();

        // Deduct from wallet
        wallet.balance -= amount;
        wallet.totalWithdrawn += amount;
        await wallet.save();

        res.status(201).json({
            message: 'Payout request created successfully',
            transactionId: transaction._id,
            amount: amount,
            status: 'pending',
            processingTime: '1-2 business days'
        });
    } catch (error) {
        console.error('Error requesting payout:', error);
        res.status(500).json({ message: 'Error requesting payout' });
    }
};

// @route   GET /api/wallet/payouts
// @desc    Get payout history
// @access  Private
exports.getPayoutHistory = async (req, res, next) => {
    try {
        const wallet = await Wallet.findOne({ driver: req.driver._id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const payouts = await Transaction.find({
            wallet: wallet._id,
            type: 'withdrawal'
        }).sort({ createdAt: -1 });

        res.status(200).json({
            payouts: payouts.map(payout => ({
                id: payout._id,
                amount: Math.round(payout.amount),
                status: payout.status,
                date: payout.createdAt,
                description: payout.description
            }))
        });
    } catch (error) {
        console.error('Error fetching payout history:', error);
        res.status(500).json({ message: 'Error fetching payout history' });
    }
};

// @route   PUT /api/wallet/bank-details
// @desc    Update or add bank details
// @access  Private
exports.updateBankDetails = async (req, res, next) => {
    try {
        const { accountNumber, ifscCode, holderName, bankName } = req.body;

        if (!accountNumber || !ifscCode || !holderName || !bankName) {
            return res.status(400).json({ message: 'All bank details are required' });
        }

        // Validate IFSC code format (Indian IFSC: 4 letters + 0 + 6 digits/letters)
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
            return res.status(400).json({ message: 'Invalid IFSC code format' });
        }

        const driver = await Driver.findByIdAndUpdate(
            req.driver._id,
            {
                bankDetails: {
                    accountNumber,
                    ifscCode,
                    holderName,
                    bankName
                }
            },
            { new: true }
        );

        res.status(200).json({
            message: 'Bank details updated successfully',
            bankDetails: driver.bankDetails
        });
    } catch (error) {
        console.error('Error updating bank details:', error);
        res.status(500).json({ message: 'Error updating bank details' });
    }
};

module.exports = exports;
