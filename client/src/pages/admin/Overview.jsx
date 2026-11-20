import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminService';
import { Users, UserCheck, Shield, TrendingUp, Code2, ArrowUpRight, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Overview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data.data);
        } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-24">
                <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Requests', value: stats?.pendingRequests || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/requests' },
        { label: 'Active Employees', value: stats?.activeEmployees || 0, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Developers', value: stats?.developers || 0, icon: Code2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Sales Staff', value: stats?.salesEmployees || 0, icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50' },
    ];

    const chartData = [
        { name: 'Developers', count: stats?.developers || 0, color: '#4f46e5' },
        { name: 'Sales', count: stats?.salesEmployees || 0, color: '#0d9488' },
        { name: 'Pending', count: stats?.pendingRequests || 0, color: '#f59e0b' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">System Overview</h2>
                <p className="text-sm text-slate-500 mt-1">Real-time status of employees, onboarding requests, and roles.</p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
                                {card.link && (
                                    <Link to={card.link} className="text-xs text-blue-600 font-semibold flex items-center hover:underline">
                                        View <ArrowUpRight className="h-3 w-3 ml-0.5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts & Recent Requests */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <h3 className="text-base font-bold text-slate-800 mb-4">Employee Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Pending Requests */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">Pending Onboarding Requests</h3>
                            <p className="text-xs text-slate-500">Employees awaiting role and permission assignment</p>
                        </div>
                        <Link to="/admin/requests" className="text-xs font-semibold text-blue-600 hover:underline">
                            See All
                        </Link>
                    </div>

                    {stats?.recentRequests?.length === 0 ? (
                        <div className="text-center py-12 text-sm text-slate-500">
                            No pending registration requests! All caught up.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        <th className="pb-3">Employee</th>
                                        <th className="pb-3">Department</th>
                                        <th className="pb-3">Requested At</th>
                                        <th className="pb-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats?.recentRequests?.map((req) => (
                                        <tr key={req._id} className="hover:bg-slate-50/60">
                                            <td className="py-3">
                                                <div className="font-semibold text-slate-800">{req.userId?.name}</div>
                                                <div className="text-xs text-slate-500">{req.userId?.email}</div>
                                            </td>
                                            <td className="py-3 text-slate-600">{req.userId?.department}</td>
                                            <td className="py-3 text-slate-500 text-xs">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link
                                                    to="/admin/requests"
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold rounded-lg transition-colors"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overview;