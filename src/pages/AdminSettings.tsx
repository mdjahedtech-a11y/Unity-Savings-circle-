import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';
import { Trash2, UserPlus, ShieldAlert } from 'lucide-react';

interface AppUser {
  phone: string;
  name: string;
  role: string;
  created_at: string;
}

export default function AdminSettings() {
  const { isSuperAdmin, user } = useAuth();
  const [admins, setAdmins] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdmin, setNewAdmin] = useState({ name: '', phone: '', pin: '' });

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('app_users')
          .select('*')
          .in('role', ['admin', 'super_admin'])
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setAdmins(data || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('app_users').insert([
          {
            phone: newAdmin.phone,
            name: newAdmin.name,
            pin: newAdmin.pin,
            role: 'admin',
          },
        ]);

        if (error) throw error;
        toast.success('New admin added successfully');
        setNewAdmin({ name: '', phone: '', pin: '' });
        fetchAdmins();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add admin');
    }
  };

  const handleRemoveAdmin = async (phone: string) => {
    if (!isSuperAdmin) return;
    if (phone === '01580824066') {
      toast.error('Cannot remove Super Admin');
      return;
    }

    if (!confirm('Are you sure you want to remove this admin?')) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('app_users').delete().eq('phone', phone);
        if (error) throw error;
        toast.success('Admin removed successfully');
        fetchAdmins();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove admin');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="mb-4 h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-gray-500">Only the Super Admin can access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Management</h1>
        <p className="text-gray-500 dark:text-gray-400">Add or remove administrators.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add Admin Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input
                  required
                  type="text"
                  className="w-full rounded-xl border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  required
                  type="tel"
                  className="w-full rounded-xl border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Set PIN</label>
                <input
                  required
                  type="text"
                  className="w-full rounded-xl border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={newAdmin.pin}
                  onChange={(e) => setNewAdmin({ ...newAdmin, pin: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full gap-2">
                <UserPlus size={18} />
                Add Admin
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin List */}
        <Card>
          <CardHeader>
            <CardTitle>Current Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : admins.length === 0 ? (
                <p className="text-center text-gray-500">No admins found.</p>
              ) : (
                admins.map((admin) => (
                  <div key={admin.phone} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 dark:border-gray-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">{admin.name}</span>
                        {admin.role === 'super_admin' && (
                          <Badge variant="success" className="text-[10px]">SUPER</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{admin.phone}</div>
                    </div>
                    {admin.role !== 'super_admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                        onClick={() => handleRemoveAdmin(admin.phone)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
