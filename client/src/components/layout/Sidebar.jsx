import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    ShieldAlert,
    FolderKanban,
    TrendingUp,
    User,
    LogOut,
    Shield,
    ScrollText,
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout, isAdmin, hasProjectsAccess, hasSalesAccess } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Admin navigation items
    const adminNav = [
        { name: 'Overview', path: '/admin', icon: LayoutDashboard },
        { name: 'Pending Requests', path: '/admin/requests', icon: UserCheck },
        { name: 'Employees', path: '/admin/employees', icon: Users },
        { name: 'Roles & Permissions', path: '/admin/roles-permissions', icon: ShieldAlert },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
        { name: 'Project Management', path: '/admin/projects', icon: FolderKanban },
        { name: 'Sales Management', path: '/admin/sales', icon: TrendingUp },
    ];

    // Employee navigation items (Hides automatically if permission is expired or revoked)
    const employeeNav = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        ...(hasProjectsAccess
            ? [{ name: 'Project Management', path: '/projects', icon: FolderKanban }]
            : []),
        ...(hasSalesAccess
            ? [{ name: 'Sales Management', path: '/sales', icon: TrendingUp }]
            : []),
        { name: 'My Profile', path: '/profile', icon: User },
    ];

    const navItems = isAdmin ? adminNav : employeeNav;

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 select-none">
            {/* Brand Logo */}
            <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
                <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Shield className="h-5 w-5" />
                </div>
                <div>
                    <span className="font-bold text-lg text-white tracking-tight">AccessFlow</span>
                    <span className="block text-[10px] text-blue-400 font-medium uppercase tracking-wider">
                        {isAdmin ? 'Enterprise Admin' : 'Employee Portal'}
                    </span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
                <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Menu
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin' || item.path === '/dashboard'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-semibold text-blue-400 text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate flex-1">
                        <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.department}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-900/40"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;