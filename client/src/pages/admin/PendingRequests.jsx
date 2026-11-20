import React, { useState, useEffect } from 'react';
import { getRegistrationRequests, approveRequest, rejectRequest } from '../../services/adminService';
import { Check, X, Shield, Clock, AlertCircle } from 'lucide-react';

const PendingRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [selectedReq, setSelectedReq] = useState(null); // for approval modal
    const [modalRole, setModalRole] = useState('Developer');
    const [modalPermissions, setModalPermissions] = useState({ projects: true, sales: false });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await getRegistrationRequests(filter === 'all' ? '' : filter);
            setRequests(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenApproveModal = (req) => {
        setSelectedReq(req);
        // Pre-populate sensible defaults based on department or default to Developer
        const isSalesDept = req.userId?.department?.toLowerCase().includes('sales');
        setModalRole(isSalesDept ? 'Sales' : 'Developer');
        setModalPermissions({
            projects: !isSalesDept,
            sales: isSalesDept,
        });
    };

    const handleConfirmApproval = async () => {
        if (!selectedReq) return;
        setActionLoading(true);
        try {
            await approveRequest(selectedReq._id, {
                role: modalRole,
                permissions: modalPermissions,
            });
            setSelectedReq(null);
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this registration request?')) return;
        try {
            await rejectRequest(id);
            fetchRequests();
        } catch (err) {
            alert('Failed to reject request');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Registration Requests</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Review onboarding submissions, assign roles, and grant section permissions.
                    </p>
                </div>

                {/* Filter buttons */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${filter === tab ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        No registration requests found under status "{filter}".
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-6">Employee</th>
                                    <th className="py-3.5 px-6">Department</th>
                                    <th className="py-3.5 px-6">Submitted Date</th>
                                    <th className="py-3.5 px-6">Status</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.map((req) => (
                                    <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-slate-900">{req.userId?.name}</div>
                                            <div className="text-xs text-slate-500">{req.userId?.email}</div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-700">
                                            <div>{req.userId?.department}</div>
                                            {req.userId?.designation && (
                                                <div className="text-xs text-slate-400">{req.userId?.designation}</div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 text-xs">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${req.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : req.status === 'approved'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}
                                            >
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            {req.status === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleOpenApproveModal(req)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                                                    >
                                                        <Check className="h-3.5 w-3.5" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req._id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-colors border border-rose-200"
                                                    >
                                                        <X className="h-3.5 w-3.5" /> Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenApproveModal(req)}
                                                    className="text-xs font-semibold text-blue-600 hover:underline"
                                                >
                                                    Reconfigure Access
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Approve / Configure Access Modal */}
            {selectedReq && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Approve & Assign Permissions</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Configuring access for <span className="font-semibold text-slate-800">{selectedReq.userId?.name}</span> ({selectedReq.userId?.email})
                            </p>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Assign Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Developer', 'Sales'].map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setModalRole(role)}
                                        className={`py-2 px-3 text-sm font-semibold rounded-xl border text-center transition-all ${modalRole === role
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Independent Section Permissions (Toggles) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Independent Section Access
                                </label>
                                <span className="text-[11px] text-slate-400">Can be granted separately</span>
                            </div>

                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                {/* Project Access Toggle */}
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span className="text-sm font-semibold text-slate-800">Project Management</span>
                                        <p className="text-xs text-slate-500">Access to tech specs, repos, and architecture</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={modalPermissions.projects}
                                        onChange={(e) =>
                                            setModalPermissions({ ...modalPermissions, projects: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </label>

                                <hr className="border-slate-200" />

                                {/* Sales Access Toggle */}
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div>
                                        <span className="text-sm font-semibold text-slate-800">Sales Management</span>
                                        <p className="text-xs text-slate-500">Access to revenue, clients, and sales analytics</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={modalPermissions.sales}
                                        onChange={(e) =>
                                            setModalPermissions({ ...modalPermissions, sales: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedReq(null)}
                                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleConfirmApproval}
                                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                            >
                                {actionLoading ? 'Saving...' : 'Confirm Approval'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingRequests;