import User from '../models/User.js';
import AccessRequest from '../models/AccessRequest.js';

// @desc    Get all registration requests
// @route   GET /api/admin/requests
export const getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const requests = await AccessRequest.find(filter)
            .populate('userId', 'name email department designation role status permissions createdAt')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a registration request and set role + permissions
// @route   PATCH /api/admin/requests/:id/approve
export const approveRequest = async (req, res) => {
    try {
        const { role, permissions } = req.body;
        const request = await AccessRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const user = await User.findById(request.userId);
        if (!user) {
            return res.status(404).json({ message: 'User associated with request not found' });
        }

        // Update user
        user.status = 'approved';
        if (role) user.role = role;
        if (permissions) {
            user.permissions = {
                projects: Boolean(permissions.projects),
                sales: Boolean(permissions.sales),
            };
        }
        await user.save();

        // Update request
        request.status = 'approved';
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        await request.save();

        res.json({
            success: true,
            message: `Employee ${user.name} approved successfully with role ${user.role}`,
            user,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a registration request
// @route   PATCH /api/admin/requests/:id/reject
export const rejectRequest = async (req, res) => {
    try {
        const request = await AccessRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const user = await User.findById(request.userId);
        if (user) {
            user.status = 'rejected';
            await user.save();
        }

        request.status = 'rejected';
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        await request.save();

        res.json({
            success: true,
            message: 'Registration request rejected',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all employees with search & filtering
// @route   GET /api/admin/users
export const getUsers = async (req, res) => {
    try {
        const { search, role, status, department } = req.query;
        const query = { role: { $ne: 'Admin' } }; // Exclude admin from employee list or keep all

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        if (role) query.role = role;
        if (status) query.status = status;
        if (department) query.department = department;

        const users = await User.find(query).sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update employee role
// @route   PATCH /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['Admin', 'Developer', 'Sales'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ success: true, message: `Role updated to ${role}`, data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update independent section permissions
// @route   PATCH /api/admin/users/:id/permissions
export const updateUserPermissions = async (req, res) => {
    try {
        const { projects, sales } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (typeof projects === 'boolean') user.permissions.projects = projects;
        if (typeof sales === 'boolean') user.permissions.sales = sales;

        await user.save();

        res.json({
            success: true,
            message: 'Permissions updated successfully',
            data: user,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update employee account status (activate/suspend)
// @route   PATCH /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ success: true, message: `Status updated to ${status}`, data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard statistics for admin
// @route   GET /api/admin/dashboard/stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalEmployees = await User.countDocuments({ role: { $ne: 'Admin' } });
        const pendingRequests = await AccessRequest.countDocuments({ status: 'pending' });
        const activeEmployees = await User.countDocuments({ status: 'approved', role: { $ne: 'Admin' } });
        const developers = await User.countDocuments({ role: 'Developer', status: 'approved' });
        const salesEmployees = await User.countDocuments({ role: 'Sales', status: 'approved' });

        // Recent 5 registration requests
        const recentRequests = await AccessRequest.find({ status: 'pending' })
            .populate('userId', 'name email department createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalEmployees,
                pendingRequests,
                activeEmployees,
                developers,
                salesEmployees,
                recentRequests,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};