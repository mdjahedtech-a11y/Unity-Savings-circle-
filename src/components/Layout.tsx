import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users as UsersIcon, CreditCard, FileText, Settings, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export const BottomNav = () => {
  const location = useLocation();
  const { isSuperAdmin } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: UsersIcon, label: 'Members', path: '/members' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: FileText, label: 'Reports', path: '/reports' },
  ];

  if (isSuperAdmin) {
    navItems.push({ icon: Shield, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 px-4 py-2 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80 md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center space-y-1 rounded-xl px-3 py-2 transition-colors',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: UsersIcon, label: 'Members', path: '/members' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: FileText, label: 'Reports', path: '/reports' },
  ];

  if (isSuperAdmin) {
    navItems.push({ icon: Shield, label: 'Admin Settings', path: '/admin' });
  }

  return (
    <div className="hidden h-screen w-64 flex-col border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950 md:flex">
      <div className="mb-8 flex items-center space-x-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <span className="font-bold">S</span>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">Savings Circle</span>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
        <div className="mb-4 flex items-center space-x-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</span>
            <span className="truncate text-xs text-gray-500">{user?.phone}</span>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2 text-rose-500 hover:text-rose-600" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  );
};
