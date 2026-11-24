import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Verify token & fetch fresh user from database
export const authenticate = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user fresh from database (without password)
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User belonging to this token no longer exists' });
        }

        // Check account status
        if (user.status === 'suspended') {
            return res.status(403).json({ message: 'Account is suspended. Please contact your administrator.' });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ message: 'Registration request was rejected.' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Account is pending administrator approval.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token verification failed' });
    }
};

// 2. Require Admin Role
export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied: Administrator privileges required' });
};

// 3. Require Section Permission (projects or sales) with expiry validation
export const requirePermission = (permission) => {
    return (req, res, next) => {
        // Admin always has full access
        if (req.user.role === 'Admin') {
            return next();
        }

        const isPermitted = req.user.permissions?.[permission];
        const expiryDate = req.user.permissionExpiry?.[permission];

        // Check if permission is turned off OR if time-bound access has expired
        if (!isPermitted || (expiryDate && new Date(expiryDate) < new Date())) {
            return res.status(403).json({
                message: `Access denied: Your permission to access ${permission} has expired or has not been granted.`,
            });
        }

        next();
    };
};