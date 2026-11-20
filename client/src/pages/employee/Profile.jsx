import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Building, Shield, CheckCircle2, XCircle } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
                <p className="text-sm text-slate-500 mt-0.5">Your official employee profile and authorization settings.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase">
                            {user?.status}
                        </span>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</span>
                        <p className="text-sm font-medium text-slate-800 mt-1">{user?.department || 'N/A'}</p>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Designation</span>
                        <p className="text-sm font-medium text-slate-800 mt-1">{user?.designation || 'Not specified'}</p>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Role</span>
                        <p className="text-sm font-medium text-slate-800 mt-1">{user?.role}</p>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Management Access</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            {user?.permissions?.projects || user?.role === 'Admin' ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-700">Authorized</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-500">Not Authorized</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sales Management Access</span>
                        <div className="flex items-center gap-1.5 mt-1">
                            {user?.permissions?.sales || user?.role === 'Admin' ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-700">Authorized</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-500">Not Authorized</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
                    ℹ️ Security Policy: Employees cannot modify their own roles or access permissions. To request changes, contact your system administrator.
                </div>
            </div>
        </div>
    );
};

export default Profile;