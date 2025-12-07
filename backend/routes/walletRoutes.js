const express = require('express');
const {
    getWalletBalance,
    createTopupOrder,
    verifyPayment,
    requestPayout,
    getPayoutHistory,
    updateBankDetails
} = require('../controllers/walletController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All wallet routes require authentication
router.get('/balance', protect, getWalletBalance);
router.post('/topup', protect, createTopupOrder);
router.post('/verify-payment', protect, verifyPayment);
router.post('/request-payout', protect, requestPayout);
router.get('/payouts', protect, getPayoutHistory);
router.put('/bank-details', protect, updateBankDetails);

module.exports = router;
