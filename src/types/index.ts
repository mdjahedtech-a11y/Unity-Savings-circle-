export type MemberStatus = 'active' | 'inactive' | 'warning' | 'defaulter';

export interface Member {
  id: string;
  name: string;
  phone: string;
  join_date: string;
  monthly_amount: number;
  status: MemberStatus;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  member_id: string;
  payment_date: string;
  month: string; // ISO date string for the month paid (e.g., "2023-10-01")
  expected_amount: number;
  amount_paid: number;
  missed_months: number;
  late_fee: number;
  penalty_reason?: string;
  total_paid: number;
  created_at: string;
  member?: Member; // Joined data
}

export interface DashboardStats {
  totalMembers: number;
  totalSavings: number;
  totalDue: number;
  totalLateFees: number;
  collectionRate: number;
}
