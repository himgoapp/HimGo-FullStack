const express = require('express');
const {
    getTodayEarnings,
    getWeeklyEarnings,
    getMonthlyEarnings,
    getTransactionHistory,
    getEarningsStats
} = require('../controllers/earningsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All earnings routes require authentication
router.get('/today', protect, getTodayEarnings);
router.get('/week', protect, getWeeklyEarnings);
router.get('/month', protect, getMonthlyEarnings);
router.get('/transactions', protect, getTransactionHistory);
router.get('/stats', protect, getEarningsStats);

module.exports = router;
