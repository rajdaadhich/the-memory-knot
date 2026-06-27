import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Heart, Mail, User, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { SITE_CONFIG } from '@/config';
import { Helmet } from 'react-helmet-async';

const LoginPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login, register, loginWithGoogle } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Load Google GSI Client script
  useEffect(() => {
    if (!googleClientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [googleClientId]);

  // Initialize and render the official Google Button if client ID is set
  useEffect(() => {
    if (!googleClientId) return;

    const renderGoogleBtn = () => {
      const container = document.getElementById('google-signin-button');
      if (container && (window as any).google) {
        container.innerHTML = '';
        const width = Math.min(window.innerWidth - 64, 380);

        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });

        (window as any).google.accounts.id.renderButton(
          container,
          { theme: 'outline', size: 'large', width: width, shape: 'rectangular' }
        );
      } else {
        setTimeout(renderGoogleBtn, 100);
      }
    };

    renderGoogleBtn();

    window.addEventListener('resize', renderGoogleBtn);
    return () => window.removeEventListener('resize', renderGoogleBtn);
  }, [googleClientId, isLoginMode]);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    toast.loading('Signing in with Google...', { id: 'google-auth' });
    try {
      await loginWithGoogle(response.credential);
      toast.success('Signed in successfully with Google!', { id: 'google-auth' });
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed', { id: 'google-auth' });
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLoginMode) {
      if (!name) tempErrors.name = 'Full name is required';
      if (phone && !/^\d{10}$/.test(phone)) {
        tempErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    if (field === 'name') setName(value);
    if (field === 'phone') setPhone(value);
    if (field === 'address') setAddress(value);

    // Clear specific error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isLoginMode) {
        await login({ email, password });
        toast.success('Signed in successfully!');
        navigate(from, { replace: true });
      } else {
        await register({ name, email, password, phone, address });
        toast.success('Account created successfully!');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    toast.loading('Redirecting to Google OAuth...', { id: 'google-auth' });
    
    try {
      // Simulate Google authentication delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockGoogleUser = {
        name: 'Google Tester',
        email: 'google.tester@gmail.com',
        password: 'google_oauth_mock_password'
      };

      try {
        // Try registering the mock Google user
        await register(mockGoogleUser);
        toast.success('Successfully connected with Google & registered!', { id: 'google-auth' });
      } catch (err: any) {
        // If already registered, log them in
        if (err.message?.includes('already registered')) {
          await login({ email: mockGoogleUser.email, password: mockGoogleUser.password });
          toast.success('Signed in successfully with Google!', { id: 'google-auth' });
        } else {
          throw err;
        }
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed', { id: 'google-auth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isLoginMode ? 'Login' : 'Register'} | {SITE_CONFIG.name}</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-[#F8F3EE] px-4 py-12 relative overflow-hidden">
        {/* Elegant blur backgrounds */}
        <div className="fixed top-0 left-0 w-[40rem] h-[40rem] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(347,52%,70%) 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="fixed bottom-0 right-0 w-[40rem] h-[40rem] rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(34,60%,70%) 0%, transparent 70%)', filter: 'blur(100px)' }} />

        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-body"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="relative w-full max-w-md space-y-6">
          {/* Logo & Headline */}
          <div className="text-center">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 mb-2 focus:outline-none">
              <Heart size={28} className="text-primary" fill="currentColor" />
              <span className="font-heading text-2xl font-bold text-foreground tracking-wide">{SITE_CONFIG.name}</span>
            </button>
            <p className="text-xs text-muted-foreground font-body">{SITE_CONFIG.tagline}</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-elevated border border-border/50 p-6 sm:p-8 lg:p-10 relative overflow-hidden transition-all duration-300">
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl font-black text-foreground">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground text-xs font-body mt-1">
                {isLoginMode ? 'Sign in to access your dashboard' : 'Join us to save details and track orders'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name (Only in Register Mode) */}
              {!isLoginMode && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Receiver's name"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 text-sm font-body shadow-sm ${
                        errors.name ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 ml-1 font-body">{errors.name}</p>}
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 text-sm font-body shadow-sm ${
                      errors.email ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 ml-1 font-body">{errors.email}</p>}
              </div>

              {/* WhatsApp / Phone (Only in Register Mode) */}
              {!isLoginMode && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp / Phone</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                      <Phone size={18} />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="10-digit number"
                      maxLength={10}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 text-sm font-body shadow-sm ${
                        errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 ml-1 font-body">{errors.phone}</p>}
                </div>
              )}

              {/* Default Address (Only in Register Mode) */}
              {!isLoginMode && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Default Address (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-muted-foreground/50">
                      <MapPin size={18} />
                    </span>
                    <textarea
                      value={address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Shipping address for future orders"
                      rows={2}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 text-sm font-body shadow-sm ${
                      errors.password ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 ml-1 font-body">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-primary text-white rounded-xl font-bold font-body hover:bg-primary/95 transition-all shadow-soft flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : isLoginMode ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-x-0 h-px bg-border/60" />
              <span className="relative px-3 bg-white text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 z-10">Or connect with</span>
            </div>

            {/* Google OAuth Button */}
            {googleClientId ? (
              <div className="w-full flex justify-center py-1">
                <div id="google-signin-button" className="w-full max-w-[380px] flex justify-center"></div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 border border-border/85 bg-white hover:bg-secondary/20 rounded-xl text-xs font-bold text-foreground transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            )}

            {/* Mode Switcher */}
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground font-body">
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setErrors({});
                  }}
                  className="font-bold text-primary hover:underline ml-1"
                >
                  {isLoginMode ? 'Register Now' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
