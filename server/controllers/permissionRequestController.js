import PermissionRequest from '../models/PermissionRequest.js';
import User from '../models/User.js';
import { logAudit, notifyUser, notifyAdmins } from '../utils/systemEvents.js';

// @desc    Submit a request for section access
// @route   POST /api/permission-requests
export const createPermissionRequest = async (req, res) => {
    try {
        const { section, justification, duration } = req.body;

        if (!['projects', 'sales'].includes(section)) {
            return res.status(400).json({ message: 'Invalid section requested' });
        }
        if (!justification || justification.trim().length < 5) {
            return res.status(400).json({ message: 'Please provide a justification (min 5 characters)' });
        }

        // Check if an existing pending request for this section already exists
        const existing = await PermissionRequest.findOne({
            userId: req.user._id,
            section,
            status: 'pending',
        });
        if (existing) {
            return res.status(400).json({ message: `You already have a pending request for the ${section} section.` });
        }

        const request = await PermissionRequest.create({
            userId: req.user._id,
            section,
            justification,
            duration: duration || 'Permanent',
        });

        // Audit Log & Notify Admins
        await logAudit(req, {
            action: 'ACCESS_REQUEST_SUBMITTED',
            target: { userId: req.user._id, name: req.user.name, email: req.user.email },
            details: { section, duration: duration || 'Permanent', justification },
        });

        await notifyAdmins({
            title: 'New Access Ticket',
            message: `${req.user.name} submitted an access request for the ${section} section.`,
            link: '/admin/requests',
        });

        res.status(201).json({
            success: true,
            message: 'Access request submitted successfully for administrator review.',
            data: request,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's submitted access requests
// @route   GET /api/permission-requests/my
export const getMyRequests = async (req, res) => {
    try {
        const requests = await PermissionRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all permission requests (Admin only)
// @route   GET /api/permission-requests
export const getAllPermissionRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== 'all') filter.status = status;

        const requests = await PermissionRequest.find(filter)
            .populate('userId', 'name email department designation role')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject an access request (Admin only)
// @route   PATCH /api/permission-requests/:id/review
export const reviewPermissionRequest = async (req, res) => {
    try {
        const { status, adminComment, customDuration } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be approved or rejected' });
        }

        const request = await PermissionRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Request is already ${request.status}` });
        }

        request.status = status;
        request.adminComment = adminComment || '';
        request.reviewedBy = req.user._id;
        request.reviewedAt = new Date();
        await request.save();

        // If approved, automatically update user permissions and calculate expiry!
        if (status === 'approved') {
            const user = await User.findById(request.userId);
            if (user) {
                user.permissions[request.section] = true;

                // Duration calculation
                const finalDuration = customDuration || request.duration;
                let expiryDate = null;
                const now = Date.now();

                if (finalDuration === '5m') {
                    expiryDate = new Date(now + 5 * 60 * 1000);
                } else if (finalDuration === '24h') {
                    expiryDate = new Date(now + 24 * 60 * 60 * 1000);
                } else if (finalDuration === '7d') {
                    expiryDate = new Date(now + 7 * 24 * 60 * 60 * 1000);
                } else if (finalDuration === '30d') {
                    expiryDate = new Date(now + 30 * 24 * 60 * 60 * 1000);
                }

                user.permissionExpiry[request.section] = expiryDate;
                await user.save();
            }
        }

        // Audit Log & Notify Requesting Employee
        await logAudit(req, {
            action: status === 'approved' ? 'ACCESS_REQUEST_APPROVED' : 'ACCESS_REQUEST_DENIED',
            target: { userId: request.userId },
            details: {
                section: request.section,
                duration: customDuration || request.duration,
                adminComment,
            },
        });

        await notifyUser({
            recipientId: request.userId,
            title: `Access Request ${status === 'approved' ? 'Approved' : 'Denied'}`,
            message: `Your request for the ${request.section} section was ${status}.${adminComment ? ` Note: "${adminComment}"` : ''}`,
            type: status === 'approved' ? 'access_granted' : 'system',
            link: status === 'approved' ? `/${request.section}` : '/dashboard',
        });

        res.json({
            success: true,
            message: `Request ${status} successfully`,
            data: request,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};