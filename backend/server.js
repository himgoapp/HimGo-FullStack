const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');

// Load environment variables from .env file
dotenv.config();

// --- Connect to MongoDB ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully! ✅');
    } catch (err) {
        console.error(`MongoDB connection failed: ${err.message}`);
        process.exit(1);
    }
};

// Execute DB connection
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// --- Routes ---
const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const rideRoutes = require('./routes/rideRoutes');
const earningsRoutes = require('./routes/earningsRoutes');
const walletRoutes = require('./routes/walletRoutes');

// API Health Check
app.get('/', (req, res) => {
    res.json({ message: 'HimGo Driver API is running! 🏔️', status: 'online' });
});

// Primary API Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/wallet', walletRoutes);

// --- Socket.io Real-time Features ---
const activeDrivers = {}; // { driverId: { socketId, location, isOnline } }
const rideRequests = {}; // { rideId: { passengerData, drivers } }

io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);

    // Driver comes online
    socket.on('driver-online', (data) => {
        const { driverId, location } = data;
        activeDrivers[driverId] = { socketId: socket.id, location, isOnline: true };
        console.log(`Driver ${driverId} is online`);
        
        // Broadcast driver status
        io.emit('driver-status-updated', { driverId, isOnline: true });
    });

    // Driver goes offline
    socket.on('driver-offline', (data) => {
        const { driverId } = data;
        if (activeDrivers[driverId]) {
            activeDrivers[driverId].isOnline = false;
            delete activeDrivers[driverId];
            io.emit('driver-status-updated', { driverId, isOnline: false });
            console.log(`Driver ${driverId} is offline`);
        }
    });

    // Update driver location
    socket.on('update-location', (data) => {
        const { driverId, latitude, longitude } = data;
        if (activeDrivers[driverId]) {
            activeDrivers[driverId].location = { latitude, longitude };
            // Broadcast to nearby drivers/passengers
            io.emit('driver-location-updated', { driverId, location: { latitude, longitude } });
        }
    });

    // New ride request broadcast
    socket.on('ride-request', (data) => {
        const { rideId, passengerLocation, destination, fare } = data;
        rideRequests[rideId] = data;
        
        // Broadcast to all online drivers
        io.emit('new-ride-request', {
            rideId,
            passengerLocation,
            destination,
            fare,
            timestamp: Date.now()
        });
    });

    // Driver accepts ride
    socket.on('ride-accepted', (data) => {
        const { rideId, driverId, driverLocation } = data;
        io.emit('ride-accepted-by-driver', {
            rideId,
            driverId,
            driverLocation,
            timestamp: Date.now()
        });
        delete rideRequests[rideId];
    });

    // Driver rejects ride
    socket.on('ride-rejected', (data) => {
        const { rideId, driverId } = data;
        console.log(`Driver ${driverId} rejected ride ${rideId}`);
        // Ride still available for other drivers
    });

    // Ride started
    socket.on('ride-started', (data) => {
        const { rideId, driverId } = data;
        io.emit('ride-in-progress', {
            rideId,
            driverId,
            timestamp: Date.now()
        });
    });

    // Ride completed
    socket.on('ride-completed', (data) => {
        const { rideId, driverId, fare, rating } = data;
        io.emit('ride-finished', {
            rideId,
            driverId,
            fare,
            rating,
            timestamp: Date.now()
        });
    });

    // Chat messages
    socket.on('send-message', (data) => {
        const { senderId, receiverId, message } = data;
        io.to(activeDrivers[receiverId]?.socketId).emit('receive-message', {
            senderId,
            message,
            timestamp: Date.now()
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        // Find and remove driver if offline
        for (let driverId in activeDrivers) {
            if (activeDrivers[driverId].socketId === socket.id) {
                delete activeDrivers[driverId];
            }
        }
    });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
    console.log(`Socket.io listening on port ${PORT} 🔌`);
});