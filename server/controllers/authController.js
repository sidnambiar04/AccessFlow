import User from '../models/User.js';
import AccessRequest from '../models/AccessRequest.js';
import { generateToken } from '../utils/jwt.js';

// @desc    Register a new employee
// @route   POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, department, designation } = req.body;

        // Validation
        if (!name || !email || !password || !department) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        // Create user (strictly pending, cannot self-assign role or permissions)
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            department,
            designation: designation || '',
            role: 'Developer', // Default placeholder; will be assigned by admin
            status: 'pending',
            permissions: {
                projects: false,
                sales: false,
            },
        });

        // Create associated AccessRequest for Admin review
        await AccessRequest.create({
            userId: user._id,
            status: 'pending',
        });

        res.status(201).json({
            success: true,
            message: 'Registration submitted successfully. Your account is awaiting administrator approval.',
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
};

// @desc    Authenticate employee / admin & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        // Find user by email and explicitly include password
        const user = await User.findOne({ email: cleanEmail }).select('+password');

        console.log(`[AUTH] Login attempt for: "${cleanEmail}"`);
        if (!user) {
            console.log(`[AUTH] No user found with email: "${cleanEmail}"`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(cleanPassword);
        console.log(`[AUTH] Password match for "${cleanEmail}": ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Status checks
        if (user.status === 'pending') {
            return res.status(403).json({
                status: 'pending',
                message: 'Your account is pending administrator approval. Please check back later.',
            });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({
                status: 'rejected',
                message: 'Your registration request has been rejected by the administrator.',
            });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({
                status: 'suspended',
                message: 'Your account has been deactivated/suspended. Please contact HR or IT.',
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department,
                designation: user.designation,
                role: user.role,
                status: user.status,
                permissions: user.permissions,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            department: req.user.department,
            designation: req.user.designation,
            role: req.user.role,
            status: req.user.status,
            permissions: req.user.permissions,
        },
    });
};