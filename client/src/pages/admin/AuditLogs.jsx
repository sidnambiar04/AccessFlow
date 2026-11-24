import React, { useState, useEffect } from 'react';
import { getAuditLogs, downloadAuditLogsCsv } from '../../services/complianceService';
import { ScrollText, Download, Printer, Search, RefreshCw, Shield, User, Filter, Calendar } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, [actionFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getAuditLogs({ action: actionFilter, search });
            setLogs(data.data || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const getActionBadge = (action) => {
        if (action.includes('APPROVED')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (action.includes('REJECTED') || action.includes('DENIED')) return 'bg-rose-100 text-rose-800 border-rose-200';
        if (action.includes('LOGIN')) return 'bg-blue-100 text-blue-800 border-blue-200';
        if (action.includes('PERMISSIONS') || action.includes('FILE_ACCESS')) return 'bg-purple-100 text-purple-800 border-purple-200';
        return 'bg-amber-100 text-amber-800 border-amber-200';
    };

    return (
        <div className="space-y-6">
            {/* Page Header with Compliance Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <ScrollText className="h-6 w-6 text-blue-600" />
                        <span>Enterprise Audit Logs</span>
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Immutable record of all authentication, authorization, and administrative events for compliance.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Print / PDF</span>
                    </button>
                    <button
                        type="button"
                        onClick={downloadAuditLogsCsv}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search actor or target user..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </form>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Audit Actions</option>
                        <option value="USER_LOGIN">User Logins</option>
                        <option value="ONBOARDING_APPROVED">Onboarding Approvals</option>
                        <option value="PERMISSIONS_UPDATED">Permission Updates</option>
                        <option value="FILE_ACCESS_UPDATED">File-Level Customization</option>
                        <option value="ACCESS_REQUEST_SUBMITTED">Access Requests Submitted</option>
                        <option value="ACCESS_REQUEST_APPROVED">Access Requests Approved</option>
                    </select>

                    <button
                        type="button"
                        onClick={fetchLogs}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500">
                        No audit records found matching your query.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-6">Timestamp</th>
                                    <th className="py-3.5 px-6">Actor</th>
                                    <th className="py-3.5 px-6">Action Event</th>
                                    <th className="py-3.5 px-6">Target Entity</th>
                                    <th className="py-3.5 px-6">Details / Payload</th>
                                    <th className="py-3.5 px-6 text-right">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-6 text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <div className="font-semibold text-xs text-slate-900">{log.actor?.name}</div>
                                            <div className="text-[11px] text-slate-400">{log.actor?.email} ({log.actor?.role})</div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6 text-xs text-slate-700">
                                            {log.target?.name || log.target?.resourceTitle || '—'}
                                        </td>
                                        <td className="py-3.5 px-6 text-xs text-slate-500 max-w-xs truncate">
                                            {log.details && Object.keys(log.details).length > 0 ? (
                                                <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">
                                                    {JSON.stringify(log.details)}
                                                </code>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="py-3.5 px-6 text-right text-xs font-mono text-slate-400">
                                            {log.ipAddress || '127.0.0.1'}
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

export default AuditLogs;