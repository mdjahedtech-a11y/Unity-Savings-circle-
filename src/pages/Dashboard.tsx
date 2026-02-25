import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { Member, Payment, DashboardStats } from '@/types';
import { generateMockMembers, generateMockPayments } from '@/lib/mockData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Users, TrendingUp, AlertCircle, Wallet } from 'lucide-react';
import { differenceInMonths, startOfMonth } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [memberRanking, setMemberRanking] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let members: Member[] = [];
      let payments: Payment[] = [];

      if (isSupabaseConfigured && supabase) {
        const { data: membersData } = await supabase.from('members').select('*');
        const { data: paymentsData } = await supabase.from('payments').select('*');
        members = membersData || [];
        payments = paymentsData || [];
      } else {
        // Use mock data
        members = generateMockMembers();
        payments = generateMockPayments(members);
      }

      // Calculate stats
      const totalMembers = members.length;
      const totalSavings = payments.reduce((sum, p) => sum + p.amount_paid, 0);
      const totalLateFees = payments.reduce((sum, p) => sum + p.late_fee, 0);
      
      // Calculate due
      let totalExpected = 0;
      const today = new Date();
      
      members.forEach(m => {
        const joinDate = new Date(m.join_date);
        const monthsSinceJoin = differenceInMonths(startOfMonth(today), startOfMonth(joinDate)) + 1;
        // Ensure non-negative
        const monthsToPay = Math.max(0, monthsSinceJoin);
        totalExpected += monthsToPay * m.monthly_amount;
      });

      const totalDue = Math.max(0, totalExpected - totalSavings);
      
      const collectionRate = totalExpected > 0 ? (totalSavings / totalExpected) * 100 : 0;

      setStats({
        totalMembers,
        totalSavings,
        totalDue,
        totalLateFees,
        collectionRate
      });

      // Prepare chart data (Monthly Growth)
      const monthlyData = payments.reduce((acc: any, payment) => {
        const month = payment.month.substring(0, 7); // YYYY-MM
        if (!acc[month]) acc[month] = { name: month, total: 0 };
        acc[month].total += payment.total_paid;
        return acc;
      }, {});
      
      setChartData(Object.values(monthlyData).sort((a: any, b: any) => a.name.localeCompare(b.name)));

      // Prepare member ranking
      const ranking = members.map(m => {
        const paid = payments.filter(p => p.member_id === m.id).reduce((sum, p) => sum + p.total_paid, 0);
        return { name: m.name, paid };
      }).sort((a, b) => b.paid - a.paid).slice(0, 5);
      
      setMemberRanking(ranking);

    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Overview of your savings circle performance.</p>
      </div>

      {!isSupabaseConfigured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle size={18} />
            <span>Demo Mode Active</span>
          </div>
          <p className="mt-1 text-sm">
            Supabase keys are missing. Showing mock data. Connect Supabase in <code>.env</code> to go live.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card gradient className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-indigo-100">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">{formatCurrency(stats?.totalSavings || 0)}</div>
            <p className="mt-2 text-indigo-100/80">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Members</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalMembers}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {stats?.collectionRate.toFixed(1)}% collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(stats?.totalDue || 0)}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Includes late fees: {formatCurrency(stats?.totalLateFees || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatCurrency(value), 'Collected']}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Savers</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberRanking} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="paid" radius={[0, 4, 4, 0]} barSize={32}>
                  {memberRanking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
