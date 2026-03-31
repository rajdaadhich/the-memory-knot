import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await api.adminLogin(password);
      localStorage.setItem('admin_token', token);
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-elevated border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Lock size={24} />
          </div>
          <h1 className="font-heading text-2xl font-bold">Admin Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your password to continue</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium ml-1">Admin Password</label>
            <input
              type="password"
              className="w-full p-3.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
