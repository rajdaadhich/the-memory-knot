import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Truck, Search, ArrowRight, ExternalLink, Package, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/config';

const TrackOrderPage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setIsSearching(true);
    // Trackon tracking via 17track redirect
    setTimeout(() => {
      window.open(`https://www.17track.net/en/track?nums=${trackingId.trim()}`, '_blank');
      setIsSearching(false);
    }, 800);
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
              Enter your tracking ID provided in your shipping email to check the current status of your handcrafted gifts.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 lg:p-12 shadow-card border border-border/40 max-w-2xl mx-auto"
          >
            <form onSubmit={handleTrack} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Trackon Tracking ID</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <Search size={20} />
                  </div>
                  <input
                    type="text"
                    required
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    placeholder="e.g. 123456789"
                    className="w-full pl-12 pr-4 py-5 bg-[#F8F3EE] border border-transparent focus:border-primary/30 focus:bg-white rounded-2xl outline-none text-lg font-body transition-all shadow-inner focus:ring-4 focus:ring-primary/5"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching || !trackingId.trim()}
                className="w-full py-5 bg-primary text-white rounded-2xl font-bold font-heading text-lg shadow-soft flex items-center justify-center gap-3 hover:bg-primary/95 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSearching ? (
                  <>Connecting to Carrier...</>
                ) : (
                  <>
                    Track Shipment <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-border/40">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Package size={16} className="text-primary" /> Delivery Partners
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl border border-border/40">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <Truck size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Trackon Couriers</p>
                    <p className="text-[10px] text-muted-foreground font-body">Our Primary Partner</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl border border-border/40 opacity-60">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <ExternalLink size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Other Partners</p>
                    <p className="text-[10px] text-muted-foreground font-body">SpeedPost / Delhivery</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

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
