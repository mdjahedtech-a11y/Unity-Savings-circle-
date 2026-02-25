import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Member, Payment } from '@/types';
import { generateMockMembers, generateMockPayments } from '@/lib/mockData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Plus, Filter, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { AddPaymentModal } from '@/components/AddPaymentModal';
import { Toaster } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data: paymentsData, error } = await supabase
          .from('payments')
          .select('*, member:members(name)')
          .order('payment_date', { ascending: false });
        
        if (error) throw error;
        setPayments(paymentsData || []);
      } else {
        const members = generateMockMembers();
        const mockPayments = generateMockPayments(members);
        // Sort by date desc
        setPayments(mockPayments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()));
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <AddPaymentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchPayments} 
      />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400">Track deposits and late fees.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter size={18} />
            Filter
          </Button>
          {isAdmin && (
            <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={18} />
              New Payment
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Member</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Month</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Date Paid</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading payments...</td>
                </tr>
              ) : payments.map((payment) => (
                <tr key={payment.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {payment.member?.name || 'Unknown Member'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {format(new Date(payment.month), 'MMMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {format(new Date(payment.payment_date), 'dd MMM, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(payment.total_paid)}
                      </span>
                      {payment.late_fee > 0 && (
                        <span className="text-xs text-rose-500">
                          Includes {formatCurrency(payment.late_fee)} late fee
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {payment.late_fee > 0 ? (
                      <Badge variant="warning" className="gap-1">
                        <AlertTriangle size={10} />
                        Late
                      </Badge>
                    ) : (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 size={10} />
                        On Time
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
