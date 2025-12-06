const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        
        // 3. Find user by ID from the decoded token payload
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User belonging to this token no longer exists.' });
        }

        // 4. Attach user object to request
        req.user = user;
        next();
    } catch (error) {
        // Handle common JWT errors (e.g., expired token)
        res.status(401).json({ message: 'Not authorized, token failed or expired.' });
    }
};