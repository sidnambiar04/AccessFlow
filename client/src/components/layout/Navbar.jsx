import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User } from 'lucide-react';

const Navbar = ({ title = 'Dashboard' }) => {
    const { user } = useAuth();

    const getRoleBadge = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Developer':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Sales':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-xs">
            <div>
                <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            </div>

            <div className="flex items-center gap-4">
                {/* Role Badge */}
                <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadge(
                        user?.role
                    )}`}
                >
                    {user?.role}
                </span>

                {/* User Card */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;