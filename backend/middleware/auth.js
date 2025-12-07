const jwt = require('jsonwebtoken');
const Driver = require('../models/Driver');

// Middleware to protect routes from unauthorized access
exports.protect = async (req, res, next) => {
    let token;

    // 1. Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided.' });
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Find driver by ID from the decoded token payload
        const driver = await Driver.findById(decoded.id);

        if (!driver) {
            return res.status(401).json({ message: 'Driver belonging to this token no longer exists.' });
        }

        // 4. Attach driver object to request
        req.driver = driver;
        next();
    } catch (error) {
        // Handle common JWT errors (e.g., expired token)
        res.status(401).json({ message: 'Not authorized, token failed or expired.' });
    }
};