import AuditLog from '../models/AuditLog.js';

// @desc    Get all audit logs with pagination & filtering
// @route   GET /api/audit-logs
export const getAuditLogs = async (req, res) => {
    try {
        const { action, search, page = 1, limit = 50 } = req.query;
        const query = {};

        if (action && action !== 'all') {
            query.action = action;
        }

        if (search) {
            query.$or = [
                { 'actor.name': { $regex: search, $options: 'i' } },
                { 'actor.email': { $regex: search, $options: 'i' } },
                { 'target.name': { $regex: search, $options: 'i' } },
                { 'target.email': { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await AuditLog.countDocuments(query);
        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            data: logs,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};