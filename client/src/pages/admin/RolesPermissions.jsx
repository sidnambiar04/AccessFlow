import React, { useState, useEffect } from 'react';
import { getEmployees, updateEmployeePermissions, updateEmployeeRole } from '../../services/adminService';
import { Shield, CheckCircle2 } from 'lucide-react';

const RolesPermissions = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');

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

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Roles & Permissions Matrix</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Independent authorization matrix. Grant or revoke section access with instant database persistence.
                    </p>
                </div>
                {toast && (
                    <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 animate-in fade-in">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{toast}</span>
                    </div>
                )}
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
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() =>
                                                    handleTogglePermission(emp._id, 'projects', emp.permissions?.projects)
                                                }
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${emp.permissions?.projects
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {emp.permissions?.projects ? 'Allowed' : 'Denied'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() =>
                                                    handleTogglePermission(emp._id, 'sales', emp.permissions?.sales)
                                                }
                                                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${emp.permissions?.sales
                                                        ? 'bg-emerald-600 text-white shadow-xs'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {emp.permissions?.sales ? 'Allowed' : 'Denied'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RolesPermissions;