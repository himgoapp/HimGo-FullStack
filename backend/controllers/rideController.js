const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// Constants
const BASE_RATE = 10; // ₹10 per km
const COMMISSION_RATE = 0.20; // 20% commission

// Calculate fare based on distance
const calculateFare = (distance) => {
    const baseAmount = distance * BASE_RATE;
    const commission = Math.round(baseAmount * COMMISSION_RATE);
    const driverEarnings = baseAmount - commission;
    
    return {
        baseAmount,
        commission,
        driverEarnings,
        totalAmount: baseAmount
    };
};

// @route   POST /api/rides/request
// @desc    Create a new ride request
// @access  Public (Passenger)
exports.requestRide = async (req, res, next) => {
    try {
        const { passenger, pickupLocation, dropoffLocation, distance, isRoundTrip, returnDate } = req.body;

        if (!passenger || !pickupLocation || !dropoffLocation || !distance) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const fare = calculateFare(distance);

        const ride = new Ride({
            passenger,
            pickupLocation,
            dropoffLocation,
            distance,
            fare,
            isRoundTrip,
            returnDate,
            status: 'requested'
        });

        await ride.save();

        res.status(201).json({
            message: 'Ride requested successfully',
            ride
        });
    } catch (error) {
        console.error('Error requesting ride:', error);
        res.status(500).json({ message: 'Error requesting ride' });
    }
};

// @route   POST /api/rides/:id/accept
// @desc    Accept a ride as driver
// @access  Private
exports.acceptRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findByIdAndUpdate(
            rideId,
            {
                driver: req.driver._id,
                status: 'accepted'
            },
            { new: true }
        );

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        res.status(200).json({
            message: 'Ride accepted successfully',
            ride
        });
    } catch (error) {
        console.error('Error accepting ride:', error);
        res.status(500).json({ message: 'Error accepting ride' });
    }
};

// @route   POST /api/rides/:id/start
// @desc    Start an accepted ride
// @access  Private
exports.startRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findByIdAndUpdate(
            rideId,
            {
                status: 'ongoing',
                rideStartedAt: Date.now()
            },
            { new: true }
        );

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        res.status(200).json({
            message: 'Ride started successfully',
            ride
        });
    } catch (error) {
        console.error('Error starting ride:', error);
        res.status(500).json({ message: 'Error starting ride' });
    }
};

// @route   POST /api/rides/:id/end
// @desc    End an ongoing ride
// @access  Private
exports.endRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findByIdAndUpdate(
            rideId,
            {
                status: 'completed',
                rideEndedAt: Date.now()
            },
            { new: true }
        );

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Add earnings to driver's wallet
        const wallet = await Wallet.findOne({ driver: req.driver._id });
        const driverEarnings = ride.fare.driverEarnings;

        if (wallet) {
            wallet.balance += driverEarnings;
            wallet.totalEarnings += driverEarnings;
            await wallet.save();

            // Create transaction record
            const transaction = new Transaction({
                driver: req.driver._id,
                wallet: wallet._id,
                type: 'ride_earning',
                amount: driverEarnings,
                description: `Earning from ride ${rideId}`,
                ride: rideId,
                status: 'success',
                balanceBefore: wallet.balance - driverEarnings,
                balanceAfter: wallet.balance
            });
            await transaction.save();
        }

        // Update driver stats
        await Driver.findByIdAndUpdate(
            req.driver._id,
            {
                $inc: { totalRides: 1, totalEarnings: driverEarnings }
            }
        );

        res.status(200).json({
            message: 'Ride completed successfully',
            ride,
            earnings: driverEarnings,
            commission: ride.fare.commission
        });
    } catch (error) {
        console.error('Error ending ride:', error);
        res.status(500).json({ message: 'Error ending ride' });
    }
};

// @route   POST /api/rides/:id/cancel
// @desc    Cancel a ride
// @access  Private
exports.cancelRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const { reason } = req.body;

        const ride = await Ride.findByIdAndUpdate(
            rideId,
            { status: 'cancelled' },
            { new: true }
        );

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        res.status(200).json({
            message: 'Ride cancelled successfully',
            ride
        });
    } catch (error) {
        console.error('Error cancelling ride:', error);
        res.status(500).json({ message: 'Error cancelling ride' });
    }
};

// @route   GET /api/rides/:id
// @desc    Get ride details
// @access  Private
exports.getRideDetails = async (req, res, next) => {
    try {
        const { rideId } = req.params;

        const ride = await Ride.findById(rideId).populate('driver');

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        res.status(200).json(ride);
    } catch (error) {
        console.error('Error fetching ride:', error);
        res.status(500).json({ message: 'Error fetching ride' });
    }
};

// @route   GET /api/rides/driver/history
// @desc    Get driver's ride history
// @access  Private
exports.getDriverRideHistory = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const query = { driver: req.driver._id };
        if (status) query.status = status;

        const rides = await Ride.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Ride.countDocuments(query);

        res.status(200).json({
            rides,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching ride history:', error);
        res.status(500).json({ message: 'Error fetching ride history' });
    }
};

// @route   POST /api/rides/:id/rate
// @desc    Rate a ride (driver rates passenger)
// @access  Private
exports.rateRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;
        const { rating, review } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const ride = await Ride.findByIdAndUpdate(
            rideId,
            {
                driverRating: { rating, review: review || '' }
            },
            { new: true }
        );

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        res.status(200).json({
            message: 'Ride rated successfully',
            ride
        });
    } catch (error) {
        console.error('Error rating ride:', error);
        res.status(500).json({ message: 'Error rating ride' });
    }
};

module.exports = exports;
