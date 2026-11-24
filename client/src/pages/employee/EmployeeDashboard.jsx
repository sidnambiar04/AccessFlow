import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEmployeeDashboardData } from '../../services/resourceService';
import { getMyPermissionRequests } from '../../services/permissionRequestService';
import PdfPreviewModal from '../../components/common/PdfPreviewModal';
import RequestAccessModal from '../../components/employee/RequestAccessModal';
import { FolderKanban, TrendingUp, FileText, ArrowRight, ShieldCheck, ExternalLink, Eye, Clock, KeyRound, CheckCircle2 } from 'lucide-react';

const EmployeeDashboard = () => {
    const { user, hasProjectsAccess, hasSalesAccess } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [requestModal, setRequestModal] = useState({ isOpen: false, section: 'projects' });
    const [pendingRequests, setPendingRequests] = useState([]);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchDashboard();
        fetchMyRequests();
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

    const fetchMyRequests = async () => {
        try {
            const res = await getMyPermissionRequests();
            const pending = (res.data || [])
                .filter((r) => r.status === 'pending')
                .map((r) => r.section);
            setPendingRequests(pending);
        } catch (err) {
            console.error(err);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 4000);
    };

    const renderExpiryNote = (expiryDate) => {
        if (!expiryDate) {
            return <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">Permanent Access</span>;
        }
        const diffMs = new Date(expiryDate).getTime() - Date.now();
        if (diffMs <= 0) {
            return <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">Access Expired</span>;
        }
        const diffMins = Math.ceil(diffMs / (1000 * 60));
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const timeText = diffMins < 60 ? `${diffMins}m` : diffHours < 24 ? `${diffHours}h` : `${diffDays}d`;
        return (
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-amber-200">
                <Clock className="h-3 w-3" /> Expires in {timeText}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-6 right-6 z-50 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-2xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{toast}</span>
                </div>
            )}

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
                    {hasProjectsAccess ? (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <FolderKanban className="h-5 w-5" />
                                    </div>
                                    {renderExpiryNote(user?.permissionExpiry?.projects)}
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
                        <div className="bg-slate-50/70 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col justify-between">
                            <div className="text-center py-2">
                                <FolderKanban className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-700">Project Management</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                                    {user?.permissions?.projects && user?.permissionExpiry?.projects && new Date(user.permissionExpiry.projects) < new Date()
                                        ? 'Your previous temporary access has expired.'
                                        : 'You do not currently have access to this section.'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-200/60 flex justify-center">
                                {pendingRequests.includes('projects') ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-semibold">
                                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                                        <span>Request Pending Approval</span>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setRequestModal({ isOpen: true, section: 'projects' })}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                    >
                                        <KeyRound className="h-3.5 w-3.5" />
                                        <span>Request Access</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sales Card */}
                    {hasSalesAccess ? (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    {renderExpiryNote(user?.permissionExpiry?.sales)}
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
                        <div className="bg-slate-50/70 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col justify-between">
                            <div className="text-center py-2">
                                <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-700">Sales Management</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                                    {user?.permissions?.sales && user?.permissionExpiry?.sales && new Date(user.permissionExpiry.sales) < new Date()
                                        ? 'Your previous temporary access has expired.'
                                        : 'You do not currently have access to this section.'}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-200/60 flex justify-center">
                                {pendingRequests.includes('sales') ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-semibold">
                                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                                        <span>Request Pending Approval</span>
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setRequestModal({ isOpen: true, section: 'sales' })}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                    >
                                        <KeyRound className="h-3.5 w-3.5" />
                                        <span>Request Access</span>
                                    </button>
                                )}
                            </div>
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
                    <div className="py-12 text-center text-sm text-slate-400">
                        No documents currently available in your authorized sections.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data?.recentResources?.map((doc) => (
                            <div
                                key={doc._id}
                                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                doc.section === 'projects'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                            }`}
                                        >
                                            {doc.section}
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h5 className="font-semibold text-sm text-slate-900 line-clamp-1">{doc.title}</h5>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.description}</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-400">{doc.category}</span>
                                    {doc.fileUrl ? (
                                        <button
                                            type="button"
                                            onClick={() => setPreviewDoc(doc)}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>Preview PDF</span>
                                        </button>
                                    ) : (
                                        <span className="text-xs text-slate-400">No PDF attached</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PDF Preview Modal */}
            <PdfPreviewModal
                isOpen={Boolean(previewDoc)}
                onClose={() => setPreviewDoc(null)}
                fileUrl={previewDoc?.fileUrl}
                title={previewDoc?.title}
            />

            {/* Request Additional Access Modal */}
            <RequestAccessModal
                isOpen={requestModal.isOpen}
                onClose={() => setRequestModal({ isOpen: false, section: 'projects' })}
                initialSection={requestModal.section}
                onSuccess={() => {
                    fetchMyRequests();
                    showToast('Access request submitted successfully! Administrator notified.');
                }}
            />
        </div>
    );
};

export default EmployeeDashboard;
