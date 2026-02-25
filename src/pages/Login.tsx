import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Lock, Phone, LogIn, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'phone' | 'pin'>('phone');
  const [loading, setLoading] = useState(false);
  const { login, checkUserType } = useAuth();
  const navigate = useNavigate();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const userType = await checkUserType(phone);
    setLoading(false);

    if (userType === 'admin') {
      setStep('pin');
    } else if (userType === 'member') {
      // Direct login for members
      const success = await login(phone);
      if (success) navigate('/');
    } else {
      toast.error('Phone number not found in our records.');
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(phone, pin);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-black">
      <Card className="w-full max-w-md border-none shadow-xl dark:bg-gray-900">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
            {step === 'phone' ? (
              <Phone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'phone' ? 'Welcome' : 'Admin Access'}
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 'phone' 
              ? 'Enter your registered phone number' 
              : 'Please enter your admin PIN'}
          </p>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <Button className="w-full gap-2" type="submit" disabled={loading}>
                {loading ? 'Checking...' : 'Continue'}
                {!loading && <ArrowRight size={18} />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  PIN Code
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button className="w-full gap-2" type="submit" disabled={loading}>
                  <LogIn size={18} />
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setStep('phone');
                    setPin('');
                  }}
                >
                  Back to Phone
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
