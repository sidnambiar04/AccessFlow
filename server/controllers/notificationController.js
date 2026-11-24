import Notification from '../models/Notification.js';

// @desc    Get logged in user's notifications
// @route   GET /api/notifications
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(30);

        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            read: false,
        });

        res.json({ success: true, count: notifications.length, unreadCount, data: notifications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { new: true }
        );
        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};