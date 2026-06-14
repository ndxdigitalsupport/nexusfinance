import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { apiFetch } from '../api';
import EmptyState from './EmptyState';
import Heading from './Heading';

interface Document {
  id: number;
  fileName: string;
  fileType: string;
  docCategory: string;
  uploadedAt: string;
  userEmail: string;
}

const CATEGORIES = [
  { value: 'id', label: 'Government ID' },
  { value: 'tax', label: 'Tax / Business Registration' },
  { value: 'bank', label: 'Bank Statement' },
  { value: 'collateral', label: 'Collateral Document' },
  { value: 'other', label: 'Other' },
];

export default function KYCDocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState('id');
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const loadDocs = async () => {
    const data = await apiFetch('/documents').catch(() => []);
    setDocs(data);
  };

  useEffect(() => { loadDocs(); }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'File too large. Max 5MB.', error: true });
      return;
    }
    setUploading(true);
    setMessage(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        await apiFetch('/documents/upload', {
          method: 'POST',
          body: JSON.stringify({ fileName: file.name, fileType: file.type, fileData: base64, docCategory: category }),
        });
        setMessage({ text: `${file.name} uploaded successfully.` });
        loadDocs();
      } catch (err: any) {
        setMessage({ text: err.message || 'Upload failed.', error: true });
      }
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = async (id: number) => {
    await apiFetch(`/documents/${id}`, { method: 'DELETE' }).catch(() => {});
    loadDocs();
  };

  const handleView = (doc: Document) => {
    window.open(`/api/documents/${doc.id}/view`, '_blank');
  };

  return (
    <div className="animate-content-enter">
      <Heading>KYC Documents</Heading>
      <p className="text-[13px] text-[var(--text-secondary)] mt-1 mb-6">Upload identification, bank statements, and collateral documents for loan applications.</p>

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl p-6">
        <h3 className="text-[14px] font-bold text-[var(--text-primary)] mb-4">Upload Document</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1.5">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-[13px] font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-[var(--text-primary)] font-bold text-[13px] rounded-xl cursor-pointer hover:brightness-110 transition-all disabled:opacity-50">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Choose File'}
            <input type="file" onChange={handleFile} disabled={uploading} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
          </label>
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-2">Accepted: PDF, JPG, PNG, DOC, DOCX (max 5MB)</p>
        {message && (
          <div className={`flex items-center gap-2 mt-3 text-[13px] font-semibold ${message.error ? 'text-[var(--error-text)]' : 'text-emerald-500'}`}>
            {message.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}
      </div>

      <div className="bg-[var(--surface-card)] border border-[var(--border-primary)] rounded-2xl mt-6 overflow-x-auto">
        {docs.length === 0 ? (
          <EmptyState icon={FileText} title="No documents uploaded" description="Upload your KYC documents above to get started." />
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--surface-secondary)] text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold sticky top-0">
                <th className="px-5 py-3.5">File Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Uploaded</th>
                <th className="px-5 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {docs.map((doc) => (
                <tr key={doc.id} className="text-[14px] font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]/70 transition-colors">
                  <td className="px-5 py-3.5 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                    {doc.fileName}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[var(--info-bg)] text-[var(--info-text)]">
                      {CATEGORIES.find(c => c.value === doc.docCategory)?.label || doc.docCategory}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--text-secondary)] text-[13px]">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleView(doc)} className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] rounded-lg transition-colors cursor-pointer" title="View">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="p-1.5 text-[var(--error-text)] hover:bg-[var(--error-bg)] rounded-lg transition-colors cursor-pointer" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
