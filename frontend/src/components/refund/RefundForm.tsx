import React, { useState } from 'react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import api from '../../services/apiService';

interface RefundFormProps {
  bookingId: string;
  customerId: string;
  onSuccess?: () => void;
}

export function RefundForm({ bookingId, customerId, onSuccess }: RefundFormProps) {
  const [reason, setReason] = useState('');
  const [deduction, setDeduction] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/api/refunds', {
        booking_id: bookingId, customer_id: customerId,
        reason, deduction_amount: parseFloat(deduction) || 0, admin_note: note,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process refund.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Process Refund</h3>
      {error && <div className="mb-4 p-3 rounded-xl bg-brand-red/10 text-brand-red text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input-base" rows={3} placeholder="Reason for refund" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deduction Amount (₱)</label>
          <input type="number" min="0" step="0.01" value={deduction} onChange={(e) => setDeduction(e.target.value)} className="input-base" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Notes</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="input-base" rows={2} placeholder="Additional notes" />
        </div>
        <Button type="submit" loading={loading} variant="danger" className="w-full">Submit Refund</Button>
      </form>
    </Card>
  );
}
