import React, { useState, useEffect } from 'react';
import { getEmployees, updateEmployeeStatus } from '../../services/adminService';
import { Search, Filter, ShieldCheck, ShieldAlert, CheckCircle, Ban } from 'lucide-react';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, [search, roleFilter, statusFilter]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await getEmployees({ search, role: roleFilter, status: statusFilter });
            setEmployees(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
        if (!window.confirm(`Are you sure you want to change status to "${newStatus}"?`)) return;

        try {
            await updateEmployeeStatus(id, newStatus);
            fetchEmployees();
        } catch (err) {
            alert('Failed to update employee status');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Employee Directory</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    View all registered company staff, monitor active status, and manage permissions.
                </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search employees by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Roles</option>
                    <option value="Developer">Developer</option>
                    <option value="Sales">Sales</option>
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Directory Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : employees.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        No employees match the current filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-6">Name</th>
                                    <th className="py-3.5 px-6">Department</th>
                                    <th className="py-3.5 px-6">Assigned Role</th>
                                    <th className="py-3.5 px-6">Project Access</th>
                                    <th className="py-3.5 px-6">Sales Access</th>
                                    <th className="py-3.5 px-6">Account Status</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {employees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-slate-900">{emp.name}</div>
                                            <div className="text-xs text-slate-500">{emp.email}</div>
                                        </td>
                                        <td className="py-4 px-6 text-slate-600">{emp.department}</td>
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-slate-800">{emp.role}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${emp.permissions?.projects
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                {emp.permissions?.projects ? 'Allowed' : 'Denied'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${emp.permissions?.sales
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                {emp.permissions?.sales ? 'Allowed' : 'Denied'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${emp.status === 'approved'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : emp.status === 'suspended'
                                                            ? 'bg-rose-100 text-rose-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                            >
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            {emp.status === 'approved' ? (
                                                <button
                                                    onClick={() => handleToggleStatus(emp._id, emp.status)}
                                                    className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                                                >
                                                    Suspend
                                                </button>
                                            ) : emp.status === 'suspended' ? (
                                                <button
                                                    onClick={() => handleToggleStatus(emp._id, emp.status)}
                                                    className="px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                                                >
                                                    Activate
                                                </button>
                                            ) : null}
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

export default Employees;