import React, { useState } from 'react';
import { createPermissionRequest } from '../../services/permissionRequestService';
import { KeyRound, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const RequestAccessModal = ({ isOpen, onClose, initialSection = 'projects', onSuccess }) => {
    if (!isOpen) return null;

    const [section, setSection] = useState(initialSection);
    const [justification, setJustification] = useState('');
    const [duration, setDuration] = useState('Permanent');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (justification.trim().length < 5) {
            setError('Please provide a business justification (at least 5 characters).');
            return;
        }

        setLoading(true);
        try {
            await createPermissionRequest({
                section,
                justification: justification.trim(),
                duration,
            });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <KeyRound className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Request Section Access</h3>
                            <p className="text-xs text-slate-500">Submit an access ticket for administrator approval</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Section Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Requested Section
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSection('projects')}
                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                    section === 'projects'
                                        ? 'border-blue-600 bg-blue-50/60 text-blue-900 ring-2 ring-blue-600/20'
                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                            >
                                <div className="font-bold text-xs">Projects Section</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Architecture & Technical Docs</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSection('sales')}
                                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                    section === 'sales'
                                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-600/20'
                                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                            >
                                <div className="font-bold text-xs">Sales Section</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">Deals, Pipeline & Financials</div>
                            </button>
                        </div>
                    </div>

                    {/* Duration Preference */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Requested Access Duration
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="5m">5 Minutes (Quick Test Demo)</option>
                            <option value="24h">24 Hours (Temporary 1-Day)</option>
                            <option value="7d">7 Days (1 Week Sprint)</option>
                            <option value="30d">30 Days (1 Month)</option>
                            <option value="Permanent">Permanent Access</option>
                        </select>
                    </div>

                    {/* Justification Textarea */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                            Business Justification <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                            placeholder="Explain why you require access to this section (e.g., Assigned to sprint task #104 requiring architecture specs)..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Access Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestAccessModal;
