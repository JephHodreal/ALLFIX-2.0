import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';
import { Card } from './Card';

interface EditField {
  key: string;
  label: string;
  type?: 'text' | 'tel';
  placeholder?: string;
}

interface EditModalProps {
  title: string;
  fields: EditField[];
  initialData: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  onClose: () => void;
  children?: React.ReactNode;
}

export function EditModal({ title, fields, initialData, onSave, onClose, children }: EditModalProps) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init: Record<string, any> = {};
    fields.forEach(f => { init[f.key] = initialData[f.key] || ''; });
    setForm(init);
  }, [initialData]);

  const handleSave = async () => {
    setError('');
    // Basic validation
    for (const f of fields) {
      if (!form[f.key]?.toString().trim()) {
        setError(`${f.label} is required`);
        return;
      }
      if (f.type === 'tel' && !/^\d{11}$/.test(form[f.key].replace(/\D/g, ''))) {
        setError(`${f.label} must be 11 digits`);
        return;
      }
    }
    setSaving(true);
    try {
      await onSave(form);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Save failed');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}
            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={form[f.key] || ''}
                    onChange={e => {
                      let val = e.target.value;
                      if (['first_name', 'last_name'].includes(f.key) && val.length > 0) {
                        val = val.charAt(0).toUpperCase() + val.slice(1);
                      }
                      setForm({ ...form, [f.key]: val });
                    }}
                    placeholder={f.placeholder || f.label}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none transition-all"
                  />
                </div>
              ))}
              {children}
            </div>
            <div className="flex gap-3 pt-6">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button variant="success" className="flex-1" onClick={handleSave} loading={saving} icon={<Save className="w-4 h-4" />}>Save Changes</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
