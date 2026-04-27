import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Truck, Search, ArrowRight, Package, CheckCircle2, Clock, MapPin, ShoppingBag, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/config';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const TrackOrderPage = () => {
  const [trackingQuery, setTrackingQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;

    setIsSearching(true);
    setOrder(null);
    
    try {
      const data = await api.trackOrder(trackingQuery.trim());
      if (data) {
        setOrder(data);
      } else {
        toast.error("Order not found. Please check your Tracking ID or Order ID.");
      }
    } catch (error) {
      toast.error("Failed to fetch tracking details. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { id: 'PENDING', label: 'Order Placed', icon: ShoppingBag, desc: 'We have received your order' },
      { id: 'APPROVED', label: 'Processing', icon: Package, desc: 'Your gift is being handcrafted' },
      { id: 'SHIPPED', label: 'Shipped', icon: Truck, desc: 'On its way to you via Trackon' },
      { id: 'COMPLETED', label: 'Delivered', icon: CheckCircle2, desc: 'Memories delivered successfully' },
    ];

    const currentIdx = steps.findIndex(s => s.id === status);
    // If status is not in list (like CANCELLED), handle accordingly
    if (status === 'CANCELLED') {
      return [{ id: 'CANCELLED', label: 'Cancelled', icon: CheckCircle2, desc: 'This order has been cancelled', active: true, completed: false }];
    }

    return steps.map((step, idx) => ({
      ...step,
      active: idx === currentIdx,
      completed: idx <= currentIdx,
    }));
  };

  return (
    <>
      <Helmet>
        <title>Track Your Order | {SITE_CONFIG.name}</title>
        <meta name="description" content={`Track your handcrafted gift shipment from ${SITE_CONFIG.name}. Enter your Trackon tracking ID to see real-time updates.`} />
      </Helmet>

      <div className="min-h-screen bg-[#F8F3EE]">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full text-primary mb-6"
            >
              <Truck size={32} />
            </motion.div>
            <h1 className="font-heading text-4xl font-bold text-foreground mb-4">Track Your Memories</h1>
            <p className="text-muted-foreground font-body max-w-md mx-auto leading-relaxed">
              Enter your Order ID or Tracking ID to check the current status of your handcrafted gifts.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 lg:p-10 shadow-card border border-border/40"
            >
              <form onSubmit={handleTrack} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Tracking or Order ID</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Search size={20} />
                    </div>
                    <input
                      type="text"
                      required
                      value={trackingQuery}
                      onChange={(e) => setTrackingQuery(e.target.value)}
                      placeholder="e.g. clx..."
                      className="w-full pl-12 pr-4 py-5 bg-[#F8F3EE] border border-transparent focus:border-primary/30 focus:bg-white rounded-2xl outline-none text-lg font-body transition-all shadow-inner focus:ring-4 focus:ring-primary/5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSearching || !trackingQuery.trim()}
                  className="w-full py-5 bg-primary text-white rounded-2xl font-bold font-heading text-lg shadow-soft flex items-center justify-center gap-3 hover:bg-primary/95 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </div>
                  ) : (
                    <>
                      Track Order <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            <AnimatePresence mode="wait">
              {order && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  {/* Status Banner */}
                  <div className="bg-primary text-white rounded-3xl p-6 shadow-elevated flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Current Status</p>
                      <h2 className="text-2xl font-heading font-bold">
                        {order.status === 'PENDING' && "Waiting for Verification"}
                        {order.status === 'APPROVED' && "Being Handcrafted"}
                        {order.status === 'SHIPPED' && "Out for Delivery"}
                        {order.status === 'COMPLETED' && "Delivered Successfully"}
                        {order.status === 'CANCELLED' && "Order Cancelled"}
                      </h2>
                    </div>
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      <Package size={32} />
                    </div>
                  </div>

                  {/* Amazon Style Timeline */}
                  <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-card border border-border/40">
                    <div className="space-y-8">
                      {getStatusSteps(order.status).map((step, idx, arr) => (
                        <div key={step.id} className="relative flex gap-6">
                          {/* Line */}
                          {idx !== arr.length - 1 && (
                            <div className={`absolute left-6 top-10 w-0.5 h-12 -translate-x-1/2 ${step.completed ? 'bg-primary' : 'bg-secondary'}`} />
                          )}
                          
                          {/* Circle */}
                          <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                            step.completed ? 'bg-primary text-white shadow-lg' : 'bg-secondary text-muted-foreground'
                          }`}>
                            <step.icon size={20} />
                            {step.completed && !step.active && (
                              <div className="absolute -right-1 -top-1 bg-white rounded-full p-0.5">
                                <CheckCircle2 size={12} className="text-primary" fill="currentColor" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="pt-1">
                            <h3 className={`font-heading font-bold text-lg ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </h3>
                            <p className="text-sm text-muted-foreground font-body mt-0.5">{step.desc}</p>
                            {step.active && order.trackingId && (
                              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                <Truck size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Tracking ID: {order.trackingId}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-card border border-border/40 flex items-start gap-4">
                      <div className="bg-secondary p-3 rounded-2xl text-muted-foreground">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Shipping Address</p>
                        <p className="text-sm font-body text-foreground leading-relaxed">{order.address}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-card border border-border/40 flex items-start gap-4">
                      <div className="bg-secondary p-3 rounded-2xl text-muted-foreground">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Order Date</p>
                        <p className="text-sm font-body text-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Order ID: {order.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Guidelines */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: 'Tracking Updates', text: 'It may take 24-48 hours for tracking info to appear after shipping.' },
              { icon: CheckCircle2, title: 'Secure Delivery', text: 'All our shipments are insured and handled with extreme care.' },
              { icon: Package, title: 'Original Packaging', text: 'Your gifts arrive in premium, shock-proof artisan packaging.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-center space-y-3"
              >
                <div className="w-10 h-10 bg-white shadow-soft rounded-full flex items-center justify-center mx-auto text-primary">
                  <item.icon size={18} />
                </div>
                <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TrackOrderPage;
