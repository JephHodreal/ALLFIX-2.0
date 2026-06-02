import React, { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import api from '../../services/apiService';

interface PaymentUploadFormProps {
  bookingId: string;
  onSuccess?: () => void;
}

export function PaymentUploadForm({ bookingId, onSuccess }: PaymentUploadFormProps) {
  const [reference, setReference] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) { setError('Please enter a payment reference number.'); return; }
    setError(''); setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('paymentReference', reference);
      if (file) formData.append('proofFile', file);
      await api.post('/api/payments/upload-proof', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Upload Payment Proof</h3>
      {error && <div className="mb-4 p-3 rounded-xl bg-brand-red/10 text-brand-red text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference Number</label>
          <div className="relative"><FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={reference} onChange={(e) => setReference(e.target.value)} className="input-base pl-10" placeholder="Enter reference number" required /></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Proof of Payment</label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-brand-navy dark:hover:border-brand-green transition-colors">
            <Upload className="w-6 h-6 text-slate-400 mb-2" />
            <span className="text-sm text-slate-500">{file ? file.name : 'Click to upload image'}</span>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
        </div>
        <Button type="submit" loading={loading} className="w-full">Submit Payment Proof</Button>
      </form>
    </Card>
  );
}
