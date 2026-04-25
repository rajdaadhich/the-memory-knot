import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Heart } from 'lucide-react';
import { SITE_CONFIG } from '@/config';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token } = await api.adminLogin(username, password);
      localStorage.setItem('admin_token', token);
      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } catch {
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F3EE] px-4">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(347,52%,70%) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(34,60%,70%) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Heart size={24} className="text-primary" fill="currentColor" />
            <span className="font-heading text-xl font-bold text-foreground">{SITE_CONFIG.name}</span>
          </div>
          <p className="text-xs text-muted-foreground font-body">{SITE_CONFIG.tagline}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-elevated border border-border/60 p-8">
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Lock size={24} />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Admin Login</h1>
            <p className="text-muted-foreground text-xs mt-1 font-body">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</label>
              <input
                type="text"
                id="admin-username"
                className="w-full p-3.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body text-sm"
                placeholder="Admin1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                <button
                  type="button"
                  onClick={() => navigate('/admin/forgot-password')}
                  className="text-xs font-medium text-primary hover:underline hover:text-primary/80 transition-colors font-body"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="admin-password"
                  className="w-full p-3.5 pr-12 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              id="admin-login-btn"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-soft"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground font-body mt-4">
          © 2026 {SITE_CONFIG.name}
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
