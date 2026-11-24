import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

const PdfPreviewModal = ({ isOpen, onClose, doc }) => {
  if (!isOpen || !doc) return null;

  // Resolve URL: if relative path like /uploads/..., prepend API base or use directly
  const resolveUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fileUrl = resolveUrl(doc.fileUrl);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 truncate pr-4">
            <div className="h-9 w-9 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-base text-white truncate">{doc.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span className="capitalize">{doc.section} Section</span>
                <span>•</span>
                <span className="text-blue-300 font-medium">{doc.category}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {fileUrl && (
              <>
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Open Tab</span>
                </a>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Close Preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-100 relative">
          {fileUrl ? (
            <iframe
              src={`${fileUrl}#toolbar=1&view=FitH`}
              title={doc.title}
              className="w-full h-full border-0"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <FileText className="h-12 w-12 text-slate-400 mb-3" />
              <p className="font-semibold text-slate-700">No document file attached</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                This resource entry currently does not have a PDF link configured.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
