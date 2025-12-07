const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// @route   GET /api/earnings/today
// @desc    Get today's earnings
// @access  Private
exports.getTodayEarnings = async (req, res, next) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const rides = await Ride.find({
            driver: req.driver._id,
            status: 'completed',
            rideEndedAt: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalEarnings = rides.reduce((sum, ride) => sum + ride.fare.driverEarnings, 0);
        const completedRides = rides.length;

        res.status(200).json({
            date: startOfDay.toISOString().split('T')[0],
            totalEarnings: Math.round(totalEarnings),
            completedRides,
            rides: rides.map(ride => ({
                id: ride._id,
                fare: ride.fare.totalAmount,
                earnings: ride.fare.driverEarnings,
                pickup: ride.pickupLocation.address,
                dropoff: ride.dropoffLocation.address,
                time: ride.rideEndedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching today earnings:', error);
        res.status(500).json({ message: 'Error fetching today earnings' });
    }
};

// @route   GET /api/earnings/week
// @desc    Get this week's earnings
// @access  Private
exports.getWeeklyEarnings = async (req, res, next) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const rides = await Ride.find({
            driver: req.driver._id,
            status: 'completed',
            rideEndedAt: { $gte: startOfWeek }
        });

        const earningsData = {};
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Initialize all days with 0
        days.forEach((day, index) => {
            earningsData[day] = 0;
        });

        // Calculate earnings per day
        rides.forEach(ride => {
            const rideDay = new Date(ride.rideEndedAt).getDay();
            const dayName = days[rideDay];
            earningsData[dayName] += ride.fare.driverEarnings;
        });

        const weeklyData = Object.entries(earningsData).map(([day, amount]) => ({
            day,
            amount: Math.round(amount)
        }));

        const totalWeekly = rides.reduce((sum, ride) => sum + ride.fare.driverEarnings, 0);

        res.status(200).json({
            totalEarnings: Math.round(totalWeekly),
            completedRides: rides.length,
            earningsData: weeklyData,
            weekStart: startOfWeek.toISOString().split('T')[0]
        });
    } catch (error) {
        console.error('Error fetching weekly earnings:', error);
        res.status(500).json({ message: 'Error fetching weekly earnings' });
    }
};

// @route   GET /api/earnings/month
// @desc    Get this month's earnings
// @access  Private
exports.getMonthlyEarnings = async (req, res, next) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const rides = await Ride.find({
            driver: req.driver._id,
            status: 'completed',
            rideEndedAt: { $gte: startOfMonth }
        });

        const totalEarnings = rides.reduce((sum, ride) => sum + ride.fare.driverEarnings, 0);
        const totalCommission = rides.reduce((sum, ride) => sum + ride.fare.commission, 0);

        res.status(200).json({
            month: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
            totalEarnings: Math.round(totalEarnings),
            totalCommission: Math.round(totalCommission),
            completedRides: rides.length,
            averagePerRide: rides.length > 0 ? Math.round(totalEarnings / rides.length) : 0
        });
    } catch (error) {
        console.error('Error fetching monthly earnings:', error);
        res.status(500).json({ message: 'Error fetching monthly earnings' });
    }
};

// @route   GET /api/earnings/transactions
// @desc    Get transaction history
// @access  Private
exports.getTransactionHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, type } = req.query;

        const wallet = await Wallet.findOne({ driver: req.driver._id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const query = { wallet: wallet._id };
        if (type) query.type = type;

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments(query);

        res.status(200).json({
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

// @route   GET /api/earnings/stats
// @desc    Get overall earnings statistics
// @access  Private
exports.getEarningsStats = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.driver._id);
        const wallet = await Wallet.findOne({ driver: req.driver._id });

        const allRides = await Ride.find({
            driver: req.driver._id,
            status: 'completed'
        });

        const totalEarnings = allRides.reduce((sum, ride) => sum + ride.fare.driverEarnings, 0);
        const averageRating = driver.rating || 0;

        res.status(200).json({
            totalEarnings: Math.round(totalEarnings),
            totalRides: driver.totalRides,
            averageRating: averageRating.toFixed(1),
            currentBalance: wallet ? Math.round(wallet.balance) : 0,
            totalEarningsAllTime: Math.round(driver.totalEarnings)
        });
    } catch (error) {
        console.error('Error fetching earnings stats:', error);
        res.status(500).json({ message: 'Error fetching earnings stats' });
    }
};

module.exports = exports;
