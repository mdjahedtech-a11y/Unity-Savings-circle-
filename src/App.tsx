import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar, BottomNav } from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Members from '@/pages/Members';
import Payments from '@/pages/Payments';
import Reports from '@/pages/Reports';
import Login from '@/pages/Login';
import AdminSettings from '@/pages/AdminSettings';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />
          <Route path="/members" element={
            <ProtectedLayout>
              <Members />
            </ProtectedLayout>
          } />
          <Route path="/payments" element={
            <ProtectedLayout>
              <Payments />
            </ProtectedLayout>
          } />
          <Route path="/reports" element={
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          } />
          <Route path="/admin" element={
            <ProtectedLayout>
              <AdminSettings />
            </ProtectedLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
