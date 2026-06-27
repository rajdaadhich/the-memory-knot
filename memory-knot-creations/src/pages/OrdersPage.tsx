import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { LogOut, Package, Calendar, CreditCard, ChevronRight, CheckCircle, Clock, Truck, ShieldAlert, User, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/config';

const OrdersPage = () => {
  const { token, logout, isLoading: authLoading } = useUser();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    // Auth guard
    if (!authLoading && !token) {
      navigate('/login', { replace: true });
    }
  }, [token, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (token) {
        try {
          const data = await api.getUserOrders(token);
          setOrders(data);
        } catch {
          toast.error("Failed to load your orders");
        } finally {
          setOrdersLoading(false);
        }
      }
    };
    fetchOrders();
  }, [token]);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'COMPLETED' || s === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase rounded-full border border-green-200">
          <CheckCircle size={10} /> {status}
        </span>
      );
    }
    if (s === 'SHIPPED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-full border border-blue-200">
          <Truck size={10} /> {status}
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded-full border border-red-200">
          <ShieldAlert size={10} /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase rounded-full border border-amber-200 animate-pulse">
        <Clock size={10} /> {status}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>My Orders | {SITE_CONFIG.name}</title>
      </Helmet>

      <div className="min-h-screen bg-[#F8F3EE] flex flex-col justify-between">
        <Navbar />

        <main className="max-w-4xl mx-auto w-full px-4 lg:px-8 py-12 flex-1">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary mb-3 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Profile
              </button>
              <h1 className="font-heading text-4xl lg:text-5xl font-black text-foreground">Order History</h1>
              <p className="text-xs text-muted-foreground mt-1 font-body">Track status, details, and past purchases</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-2.5 bg-white border border-border/80 hover:border-primary/20 hover:text-primary rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <User size={14} /> My Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  toast.success("Signed out successfully");
                  navigate('/');
                }}
                className="px-5 py-2.5 bg-white border border-border/80 hover:border-red-200 hover:text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          {/* Orders list container */}
          <div className="bg-white rounded-3xl border border-border/60 shadow-card p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-primary" size={22} />
              <h2 className="font-heading text-xl font-bold text-foreground">All Orders</h2>
            </div>

            {ordersLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <p className="text-xs text-muted-foreground font-body">Loading your order history...</p>
              </div>
            ) : (!Array.isArray(orders) || orders.length === 0) ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mx-auto text-muted-foreground/60">
                  <Package size={28} />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-foreground">No orders found</h4>
                  <p className="text-xs text-muted-foreground font-body max-w-xs mx-auto mt-1">Once you complete a purchase, your order history and live tracking details will display here.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 border border-border/60 rounded-2xl hover:border-primary/20 hover:shadow-soft transition-all duration-300 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-foreground font-body">Order #{order.id ? order.id.slice(-6).toUpperCase() : ''}</span>
                          {getStatusBadge(order.status || 'PENDING')}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-body mt-1">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}</span>
                          <span className="flex items-center gap-1"><CreditCard size={10} /> ₹{(order.totalAmount || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      {order.trackingId && (
                        <button
                          onClick={() => navigate(`/track-order?id=${order.id}`)}
                          className="self-start sm:self-auto px-4 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          Track Shipment <ChevronRight size={10} />
                        </button>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="pt-4 space-y-3">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-border/60 bg-secondary/10 shrink-0">
                            <img
                              src={item.product?.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=80'}
                              alt={item.product?.name || 'Handcrafted Gift'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="font-heading font-bold text-xs text-foreground truncate">{item.product?.name || 'Gift Selection'}</h5>
                            <p className="text-[10px] text-muted-foreground font-body">Qty: {item.quantity || 0} × ₹{(item.price || 0).toLocaleString()}</p>
                          </div>
                          <span className="text-xs font-bold text-foreground font-body ml-auto">₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default OrdersPage;
