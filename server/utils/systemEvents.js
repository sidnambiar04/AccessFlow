import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// 1. Audit Logger Helper
export const logAudit = async (req, { action, target, details }) => {
    try {
        const actor = req?.user
            ? {
                userId: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            }
            : {
                name: 'System / Auth',
                email: 'auth@accessflow.local',
                role: 'System',
            };

        const ip =
            req?.headers?.['x-forwarded-for'] ||
            req?.socket?.remoteAddress ||
            req?.ip ||
            '127.0.0.1';

        await AuditLog.create({
            actor,
            action,
            target: target || {},
            details: details || {},
            ipAddress: ip.replace('::ffff:', ''),
        });
    } catch (err) {
        console.error('[AUDIT LOG ERROR]:', err.message);
    }
};

// 2. Notification Dispatcher Helper
export const notifyUser = async ({ recipientId, title, message, type = 'system', link = '' }) => {
    try {
        await Notification.create({
            recipient: recipientId,
            title,
            message,
            type,
            link,
        });
    } catch (err) {
        console.error('[NOTIFICATION ERROR]:', err.message);
    }
};

// 3. Notify all system administrators
export const notifyAdmins = async ({ title, message, link = '/admin/requests' }) => {
    try {
        const admins = await User.find({ role: 'Admin' });
        const notifications = admins.map((admin) => ({
            recipient: admin._id,
            title,
            message,
            type: 'request_pending',
            link,
        }));
        if (notifications.length) {
            await Notification.insertMany(notifications);
        }
    } catch (err) {
        console.error('[NOTIFY ADMINS ERROR]:', err.message);
    }
};