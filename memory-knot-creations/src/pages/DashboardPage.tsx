import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { User, LogOut, Package, MapPin, Calendar, CreditCard, ChevronRight, Edit2, CheckCircle, Clock, Truck, ShieldAlert, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/config';

const DashboardPage = () => {
  const { user, token, logout, updateProfile, isLoading: authLoading } = useUser();
  const navigate = useNavigate();

  // Edit profile modal states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Auth guard
    if (!authLoading && !token) {
      navigate('/login', { replace: true });
    }
  }, [token, authLoading, navigate]);

  // Pre-fill profile edit fields when edit modal opens
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, isEditing]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F3EE]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <p className="text-sm text-muted-foreground font-body">Loading Account...</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name, phone, address });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Account | {SITE_CONFIG.name}</title>
      </Helmet>

      <div className="min-h-screen bg-[#F8F3EE] flex flex-col justify-between">
        <Navbar />

        <main className="max-w-6xl mx-auto w-full px-4 lg:px-8 py-12 flex-1">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div>
              <h1 className="font-heading text-4xl lg:text-5xl font-black text-foreground">My Account</h1>
              <p className="text-xs text-muted-foreground mt-1 font-body">Manage your profile and track order updates</p>
            </div>
            <button
              onClick={() => {
                logout();
                toast.success("Signed out successfully");
                navigate('/');
              }}
              className="self-start md:self-auto px-5 py-2.5 bg-white border border-border/80 hover:border-red-200 hover:text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Profile Summary Panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-3xl border border-border/60 shadow-card p-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary/40 to-primary" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading text-xl font-bold border border-primary/20 shadow-inner">
                    {(user?.name || '').split(' ').map(n => n[0] || '').join('').toUpperCase().substring(0, 2) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground leading-snug">{user?.name || 'User'}</h3>
                    <p className="text-[10px] text-muted-foreground font-body leading-none">{user?.email || ''}</p>
                  </div>
                </div>

                <div className="border-t border-border/50 py-5 space-y-4 font-body text-xs text-foreground/80">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground/60 shrink-0"><User size={16} /></span>
                    <span className="font-semibold text-foreground">Member since:</span>
                    <span className="text-muted-foreground ml-auto">June 2026</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground/60 shrink-0"><Mail size={16} /></span>
                    <span className="font-semibold text-foreground">Email Address:</span>
                    <span className="text-muted-foreground ml-auto">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground/60 shrink-0"><Calendar size={16} /></span>
                    <span className="font-semibold text-foreground">WhatsApp Number:</span>
                    <span className="text-muted-foreground ml-auto">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-muted-foreground/60 shrink-0 mt-0.5"><MapPin size={16} /></span>
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">Delivery Address:</span>
                      <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed pr-2">
                        {user.address || 'No address saved yet'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-4 py-3 bg-secondary/50 hover:bg-secondary/80 border border-border/40 text-foreground font-bold rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Edit2 size={12} /> Edit Details
                </button>
              </div>
            </div>

            {/* Right: Premium Navigation Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-border/60 shadow-card p-6 lg:p-8">
                <div className="mb-6">
                  <h2 className="font-heading text-xl font-bold text-foreground">Account Overview</h2>
                  <p className="text-xs text-muted-foreground font-body mt-1">Select an option to manage your orders or explore our handcrafted catalog.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* My Orders Card */}
                  <button
                    onClick={() => navigate('/orders')}
                    className="flex flex-col items-start text-left p-6 border border-border/60 hover:border-primary/25 rounded-2xl hover:shadow-soft transition-all duration-300 group bg-[#F8F3EE]/30"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/10">
                      <Package size={20} />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      My Orders <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-body leading-relaxed">Track shipping status, view items, and browse your purchase history.</p>
                  </button>

                  {/* Shop Creations Card */}
                  <button
                    onClick={() => navigate('/shop')}
                    className="flex flex-col items-start text-left p-6 border border-border/60 hover:border-primary/25 rounded-2xl hover:shadow-soft transition-all duration-300 group bg-[#F8F3EE]/30"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/10">
                      <User size={20} />
                    </div>
                    <h3 className="font-heading font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-1.5">
                      Shop Creations <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-body leading-relaxed">Explore our unique custom scrapbooks, pop-up frames, and gift boxes.</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-border/40 w-full max-w-md p-6 lg:p-8 animate-fadeIn">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Edit Profile</h2>
            <p className="text-xs text-muted-foreground font-body mb-5">Update your default contact and shipping details</p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  maxLength={10}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Default Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Complete shipping address"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 bg-secondary/50 hover:bg-secondary border border-border/60 rounded-xl text-xs font-bold text-foreground uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-soft transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;
