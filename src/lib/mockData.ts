import { Member, Payment } from '@/types';
import { addDays, format, subMonths, differenceInMonths, startOfMonth } from 'date-fns';

// Mock data generator for demo mode
export const generateMockMembers = (): Member[] => [
  {
    id: '1',
    name: 'Rahim Uddin',
    phone: '01711000000',
    join_date: '2023-01-01',
    monthly_amount: 1000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Karim Hasan',
    phone: '01822000000',
    join_date: '2023-01-15',
    monthly_amount: 1000,
    status: 'warning',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Nasrin Akter',
    phone: '01933000000',
    join_date: '2023-02-01',
    monthly_amount: 2000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Jamal Hossain',
    phone: '01644000000',
    join_date: '2023-03-10',
    monthly_amount: 1000,
    status: 'defaulter',
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Fatima Begum',
    phone: '01555000000',
    join_date: '2023-04-05',
    monthly_amount: 1500,
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

export const generateMockPayments = (members: Member[]): Payment[] => {
  const payments: Payment[] = [];
  const today = new Date();
  
  members.forEach((member) => {
    const joinDate = new Date(member.join_date);
    const monthsSinceJoin = differenceInMonths(today, joinDate);
    
    // Generate payments for each month since join (up to 12 months back)
    const monthsToGenerate = Math.min(monthsSinceJoin, 12);

    for (let i = 0; i < monthsToGenerate; i++) {
      const monthDate = subMonths(startOfMonth(today), i);
      
      // Skip future months or months before join
      if (monthDate < startOfMonth(joinDate)) continue;

      const isPaid = Math.random() > 0.2; // 80% chance of payment
      
      if (isPaid) {
        const isLate = Math.random() > 0.8; // 20% chance of being late
        const lateFee = isLate ? 100 : 0;
        
        // Payment date: if late, 16th-28th. If on time, 1st-10th.
        const dayOffset = isLate ? Math.floor(Math.random() * 12) + 16 : Math.floor(Math.random() * 10) + 1;
        const paymentDate = addDays(monthDate, dayOffset);

        payments.push({
          id: Math.random().toString(36).substr(2, 9),
          member_id: member.id,
          payment_date: format(paymentDate, 'yyyy-MM-dd'),
          month: format(monthDate, 'yyyy-MM-01'),
          expected_amount: member.monthly_amount,
          amount_paid: member.monthly_amount,
          missed_months: 0,
          late_fee: lateFee,
          penalty_reason: isLate ? 'Late Payment' : undefined,
          total_paid: member.monthly_amount + lateFee,
          created_at: new Date().toISOString(),
          member: member
        });
      }
    }
  });
  
  return payments;
};
