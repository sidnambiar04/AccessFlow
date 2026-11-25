import User from '../models/User.js';
import AccessRequest from '../models/AccessRequest.js';
import Resource from '../models/Resource.js';
import { logAudit, notifyUser } from '../utils/systemEvents.js';

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
        const { role, permissions, permissionExpiry } = req.body;
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

        if (permissionExpiry) {
            user.permissionExpiry = {
                projects: permissionExpiry.projects ? new Date(permissionExpiry.projects) : null,
                sales: permissionExpiry.sales ? new Date(permissionExpiry.sales) : null,
            };
        }
        await user.save();

        // Update request
        request.status = 'approved';
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        await request.save();

        // Audit Log & Notification
        await logAudit(req, {
            action: 'ONBOARDING_APPROVED',
            target: { userId: user._id, name: user.name, email: user.email },
            details: { assignedRole: user.role, permissions: user.permissions },
        });

        await notifyUser({
            recipientId: user._id,
            title: 'Account Approved!',
            message: `Welcome to AccessFlow! Your account has been approved with role ${user.role}.`,
            type: 'access_granted',
            link: '/dashboard',
        });

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

        if (user) {
            await logAudit(req, {
                action: 'ONBOARDING_REJECTED',
                target: { userId: user._id, name: user.name, email: user.email },
            });
        }

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

        await logAudit(req, {
            action: 'ROLE_UPDATED',
            target: { userId: user._id, name: user.name, email: user.email },
            details: { newRole: role },
        });

        await notifyUser({
            recipientId: user._id,
            title: 'Role Updated',
            message: `Your company access role has been updated to ${role}.`,
            type: 'system',
            link: '/profile',
        });

        res.json({ success: true, message: `Role updated to ${role}`, data: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update independent section permissions
// @route   PATCH /api/admin/users/:id/permissions
// @desc    Update independent section permissions & optional expiry dates
// @route   PATCH /api/admin/users/:id/permissions
export const updateUserPermissions = async (req, res) => {
    try {
        const { projects, sales, projectsExpiry, salesExpiry } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (typeof projects === 'boolean') {
            user.permissions.projects = projects;
            // If turning off, clear the expiry
            if (!projects) user.permissionExpiry.projects = null;
        }
        if (typeof sales === 'boolean') {
            user.permissions.sales = sales;
            // If turning off, clear the expiry
            if (!sales) user.permissionExpiry.sales = null;
        }

        // Set or update expiry dates if provided (null means permanent)
        if (projectsExpiry !== undefined) {
            user.permissionExpiry.projects = projectsExpiry ? new Date(projectsExpiry) : null;
        }
        if (salesExpiry !== undefined) {
            user.permissionExpiry.sales = salesExpiry ? new Date(salesExpiry) : null;
        }

        await user.save();

        await logAudit(req, {
            action: 'PERMISSIONS_UPDATED',
            target: { userId: user._id, name: user.name, email: user.email },
            details: {
                permissions: user.permissions,
                permissionExpiry: user.permissionExpiry,
            },
        });

        await notifyUser({
            recipientId: user._id,
            title: 'Permissions Changed',
            message: 'An administrator updated your section access permissions.',
            type: 'access_granted',
            link: '/dashboard',
        });

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

        await logAudit(req, {
            action: 'USER_STATUS_UPDATED',
            target: { userId: user._id, name: user.name, email: user.email },
            details: { newStatus: status },
        });

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

// @desc    Get an employee's file access matrix (all resources + revoked status)
// @route   GET /api/admin/users/:id/file-access
export const getUserFileAccess = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resources = await Resource.find({}).sort({ section: 1, createdAt: -1 });

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                permissions: user.permissions,
                revokedResources: user.revokedResources || [],
                fileExpiry: user.fileExpiry || [],
            },
            resources,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update specific revoked documents and file expiration for an employee
// @route   PATCH /api/admin/users/:id/file-access
export const updateUserFileAccess = async (req, res) => {
    try {
        const { revokedResources, fileExpiry } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (Array.isArray(revokedResources)) {
            user.revokedResources = revokedResources;
        }

        if (Array.isArray(fileExpiry)) {
            user.fileExpiry = fileExpiry.map((item) => ({
                resourceId: item.resourceId,
                expiresAt: item.expiresAt ? new Date(item.expiresAt) : null,
            }));
        }

        await user.save();

        await logAudit(req, {
            action: 'PERMISSIONS_UPDATED',
            target: { userId: user._id, name: user.name, email: user.email },
            details: {
                permissions: user.permissions,
                permissionExpiry: user.permissionExpiry,
            },
        });

        await notifyUser({
            recipientId: user._id,
            title: 'Permissions Changed',
            message: 'An administrator updated your section access permissions.',
            type: 'access_granted',
            link: '/dashboard',
        });

        res.json({
            success: true,
            message: 'Document access permissions updated successfully',
            data: user,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};