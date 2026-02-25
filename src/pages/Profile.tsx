import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'; // Need to create this or use simple img
import { toast } from 'sonner';
import { Camera, Upload, User as UserIcon, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;
    
    setLoading(true);
    try {
      const table = isAdmin ? 'app_users' : 'members';
      const { data, error } = await supabase
        .from(table)
        .select('photo_url')
        .eq('phone', user.phone)
        .single();

      if (error) throw error;
      if (data?.photo_url) {
        setAvatarUrl(data.photo_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.phone}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        toast.error('Storage is not configured (Demo Mode)');
        return;
      }

      // 1. Upload image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update User Profile
      const table = isAdmin ? 'app_users' : 'members';
      const { error: updateError } = await supabase
        .from(table)
        .update({ photo_url: publicUrl })
        .eq('phone', user?.phone);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Profile photo updated!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Profile</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account settings and photo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-gray-800">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <UserIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full bg-indigo-600 p-2 text-white shadow-lg transition-transform hover:scale-110 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                disabled={uploading}
              >
                <Camera size={18} />
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Member'}</p>
            </div>
          </div>

          <div className="space-y-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                <p className="font-medium text-gray-900 dark:text-white">{user?.phone}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Account Type</label>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
