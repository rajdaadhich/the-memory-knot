import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Heart, ArrowLeft } from 'lucide-react';
import { SITE_CONFIG } from '@/config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const frontendUrl = window.location.origin;
      const res = await api.forgotPassword(email, frontendUrl);
      toast.success(res.message || 'If that email exists, a reset link was sent.');
      navigate('/admin');
    } catch {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F3EE] px-4">
      <div className="fixed top-0 left-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(347,52%,70%) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(34,60%,70%) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Heart size={24} className="text-primary" fill="currentColor" />
            <span className="font-heading text-xl font-bold text-foreground">{SITE_CONFIG.name}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-elevated border border-border/60 p-8">
          <div className="flex flex-col items-center mb-7">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <Mail size={24} />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground text-center">Forgot Password</h1>
            <p className="text-muted-foreground text-xs mt-2 font-body text-center leading-relaxed">
              Enter your admin email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <input
                type="email"
                className="w-full p-3.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body text-sm"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3.5 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-soft"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-secondary text-foreground rounded-lg font-medium font-body hover:bg-secondary/80 transition-colors border border-border"
            >
              <ArrowLeft size={16} /> Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
