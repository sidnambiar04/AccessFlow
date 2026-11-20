import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSalesResources, createSalesResource, deleteSalesResource } from '../../services/resourceService';
import { TrendingUp, Plus, ExternalLink, Trash2, Search, DollarSign, Target, Award } from 'lucide-react';

const SalesResources = () => {
    const { isAdmin } = useAuth();
    const [resources, setResources] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // New resource modal state
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Sales Overview',
        fileUrl: '',
    });

    const categories = [
        'Sales Overview',
        'Monthly Sales Reports',
        'Quarterly Sales Reports',
        'Revenue Analytics',
        'Sales Targets',
        'Client and Lead Information',
        'Sales Performance',
    ];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const data = await getSalesResources();
            setResources(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createSalesResource(form);
            setShowModal(false);
            setForm({ title: '', description: '', category: 'Sales Overview', fileUrl: '' });
            fetchResources();
        } catch (err) {
            alert('Failed to create sales resource');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this sales document?')) return;
        try {
            await deleteSalesResource(id);
            fetchResources();
        } catch (err) {
            alert('Failed to delete resource');
        }
    };

    const filtered = resources.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description?.toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter ? item.category === categoryFilter : true;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sales Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Quarterly revenue analysis, sales quota targets, and client analytics.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Sales Resource
                    </button>
                )}
            </div>

            {/* Demo KPI Banner (as per PDF Section 9) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                        <span>Q4 Target Met</span>
                        <Target className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-2">114%</p>
                    <span className="text-[10px] text-slate-400 font-medium">Demo Data</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                        <span>Annual ARR</span>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-2">$4.2M</p>
                    <span className="text-[10px] text-slate-400 font-medium">Demo Data</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
                        <span>Active Enterprise Leads</span>
                        <Award className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mt-2">68 Accounts</p>
                    <span className="text-[10px] text-slate-400 font-medium">Demo Data</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search sales documents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Resources Grid */}
            {loading ? (
                <div className="py-20 text-center">
                    <div className="h-7 w-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">
                    No sales documents found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((item) => (
                        <div key={item._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                                        {item.category}
                                    </span>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <h4 className="font-bold text-slate-900 text-base">{item.title}</h4>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[11px] text-slate-400">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                                {item.fileUrl ? (
                                    <a
                                        href={item.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                                    >
                                        <span>Open Report</span>
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">No link</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Resource Modal (Admin Only) */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <form onSubmit={handleCreate} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900">Add Sales Resource</h3>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Title *</label>
                            <input
                                type="text"
                                required
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                            <textarea
                                rows="3"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Document Link / URL</label>
                            <input
                                type="url"
                                placeholder="https://..."
                                value={form.fileUrl}
                                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                            >
                                Save Resource
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SalesResources;