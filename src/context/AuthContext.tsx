import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

type UserRole = 'super_admin' | 'admin' | 'member';

interface User {
  phone: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  checkUserType: (phone: string) => Promise<'admin' | 'member' | 'not_found'>;
  login: (phone: string, pin?: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('savings_app_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const checkUserType = async (phone: string): Promise<'admin' | 'member' | 'not_found'> => {
    if (!isSupabaseConfigured || !supabase) {
      // Demo mode checks
      if (phone === '01580824066') return 'admin';
      // In demo mode, any other number is treated as a member for simplicity, 
      // or we could check against mock data. Let's assume valid mock numbers.
      if (phone.startsWith('01')) return 'member'; 
      return 'not_found';
    }

    try {
      // Check if Admin
      const { data: adminData } = await supabase
        .from('app_users')
        .select('phone')
        .eq('phone', phone)
        .single();
      
      if (adminData) return 'admin';

      // Check if Member
      const { data: memberData } = await supabase
        .from('members')
        .select('phone')
        .eq('phone', phone)
        .single();

      if (memberData) return 'member';

      return 'not_found';
    } catch (error) {
      console.error('Error checking user type:', error);
      return 'not_found';
    }
  };

  const login = async (phone: string, pin?: string) => {
    try {
      if (!isSupabaseConfigured || !supabase) {
        // Mock login
        if (phone === '01580824066' && pin === '123456') {
          const mockAdmin: User = { phone, name: 'Main Admin', role: 'super_admin' };
          setUser(mockAdmin);
          localStorage.setItem('savings_app_user', JSON.stringify(mockAdmin));
          toast.success('Welcome back, Admin!');
          return true;
        }
        // Mock Member Login
        if (phone.startsWith('01') && !pin) {
           const mockMember: User = { phone, name: 'Demo Member', role: 'member' };
           setUser(mockMember);
           localStorage.setItem('savings_app_user', JSON.stringify(mockMember));
           toast.success('Welcome, Member!');
           return true;
        }
        return false;
      }

      // 1. Try Admin Login (requires PIN)
      if (pin) {
        const { data, error } = await supabase
          .from('app_users')
          .select('*')
          .eq('phone', phone)
          .eq('pin', pin)
          .single();

        if (!error && data) {
          const loggedInUser: User = {
            phone: data.phone,
            name: data.name,
            role: data.role as UserRole,
          };
          setUser(loggedInUser);
          localStorage.setItem('savings_app_user', JSON.stringify(loggedInUser));
          toast.success(`Welcome back, ${data.name}!`);
          return true;
        }
      }

      // 2. Try Member Login (No PIN required, just phone check)
      // Only do this if no PIN was provided OR if admin login failed (optional logic, but let's separate)
      // Actually, if PIN is provided, we assume they are trying to be admin.
      // If NO PIN, we check member table.
      
      if (!pin) {
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .eq('phone', phone)
          .single();

        if (!error && data) {
          const loggedInUser: User = {
            phone: data.phone,
            name: data.name,
            role: 'member',
          };
          setUser(loggedInUser);
          localStorage.setItem('savings_app_user', JSON.stringify(loggedInUser));
          toast.success(`Welcome, ${data.name}!`);
          return true;
        }
      }

      toast.error('Login failed. Please check your credentials.');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('savings_app_user');
    toast.success('Logged out successfully');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, checkUserType, login, logout, isAdmin, isSuperAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
