import React, { useState, useEffect } from 'react';
import { getEmployees, updateEmployeePermissions, updateEmployeeRole } from '../../services/adminService';
import { downloadAccessMatrixCsv } from '../../services/complianceService';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import FileAccessModal from '../../components/admin/FileAccessModal';
import { Shield, CheckCircle2, SlidersHorizontal, Clock, Calendar, X, Download } from 'lucide-react';

const RolesPermissions = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [selectedUserForFiles, setSelectedUserForFiles] = useState(null);

    // State for setting time-bound access
    const [expiryModal, setExpiryModal] = useState({ isOpen: false, emp: null, section: null });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await getEmployees();
            setEmployees(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateEmployeeRole(userId, newRole);
            setEmployees((prev) =>
                prev.map((emp) => (emp._id === userId ? { ...emp, role: newRole } : emp))
            );
            showToast(`Role updated to ${newRole}`);
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const handleTogglePermission = async (userId, permKey, currentValue) => {
        try {
            const updatedPermissions = { [permKey]: !currentValue };
            await updateEmployeePermissions(userId, updatedPermissions);
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp._id === userId
                        ? { ...emp, permissions: { ...emp.permissions, [permKey]: !currentValue } }
                        : emp
                )
            );
            showToast(`Updated ${permKey} permission`);
        } catch (err) {
            alert('Failed to update permissions');
        }
    };

    const handleSetExpiry = async (durationMinutes) => {
        const { emp, section } = expiryModal;
        if (!emp || !section) return;

        let expiryDate = null;
        if (durationMinutes !== null) {
            expiryDate = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
        }

        try {
            const payload = {
                [`${section}Expiry`]: expiryDate,
                // Ensure permission is active if setting expiry
                [section]: true,
            };

            await updateEmployeePermissions(emp._id, payload);

            setEmployees((prev) =>
                prev.map((e) =>
                    e._id === emp._id
                        ? {
                            ...e,
                            permissions: { ...e.permissions, [section]: true },
                            permissionExpiry: {
                                ...(e.permissionExpiry || {}),
                                [section]: expiryDate,
                            },
                        }
                        : e
                )
            );

            showToast(`Access duration updated for ${section}`);
            setExpiryModal({ isOpen: false, emp: null, section: null });
        } catch (err) {
            alert('Failed to update expiry duration');
        }
    };

    const formatExpiryBadge = (expiryDate, isPermitted) => {
        if (!isPermitted) return null;
        if (!expiryDate) {
            return (
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    Permanent
                </span>
            );
        }

        const expiry = new Date(expiryDate);
        const now = new Date();
        const diffMs = expiry.getTime() - now.getTime();

        if (diffMs <= 0) {
            return (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    Expired
                </span>
            );
        }

        const diffMinutes = Math.ceil(diffMs / (1000 * 60));
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let timeText = `${diffDays}d left`;
        if (diffMinutes < 60) {
            timeText = `${diffMinutes}m left`;
        } else if (diffHours < 24) {
            timeText = `${diffHours}h left`;
        }

        return (
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {timeText}
            </span>
        );
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Roles & Permissions Matrix</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Independent authorization matrix. Grant permanent or time-bound access with automated expiration.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={downloadAccessMatrixCsv}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export Compliance Matrix</span>
                    </button>
                    {toast && (
                        <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 animate-in fade-in">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{toast}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-6">Employee</th>
                                    <th className="py-3.5 px-6">Assigned Role</th>
                                    <th className="py-3.5 px-6 text-center">Projects Section</th>
                                    <th className="py-3.5 px-6 text-center">Sales Section</th>
                                    <th className="py-3.5 px-6 text-center">Specific File Access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {employees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-slate-900">{emp.name}</div>
                                            <div className="text-xs text-slate-500">{emp.email}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <select
                                                value={emp.role}
                                                onChange={(e) => handleRoleChange(emp._id, e.target.value)}
                                                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="Developer">Developer</option>
                                                <option value="Sales">Sales</option>
                                            </select>
                                        </td>
                                        {/* Projects Section Column with Expiry UI */}
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <ToggleSwitch
                                                        checked={Boolean(emp.permissions?.projects)}
                                                        activeColor="bg-blue-600"
                                                        onChange={() =>
                                                            handleTogglePermission(emp._id, 'projects', emp.permissions?.projects)
                                                        }
                                                    />
                                                    {emp.permissions?.projects && (
                                                        <button
                                                            type="button"
                                                            title="Set time limit / expiry"
                                                            onClick={() =>
                                                                setExpiryModal({
                                                                    isOpen: true,
                                                                    emp,
                                                                    section: 'projects',
                                                                })
                                                            }
                                                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                                                        >
                                                            <Clock className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                                {formatExpiryBadge(
                                                    emp.permissionExpiry?.projects,
                                                    emp.permissions?.projects
                                                )}
                                            </div>
                                        </td>
                                        {/* Sales Section Column with Expiry UI */}
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <ToggleSwitch
                                                        checked={Boolean(emp.permissions?.sales)}
                                                        activeColor="bg-emerald-600"
                                                        onChange={() =>
                                                            handleTogglePermission(emp._id, 'sales', emp.permissions?.sales)
                                                        }
                                                    />
                                                    {emp.permissions?.sales && (
                                                        <button
                                                            type="button"
                                                            title="Set time limit / expiry"
                                                            onClick={() =>
                                                                setExpiryModal({
                                                                    isOpen: true,
                                                                    emp,
                                                                    section: 'sales',
                                                                })
                                                            }
                                                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 bg-white rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                                                        >
                                                            <Clock className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                                {formatExpiryBadge(
                                                    emp.permissionExpiry?.sales,
                                                    emp.permissions?.sales
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedUserForFiles(emp)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200 shadow-2xs"
                                            >
                                                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                                                <span>Customize Files</span>
                                                {emp.revokedResources?.length > 0 && (
                                                    <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] rounded-full font-bold">
                                                        {emp.revokedResources.length} hidden
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Granular File Access Modal */}
            <FileAccessModal
                isOpen={Boolean(selectedUserForFiles)}
                onClose={() => setSelectedUserForFiles(null)}
                user={selectedUserForFiles}
                onSaved={() => {
                    fetchEmployees();
                    showToast('Document permissions updated successfully');
                }}
            />

            {/* Time-Bound / Expiry Duration Modal */}
            {expiryModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Set Access Duration</h3>
                                    <p className="text-xs text-slate-500 capitalize">
                                        {expiryModal.section} Section for {expiryModal.emp?.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setExpiryModal({ isOpen: false, emp: null, section: null })}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 mb-4">
                            Choose how long this employee will retain access before it is automatically revoked:
                        </p>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => handleSetExpiry(5)}
                                className="w-full text-left px-4 py-2.5 rounded-xl border border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 text-xs font-semibold text-amber-900 transition-colors flex justify-between items-center"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                                    <span>5 Minutes (Live Testing Demo)</span>
                                </span>
                                <span className="text-[10px] bg-amber-200/60 text-amber-800 px-1.5 py-0.5 rounded font-bold">Fast Test</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSetExpiry(24 * 60)}
                                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors flex justify-between items-center"
                            >
                                <span>24 Hours (1 Day Temporary)</span>
                                <span className="text-[10px] text-slate-400">Quick Trial</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSetExpiry(7 * 24 * 60)}
                                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors flex justify-between items-center"
                            >
                                <span>7 Days (1 Week)</span>
                                <span className="text-[10px] text-slate-400">Sprint Access</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSetExpiry(30 * 24 * 60)}
                                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors flex justify-between items-center"
                            >
                                <span>30 Days (1 Month)</span>
                                <span className="text-[10px] text-slate-400">Quarterly Term</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSetExpiry(null)}
                                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-xs font-semibold text-slate-700 transition-colors flex justify-between items-center"
                            >
                                <span className="text-emerald-700 font-bold">Permanent Access (No Expiration)</span>
                                <span className="text-[10px] text-emerald-600 font-medium">Standard</span>
                            </button>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setExpiryModal({ isOpen: false, emp: null, section: null })}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RolesPermissions;