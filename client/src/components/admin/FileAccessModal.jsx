import React, { useState, useEffect } from 'react';
import { getUserFileAccess, updateUserFileAccess } from '../../services/adminService';
import ToggleSwitch from '../common/ToggleSwitch';
import { X, SlidersHorizontal, FileText, CheckCircle2, ShieldAlert, Check, Ban, Clock } from 'lucide-react';

const FileAccessModal = ({ isOpen, onClose, user, onSaved }) => {
  if (!isOpen || !user) return null;

  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resources, setResources] = useState([]);
  const [revokedIds, setRevokedIds] = useState([]);
  const [fileExpiryMap, setFileExpiryMap] = useState({}); // resourceId -> Date string
  const [fileDurationModal, setFileDurationModal] = useState({ isOpen: false, doc: null });

  useEffect(() => {
    fetchFileAccess();
  }, [user._id]);

  const fetchFileAccess = async () => {
    setLoading(true);
    try {
      const data = await getUserFileAccess(user._id);
      setResources(data.resources || []);
      setRevokedIds(data.user?.revokedResources?.map((id) => id.toString()) || []);

      // Build expiry map
      const expiryObj = {};
      if (Array.isArray(data.user?.fileExpiry)) {
        data.user.fileExpiry.forEach((item) => {
          if (item.resourceId && item.expiresAt) {
            expiryObj[item.resourceId.toString()] = item.expiresAt;
          }
        });
      }
      setFileExpiryMap(expiryObj);

      // Auto-select first permitted section
      if (!user.permissions?.projects && user.permissions?.sales) {
        setActiveTab('sales');
      } else {
        setActiveTab('projects');
      }
    } catch (err) {
      alert('Failed to load file access details');
    } finally {
      setLoading(false);
    }
  };

  const isFileAllowed = (resourceId) => {
    return !revokedIds.includes(resourceId.toString());
  };

  const handleToggleFile = (resourceId, shouldAllow) => {
    const idStr = resourceId.toString();
    if (shouldAllow) {
      // Remove from revokedIds list
      setRevokedIds((prev) => prev.filter((id) => id !== idStr));
    } else {
      // Add to revokedIds list
      if (!revokedIds.includes(idStr)) {
        setRevokedIds((prev) => [...prev, idStr]);
      }
      // Also clear expiry if revoked
      setFileExpiryMap((prev) => {
        const copy = { ...prev };
        delete copy[idStr];
        return copy;
      });
    }
  };

  const handleSetFileDuration = (minutes) => {
    const { doc } = fileDurationModal;
    if (!doc) return;
    const docId = doc._id.toString();

    let expiryDate = null;
    if (minutes !== null) {
      expiryDate = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    }

    setFileExpiryMap((prev) => {
      const copy = { ...prev };
      if (expiryDate) {
        copy[docId] = expiryDate;
      } else {
        delete copy[docId]; // Permanent
      }
      return copy;
    });

    // Ensure it is not in revoked list
    setRevokedIds((prev) => prev.filter((id) => id !== docId));
    setFileDurationModal({ isOpen: false, doc: null });
  };

  const handleAllowAllSection = (sectionName) => {
    const sectionFileIds = resources
      .filter((r) => r.section === sectionName)
      .map((r) => r._id.toString());
    setRevokedIds((prev) => prev.filter((id) => !sectionFileIds.includes(id)));
  };

  const handleRevokeAllSection = (sectionName) => {
    const sectionFileIds = resources
      .filter((r) => r.section === sectionName)
      .map((r) => r._id.toString());
    setRevokedIds((prev) => Array.from(new Set([...prev, ...sectionFileIds])));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare fileExpiry array
      const fileExpiryArray = Object.entries(fileExpiryMap).map(([resourceId, expiresAt]) => ({
        resourceId,
        expiresAt,
      }));

      await updateUserFileAccess(user._id, revokedIds, fileExpiryArray);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save file permissions');
    } finally {
      setSaving(false);
    }
  };

  const formatFileExpiry = (expiryDate) => {
    if (!expiryDate) {
      return (
        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
          Permanent
        </span>
      );
    }
    const diffMs = new Date(expiryDate).getTime() - Date.now();
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
    const timeText = diffMinutes < 60 ? `${diffMinutes}m left` : diffHours < 24 ? `${diffHours}h left` : `${diffDays}d left`;

    return (
      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
        <Clock className="h-2.5 w-2.5" />
        {timeText}
      </span>
    );
  };

  const sectionResources = resources.filter((r) => r.section === activeTab);
  const isSectionEnabled = user.permissions?.[activeTab];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Granular File-Level Access</h3>
              <p className="text-xs text-slate-400">
                Customizing for <span className="text-white font-semibold">{user.name}</span> ({user.role})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="bg-slate-50 px-6 pt-3 border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Project Documents</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                user.permissions?.projects
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {user.permissions?.projects ? 'Section ON' : 'Section OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Sales Reports</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                user.permissions?.sales
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {user.permissions?.sales ? 'Section ON' : 'Section OFF'}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center">
              <div className="h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !isSectionEnabled ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center text-amber-800">
              <ShieldAlert className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="font-semibold text-sm">
                The {activeTab === 'projects' ? 'Project' : 'Sales'} Section is currently OFF
              </p>
              <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
                This employee does not have general access to the {activeTab} section. Enable the section toggle switch in the main table first if you wish to grant file permissions.
              </p>
            </div>
          ) : sectionResources.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No documents currently uploaded in the {activeTab} section.
            </div>
          ) : (
            <>
              {/* Quick Action Helpers */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {sectionResources.length} Total Files in {activeTab}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAllowAllSection(activeTab)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Allow All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={() => handleRevokeAllSection(activeTab)}
                    className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Revoke All
                  </button>
                </div>
              </div>

              {/* Document List */}
              <div className="space-y-2.5">
                {sectionResources.map((doc) => {
                  const allowed = isFileAllowed(doc._id);
                  const expiry = fileExpiryMap[doc._id.toString()];

                  return (
                    <div
                      key={doc._id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        allowed
                          ? 'bg-white border-slate-200 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/60 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3 truncate pr-4">
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            allowed
                              ? activeTab === 'projects'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold text-sm truncate ${allowed ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                              {doc.title}
                            </p>
                            {allowed && formatFileExpiry(expiry)}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                            <span>{doc.category}</span>
                            <span>•</span>
                            <span className={allowed ? 'text-emerald-600 font-medium' : 'text-rose-500 font-medium'}>
                              {allowed ? 'Visible to Employee' : 'Access Denied'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* File Controls: Prominent Clock Icon & Toggle */}
                      <div className="shrink-0 flex items-center gap-2">
                        {allowed && (
                          <button
                            type="button"
                            title="Set temporary time limit for this document"
                            onClick={() => setFileDurationModal({ isOpen: true, doc })}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                          >
                            <Clock className="h-5 w-5" />
                          </button>
                        )}
                        <ToggleSwitch
                          checked={allowed}
                          activeColor={activeTab === 'projects' ? 'bg-blue-600' : 'bg-emerald-600'}
                          labelOn="Allowed"
                          labelOff="Revoked"
                          onChange={(isChecked) => handleToggleFile(doc._id, isChecked)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {revokedIds.length === 0
              ? '✨ Full access: Employee can view all files in this section.'
              : `⚠️ ${revokedIds.length} document(s) specifically restricted.`}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || loading}
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {saving ? 'Saving...' : 'Apply File Permissions'}
            </button>
          </div>
        </div>
      </div>

      {/* File Expiry Modal */}
      {fileDurationModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Set Document Expiry</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">
                    {fileDurationModal.doc?.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFileDurationModal({ isOpen: false, doc: null })}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Specify how long this specific document remains accessible to <b>{user.name}</b>:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSetFileDuration(5)}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 text-xs font-semibold text-amber-900 transition-colors flex justify-between items-center"
              >
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>5 Minutes (Live Testing Demo)</span>
                </span>
                <span className="text-[10px] bg-amber-200/60 text-amber-800 px-1.5 py-0.5 rounded font-bold">Fast Test</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetFileDuration(24 * 60)}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors flex justify-between items-center"
              >
                <span>24 Hours (1 Day Temporary)</span>
                <span className="text-[10px] text-slate-400">Quick Trial</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetFileDuration(7 * 24 * 60)}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors flex justify-between items-center"
              >
                <span>7 Days (1 Week)</span>
                <span className="text-[10px] text-slate-400">Sprint Review</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetFileDuration(30 * 24 * 60)}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 transition-colors flex justify-between items-center"
              >
                <span>30 Days (1 Month)</span>
                <span className="text-[10px] text-slate-400">Monthly Access</span>
              </button>
              <button
                type="button"
                onClick={() => handleSetFileDuration(null)}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-xs font-semibold text-slate-700 transition-colors flex justify-between items-center"
              >
                <span className="text-emerald-700 font-bold">Permanent Access (No Expiration)</span>
                <span className="text-[10px] text-emerald-600 font-medium">Standard</span>
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setFileDurationModal({ isOpen: false, doc: null })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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

export default FileAccessModal;
