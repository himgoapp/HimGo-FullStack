const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

// --- Middlewares ---
app.use(express.json()); // Body parser for application/json

// --- Routes ---
const authRoutes = require('./routes/authRoutes');

// API Health Check
app.get('/', (req, res) => {
    res.send('HimGo API is running! 🏔️');
});

// Primary API Routes
app.use('/api/auth', authRoutes);


// --- Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));