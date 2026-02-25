import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Member } from '@/types';
import { generateMockMembers } from '@/lib/mockData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Plus, Search, Phone, Calendar, MoreVertical, Users } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { AddMemberModal } from '@/components/AddMemberModal';
import { Toaster } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.from('members').select('*').order('name');
        if (error) throw error;
        setMembers(data || []);
      } else {
        setMembers(generateMockMembers());
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery)
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'warning': return 'warning';
      case 'defaulter': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <AddMemberModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchMembers} 
      />
      
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Members</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your saving group members.</p>
        </div>
        {isAdmin && (
          <Button className="shrink-0 gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} />
            Add Member
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Members Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group relative overflow-hidden transition-all hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-900">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-100 bg-indigo-100 dark:border-gray-800 dark:bg-indigo-900/50">
                        {member.photo_url ? (
                          <img 
                            src={member.photo_url} 
                            alt={member.name} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={12} />
                          {member.phone}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                      <MoreVertical size={16} />
                    </Button>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Joined</span>
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Calendar size={12} />
                        {format(new Date(member.join_date), 'MMM yyyy')}
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(member.status) as any}>
                      {member.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No members found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search or add a new member.</p>
          </div>
        )}
      </div>
    </div>
  );
}
