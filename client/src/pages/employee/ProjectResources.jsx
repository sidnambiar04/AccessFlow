import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProjectResources, createProjectResource, deleteProjectResource, uploadPdfFile } from '../../services/resourceService';
import PdfPreviewModal from '../../components/common/PdfPreviewModal';
import { FolderKanban, Plus, ExternalLink, Trash2, Search, FileText, Eye, Upload, CheckCircle2 } from 'lucide-react';

const ProjectResources = () => {
    const { isAdmin } = useAuth();
    const [resources, setResources] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState(null);

    // New resource modal state
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'Technical Documentation',
        fileUrl: '',
    });

    const categories = [
        'Project Overview',
        'Project Reports',
        'System Architecture',
        'Technical Documentation',
        'Project Progress',
        'Technology Stack',
    ];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const data = await getProjectResources();
            setResources(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please select a valid PDF file (.pdf).');
            return;
        }

        setUploading(true);
        try {
            const res = await uploadPdfFile(file);
            setForm((prev) => ({ ...prev, fileUrl: res.fileUrl }));
            setUploadedFileName(file.name);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to upload PDF');
        } finally {
            setUploading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createProjectResource(form);
            setShowModal(false);
            setForm({ title: '', description: '', category: 'Technical Documentation', fileUrl: '' });
            setUploadedFileName('');
            fetchResources();
        } catch (err) {
            alert('Failed to create resource');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this project document?')) return;
        try {
            await deleteProjectResource(id);
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
                    <h2 className="text-2xl font-bold text-slate-800">Project Management</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Internal technical specifications, architecture blueprints, and milestone reports.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Project Resource
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search project documents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div className="h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">
                    No project resources found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((item) => (
                        <div key={item._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700">
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
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDoc(item)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 transition-colors cursor-pointer"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>Preview PDF</span>
                                    </button>
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
                        <h3 className="text-lg font-bold text-slate-900">Add Project Resource</h3>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Title *</label>
                            <input
                                type="text"
                                required
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Attach PDF Document *
                            </label>
                            
                            {/* File Upload Drop Area */}
                            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center transition-colors bg-slate-50/60 mb-2">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileUpload}
                                    id="project-pdf-upload"
                                    className="hidden"
                                />
                                <label htmlFor="project-pdf-upload" className="cursor-pointer flex flex-col items-center">
                                    {uploading ? (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 py-2">
                                            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <span>Uploading PDF to server...</span>
                                        </div>
                                    ) : uploadedFileName ? (
                                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 py-1">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                            <span className="truncate max-w-xs">{uploadedFileName}</span>
                                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">Uploaded</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-6 w-6 text-slate-400 mb-1" />
                                            <span className="text-xs font-semibold text-blue-600 hover:underline">Click to browse & upload PDF</span>
                                            <span className="text-[11px] text-slate-400 mt-0.5">Maximum file size: 10MB</span>
                                        </>
                                    )}
                                </label>
                            </div>

                            {/* Optional / Fallback link input */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Or paste relative path: /uploads/file.pdf or URL"
                                    value={form.fileUrl}
                                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
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
                                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                            >
                                Save Resource
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* PDF Preview Modal */}
            <PdfPreviewModal
                isOpen={Boolean(previewDoc)}
                onClose={() => setPreviewDoc(null)}
                doc={previewDoc}
            />
        </div>
    );
};

export default ProjectResources;