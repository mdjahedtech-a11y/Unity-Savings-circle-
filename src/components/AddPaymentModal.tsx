import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { Member } from '@/types';
import { generateMockMembers } from '@/lib/mockData';
import { format } from 'date-fns';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPaymentModal({ isOpen, onClose, onSuccess }: AddPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({
    member_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    month: new Date().toISOString().slice(0, 7) + '-01', // YYYY-MM-01
    amount_paid: 1000,
    late_fee: 0,
    penalty_reason: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  const loadMembers = async () => {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('members').select('*').order('name');
      setMembers(data || []);
    } else {
      setMembers(generateMockMembers());
    }
  };

  // Auto-calculate late fee suggestion
  useEffect(() => {
    const day = new Date(formData.payment_date).getDate();
    if (day > 15) {
      // Simple logic: if paying after 15th, suggest late fee
      // Real logic would check missed months count from DB
      setFormData(prev => ({ ...prev, late_fee: 100, penalty_reason: 'Late Payment (>15th)' }));
    } else {
      setFormData(prev => ({ ...prev, late_fee: 0, penalty_reason: '' }));
    }
  }, [formData.payment_date]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('payments').insert([
          {
            member_id: formData.member_id,
            payment_date: formData.payment_date,
            month: formData.month,
            expected_amount: 1000, // Should fetch from member
            amount_paid: formData.amount_paid,
            late_fee: formData.late_fee,
            penalty_reason: formData.penalty_reason,
          },
        ]);

        if (error) throw error;
        toast.success('Payment recorded successfully');
        onSuccess();
        onClose();
      } else {
        toast.error('Cannot record payment in demo mode');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Member</label>
            <select
              required
              className="w-full rounded-xl border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
            >
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Date</label>
              <input
                required
                type="date"
                className="w-full rounded-xl border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">For Month</label>
              <input
                required
                type="month"
                className="w-full rounded-xl border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={formData.month.slice(0, 7)}
                onChange={(e) => setFormData({ ...formData, month: e.target.value + '-01' })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (BDT)</label>
            <input
              required
              type="number"
              className="w-full rounded-xl border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={formData.amount_paid}
              onChange={(e) => setFormData({ ...formData, amount_paid: parseInt(e.target.value) })}
            />
          </div>

          <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Late Fee</label>
              <div className="flex items-center gap-2">
                {formData.late_fee > 0 && <AlertTriangle size={14} className="text-amber-500" />}
                <input
                  type="number"
                  className="w-24 rounded-lg border border-gray-300 p-2 text-right text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={formData.late_fee}
                  onChange={(e) => setFormData({ ...formData, late_fee: parseInt(e.target.value) })}
                />
              </div>
            </div>
            {formData.late_fee > 0 && (
              <input
                type="text"
                placeholder="Reason (e.g. Late Payment)"
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white p-2 text-xs dark:border-gray-700 dark:bg-gray-900"
                value={formData.penalty_reason}
                onChange={(e) => setFormData({ ...formData, penalty_reason: e.target.value })}
              />
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
