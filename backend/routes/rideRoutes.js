const express = require('express');
const {
    requestRide,
    acceptRide,
    startRide,
    endRide,
    cancelRide,
    getRideDetails,
    getDriverRideHistory,
    rateRide
} = require('../controllers/rideController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public route for ride requests
router.post('/request', requestRide);

// Private routes for driver
router.post('/:rideId/accept', protect, acceptRide);
router.post('/:rideId/start', protect, startRide);
router.post('/:rideId/end', protect, endRide);
router.post('/:rideId/cancel', protect, cancelRide);
router.get('/:rideId', getRideDetails);
router.get('/driver/history', protect, getDriverRideHistory);
router.post('/:rideId/rate', protect, rateRide);

module.exports = router;
