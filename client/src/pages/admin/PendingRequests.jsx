import React, { useState, useEffect } from 'react';
import { getRegistrationRequests, approveRequest, rejectRequest } from '../../services/adminService';
import { getAllPermissionRequests, reviewPermissionRequest } from '../../services/permissionRequestService';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import { Check, X, Shield, Clock, AlertCircle, KeyRound, UserCheck, MessageSquare } from 'lucide-react';

const PendingRequests = () => {
    // Active category: 'registration' or 'permissions'
    const [activeCategory, setActiveCategory] = useState('registration');

    // Registration requests state
    const [regRequests, setRegRequests] = useState([]);
    const [regFilter, setRegFilter] = useState('pending');
    const [regLoading, setRegLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState(null);
    const [modalRole, setModalRole] = useState('Developer');
    const [modalPermissions, setModalPermissions] = useState({ projects: true, sales: false });

    // Permission requests state
    const [permRequests, setPermRequests] = useState([]);
    const [permFilter, setPermFilter] = useState('pending');
    const [permLoading, setPermLoading] = useState(true);
    const [selectedPerm, setSelectedPerm] = useState(null);
    const [reviewAction, setReviewAction] = useState('approved');
    const [reviewDuration, setReviewDuration] = useState('Permanent');
    const [adminComment, setAdminComment] = useState('');

    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchRegistrationRequests();
        const timer = setInterval(fetchRegistrationRequests, 12000);
        const handleFocus = () => fetchRegistrationRequests();
        window.addEventListener('focus', handleFocus);
        return () => {
            clearInterval(timer);
            window.removeEventListener('focus', handleFocus);
        };
    }, [regFilter]);

    useEffect(() => {
        fetchPermissionRequests();
        const timer = setInterval(fetchPermissionRequests, 12000);
        const handleFocus = () => fetchPermissionRequests();
        window.addEventListener('focus', handleFocus);
        return () => {
            clearInterval(timer);
            window.removeEventListener('focus', handleFocus);
        };
    }, [permFilter]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3500);
    };

    const fetchRegistrationRequests = async () => {
        setRegLoading(true);
        try {
            const data = await getRegistrationRequests(regFilter === 'all' ? '' : regFilter);
            setRegRequests(data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setRegLoading(false);
        }
    };

    const fetchPermissionRequests = async () => {
        setPermLoading(true);
        try {
            const data = await getAllPermissionRequests(permFilter);
            setPermRequests(data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setPermLoading(false);
        }
    };

    // Registration handlers
    const handleOpenApproveModal = (req) => {
        setSelectedReg(req);
        const isSalesDept = req.userId?.department?.toLowerCase().includes('sales');
        setModalRole(isSalesDept ? 'Sales' : 'Developer');
        setModalPermissions({
            projects: !isSalesDept,
            sales: isSalesDept,
        });
    };

    const handleConfirmRegistration = async () => {
        if (!selectedReg) return;
        setActionLoading(true);
        try {
            await approveRequest(selectedReg._id, {
                role: modalRole,
                permissions: modalPermissions,
            });
            setSelectedReg(null);
            fetchRegistrationRequests();
            showToast('Employee onboarding approved successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectRegistration = async (id) => {
        if (!window.confirm('Are you sure you want to reject this registration request?')) return;
        try {
            await rejectRequest(id);
            fetchRegistrationRequests();
            showToast('Registration request rejected');
        } catch (err) {
            alert('Failed to reject request');
        }
    };

    // Permission request review handlers
    const handleOpenPermReview = (req, action) => {
        setSelectedPerm(req);
        setReviewAction(action);
        setReviewDuration(req.duration || 'Permanent');
        setAdminComment('');
    };

    const handleConfirmPermReview = async () => {
        if (!selectedPerm) return;
        setActionLoading(true);
        try {
            await reviewPermissionRequest(selectedPerm._id, {
                status: reviewAction,
                customDuration: reviewDuration,
                adminComment,
            });
            setSelectedPerm(null);
            fetchPermissionRequests();
            showToast(`Access request ${reviewAction} successfully`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to review request');
        } finally {
            setActionLoading(false);
        }
    };

    const pendingPermCount = permRequests.filter((r) => r.status === 'pending').length;
    const pendingRegCount = regRequests.filter((r) => r.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-2xl shadow-lg flex items-center gap-2 animate-in fade-in">
                    <Check className="h-4 w-4" />
                    <span>{toast}</span>
                </div>
            )}

            {/* Header with Hub Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Requests & Approvals Hub</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Manage employee registration onboarding and section access ticket requests.
                    </p>
                </div>

                {/* Main Category Switcher */}
                <div className="inline-flex rounded-2xl bg-slate-200/80 p-1 border border-slate-300/60 shadow-2xs">
                    <button
                        onClick={() => setActiveCategory('registration')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            activeCategory === 'registration'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <span>Onboarding Registrations</span>
                        {pendingRegCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                {pendingRegCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveCategory('permissions')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            activeCategory === 'permissions'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <KeyRound className="h-4 w-4 text-emerald-600" />
                        <span>Section Access Tickets</span>
                        {pendingPermCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                                {pendingPermCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* --- VIEW 1: REGISTRATION REQUESTS --- */}
            {activeCategory === 'registration' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Employee Registration Queue
                        </span>
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                            {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setRegFilter(tab)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                                        regFilter === tab ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        {regLoading ? (
                            <div className="py-20 text-center">
                                <div className="h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        ) : regRequests.length === 0 ? (
                            <div className="py-16 text-center text-sm text-slate-500">
                                No registration requests found under status "{regFilter}".
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
                                        {regRequests.map((req) => (
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
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                                                            req.status === 'pending'
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
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                                            >
                                                                <Check className="h-3.5 w-3.5" /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectRegistration(req._id)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-colors border border-rose-200 cursor-pointer"
                                                            >
                                                                <X className="h-3.5 w-3.5" /> Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleOpenApproveModal(req)}
                                                            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
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
                </div>
            )}

            {/* --- VIEW 2: SECTION ACCESS REQUESTS --- */}
            {activeCategory === 'permissions' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Employee Permission Change Tickets
                        </span>
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                            {['pending', 'approved', 'rejected', 'all'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setPermFilter(tab)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                                        permFilter === tab ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        {permLoading ? (
                            <div className="py-20 text-center">
                                <div className="h-7 w-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        ) : permRequests.length === 0 ? (
                            <div className="py-16 text-center text-sm text-slate-500">
                                No permission tickets found under status "{permFilter}".
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3.5 px-6">Employee</th>
                                            <th className="py-3.5 px-6">Target Section</th>
                                            <th className="py-3.5 px-6">Justification</th>
                                            <th className="py-3.5 px-6">Requested Duration</th>
                                            <th className="py-3.5 px-6">Status</th>
                                            <th className="py-3.5 px-6 text-right">Review Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {permRequests.map((req) => (
                                            <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-slate-900">{req.userId?.name}</div>
                                                    <div className="text-xs text-slate-500">{req.userId?.email}</div>
                                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                                        {req.userId?.department} • {req.userId?.role}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                                            req.section === 'projects'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-emerald-100 text-emerald-700'
                                                        }`}
                                                    >
                                                        {req.section}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 max-w-xs">
                                                    <p className="text-xs text-slate-700 line-clamp-2 italic">
                                                        "{req.justification}"
                                                    </p>
                                                    {req.adminComment && (
                                                        <p className="text-[11px] text-slate-400 mt-1">
                                                            Note: {req.adminComment}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                                                        {req.duration === '5m'
                                                            ? '5 Mins (Demo)'
                                                            : req.duration === '24h'
                                                            ? '24 Hours'
                                                            : req.duration === '7d'
                                                            ? '7 Days'
                                                            : req.duration === '30d'
                                                            ? '30 Days'
                                                            : 'Permanent'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                                                            req.status === 'pending'
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
                                                                onClick={() => handleOpenPermReview(req, 'approved')}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                                            >
                                                                <Check className="h-3.5 w-3.5" /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenPermReview(req, 'rejected')}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-colors border border-rose-200 cursor-pointer"
                                                            >
                                                                <X className="h-3.5 w-3.5" /> Deny
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            Reviewed on {new Date(req.reviewedAt || req.updatedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal: Approve Registration */}
            {selectedReg && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Approve & Assign Permissions</h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Configuring access for <span className="font-semibold text-slate-800">{selectedReg.userId?.name}</span> ({selectedReg.userId?.email})
                            </p>
                        </div>

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
                                        className={`py-2 px-3 text-sm font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                                            modalRole === role
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Section Permissions
                            </label>
                            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-800">Project Management</span>
                                    <ToggleSwitch
                                        checked={modalPermissions.projects}
                                        activeColor="bg-blue-600"
                                        onChange={(checked) =>
                                            setModalPermissions({ ...modalPermissions, projects: checked })
                                        }
                                    />
                                </div>
                                <hr className="border-slate-200" />
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-800">Sales Management</span>
                                    <ToggleSwitch
                                        checked={modalPermissions.sales}
                                        activeColor="bg-emerald-600"
                                        onChange={(checked) =>
                                            setModalPermissions({ ...modalPermissions, sales: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedReg(null)}
                                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleConfirmRegistration}
                                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                            >
                                {actionLoading ? 'Saving...' : 'Confirm Approval'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Review Permission Ticket */}
            {selectedPerm && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                            <div
                                className={`p-2.5 rounded-xl ${
                                    reviewAction === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}
                            >
                                {reviewAction === 'approved' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800 capitalize">
                                    {reviewAction} Section Access
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {selectedPerm.userId?.name} requesting{' '}
                                    <span className="font-bold uppercase text-slate-700">{selectedPerm.section}</span>
                                </p>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                            <span className="font-semibold block text-slate-500 mb-1">Employee Justification:</span>
                            <p className="italic">"{selectedPerm.justification}"</p>
                        </div>

                        {reviewAction === 'approved' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    Grant Access For Duration
                                </label>
                                <select
                                    value={reviewDuration}
                                    onChange={(e) => setReviewDuration(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="5m">5 Minutes (Live Testing Demo)</option>
                                    <option value="24h">24 Hours (1 Day)</option>
                                    <option value="7d">7 Days (1 Week)</option>
                                    <option value="30d">30 Days (1 Month)</option>
                                    <option value="Permanent">Permanent Access (No Expiration)</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                Admin Comment / Note (Optional)
                            </label>
                            <input
                                type="text"
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                placeholder="e.g. Approved for sprint 14"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedPerm(null)}
                                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleConfirmPermReview}
                                className={`flex-1 py-2.5 px-4 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer ${
                                    reviewAction === 'approved'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-rose-600 hover:bg-rose-700'
                                }`}
                            >
                                {actionLoading ? 'Processing...' : `Confirm ${reviewAction === 'approved' ? 'Approval' : 'Denial'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingRequests;
