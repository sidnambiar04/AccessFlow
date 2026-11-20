import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200/60 shadow-xs">
                    <Clock className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Approval Pending</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Welcome, <span className="font-semibold text-slate-800">{user?.name}</span>! Your account is currently in the review queue.
                </p>
                <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Account Email:</span>
                        <span className="font-medium text-slate-800">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Department:</span>
                        <span className="font-medium text-slate-800">{user?.department}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold uppercase text-[10px]">
                            Pending
                        </span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mb-6">
                    Once an administrator assigns your role and section permissions, you will be able to access the employee portal.
                </p>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default PendingApproval;