import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEmployeeDashboardData } from '../../services/resourceService';
import { FolderKanban, TrendingUp, FileText, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await getEmployeeDashboardData();
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white rounded-3xl p-8 shadow-sm">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/20">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Authorized Portal Session</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
                    <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                        Department: <span className="font-semibold text-white">{user?.department}</span> | Assigned Role: <span className="font-semibold text-white">{user?.role}</span>
                    </p>
                </div>
            </div>

            {/* Accessible Sections Cards */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4">Your Accessible Company Sections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Projects Card */}
                    {user?.permissions?.projects || user?.role === 'Admin' ? (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
                            <div>
                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                                    <FolderKanban className="h-5 w-5" />
                                </div>
                                <h4 className="text-base font-bold text-slate-900">Project Management</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    Access system architecture documents, technical documentation, reports, and sprint milestones.
                                </p>
                            </div>
                            <Link
                                to="/projects"
                                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                            >
                                <span>Open Project Resources</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-slate-50/70 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col justify-center text-center">
                            <FolderKanban className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-600">Project Management</p>
                            <p className="text-xs text-slate-400 mt-1">You do not have access to this section. Contact administrator.</p>
                        </div>
                    )}

                    {/* Sales Card */}
                    {user?.permissions?.sales || user?.role === 'Admin' ? (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                            <div>
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <h4 className="text-base font-bold text-slate-900">Sales Management</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                    View quarterly revenue analytics, sales targets, client pipelines, and performance metrics.
                                </p>
                            </div>
                            <Link
                                to="/sales"
                                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                            >
                                <span>Open Sales Resources</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="bg-slate-50/70 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col justify-center text-center">
                            <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-600">Sales Management</p>
                            <p className="text-xs text-slate-400 mt-1">You do not have access to this section. Contact administrator.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Resources in Permitted Sections */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-base font-bold text-slate-800 mb-4">Recently Published Documents</h3>
                {loading ? (
                    <div className="py-12 text-center text-xs text-slate-400">Loading resources...</div>
                ) : data?.recentResources?.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No documents available in your permitted sections.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data?.recentResources?.map((res) => (
                            <div key={res._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                                <div>
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase mb-2 ${res.section === 'projects' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {res.category}
                                    </span>
                                    <h5 className="font-semibold text-slate-900 text-sm">{res.title}</h5>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{res.description}</p>
                                </div>
                                {res.fileUrl && (
                                    <a
                                        href={res.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <span>View Resource</span>
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;