import React, { useState, useEffect, useRef } from 'react';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/complianceService';
import { Bell, CheckCheck, Clock, ExternalLink, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for live updates
        const timer = setInterval(fetchNotifications, 30000);
        return () => clearInterval(timer);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getMyNotifications();
            setNotifications(data.data || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleItemClick = async (notif) => {
        if (!notif.read) {
            await markNotificationRead(notif._id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        }
        if (notif.link) {
            setIsOpen(false);
            navigate(notif.link);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-blue-400" />
                            <h4 className="font-bold text-sm">Notifications</h4>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.2 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-full border border-blue-400/30">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                <Sparkles className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                No notifications yet. You're all caught up!
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleItemClick(notif)}
                                    className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${!notif.read ? 'bg-blue-50/40' : ''
                                        }`}
                                >
                                    <div
                                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${notif.type === 'access_granted'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : notif.type === 'request_pending'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {notif.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 shrink-0">
                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                            {notif.message}
                                        </p>
                                    </div>
                                    {!notif.read && (
                                        <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;