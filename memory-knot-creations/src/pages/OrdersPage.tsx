import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { LogOut, Package, Calendar, CreditCard, ChevronRight, CheckCircle, Clock, Truck, ShieldAlert, User, ArrowLeft, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_CONFIG } from '@/config';

const OrdersPage = () => {
  const { token, logout, isLoading: authLoading } = useUser();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const hasCustomizations = order.items?.some((item: any) => item.customImage || item.customNote);

                  return (
                    <div
                      key={order.id}
                      className="p-5 border border-border/60 rounded-2xl hover:border-primary/10 hover:shadow-sm transition-all duration-300"
                    >
                      {/* Order Summary Header (Clickable) */}
                      <div 
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40 cursor-pointer select-none"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-black text-foreground font-body">Order #{order.id ? order.id.slice(-8).toUpperCase() : ''}</span>
                            {getStatusBadge(order.status || 'PENDING')}
                          </div>
                          <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-body mt-1.5">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : ''}</span>
                            <span className="flex items-center gap-1"><CreditCard size={10} /> ₹{(order.totalAmount || 0).toLocaleString()}</span>
                            <span className="text-primary font-bold">{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {order.trackingId && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/track-order?id=${order.id}`);
                              }}
                              className="px-3.5 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/10 text-primary font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                              Track Shipment <ChevronRight size={10} />
                            </button>
                          )}
                          <div className="p-1 hover:bg-secondary rounded-full text-muted-foreground">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Section */}
                      {isExpanded && (
                        <div className="pt-6 space-y-6">
                          {/* Live Delivery Steps Stepper */}
                          <div className="bg-[#FDFBF9] border border-border/40 p-5 rounded-2xl">
                            <h4 className="font-heading font-bold text-xs text-foreground mb-4 uppercase tracking-wider">Live Delivery Status</h4>
                            <div className="flex items-center justify-between relative max-w-md mx-auto pt-2">
                              {/* Connector Line */}
                              <div className="absolute top-[17px] left-8 right-8 h-1 bg-border/40 -z-10" />
                              <div 
                                className="absolute top-[17px] left-8 h-1 bg-primary/50 -z-10 transition-all duration-500" 
                                style={{ 
                                  width: order.status === 'DELIVERED' || order.status === 'COMPLETED' ? '100%' : 
                                         order.status === 'SHIPPED' ? '66%' : 
                                         order.status === 'APPROVED' ? '33%' : '0%' 
                                }}
                              />

                              {/* Step 1: Placed */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                                  order.status !== 'CANCELLED' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-border text-muted-foreground'
                                }`}>
                                  ✓
                                </div>
                                <span className="text-[9px] font-bold mt-2 text-foreground font-body">Placed</span>
                              </div>

                              {/* Step 2: Preparing / Crafting */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                                  order.status === 'APPROVED' || order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                    ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-border text-muted-foreground'
                                }`}>
                                  {order.status === 'APPROVED' ? '⌛' : '✓'}
                                </div>
                                <span className="text-[9px] font-bold mt-2 text-foreground font-body">Crafting</span>
                              </div>

                              {/* Step 3: Shipped */}
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                                  order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'COMPLETED'
                                    ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-border text-muted-foreground'
                                }`}>
                                  ✓
                                </div>
                                <span className="text-[9px] font-bold mt-2 text-foreground font-body">Shipped</span>
                              </div>
                            </div>

                            {/* Address details */}
                            <div className="mt-5 pt-4 border-t border-border/40 text-[10px] text-muted-foreground font-body">
                              <p><strong className="text-foreground font-heading">Shipping Address:</strong> {order.address}</p>
                            </div>
                          </div>

                          {/* Product Customizations & Status */}
                          <div className="space-y-4">
                            <h4 className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">Item Customizations</h4>
                            
                            {order.items?.map((item: any) => {
                              const itemStatus = (item.status || 'PENDING').toUpperCase();

                              return (
                                <div 
                                  key={item.id} 
                                  className="p-4 rounded-xl border border-border/50 bg-[#FCFAF7] flex flex-col md:flex-row gap-4"
                                >
                                  {/* Item metadata */}
                                  <div className="flex items-center gap-3 md:w-1/3">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-white shrink-0">
                                      <img
                                        src={item.product?.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=80'}
                                        alt={item.product?.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="font-heading font-bold text-xs text-foreground truncate">{item.product?.name}</h5>
                                      <p className="text-[9px] text-muted-foreground font-body">Qty: {item.quantity} × ₹{(item.price || 0).toLocaleString()}</p>
                                    </div>
                                  </div>

                                  {/* Production status badge */}
                                  <div className="flex items-center shrink-0 md:justify-center md:w-1/4">
                                    {itemStatus === 'COMPLETED' ? (
                                      <span className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-[9px] font-bold rounded-full uppercase">
                                        Completed
                                      </span>
                                    ) : itemStatus === 'IN_PROGRESS' ? (
                                      <span className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-bold rounded-full uppercase animate-pulse">
                                        Crafting
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 bg-gray-50 border border-border text-muted-foreground text-[9px] font-bold rounded-full uppercase">
                                        Queued
                                      </span>
                                    )}
                                  </div>

                                  {/* Customization Details Uploaded */}
                                  <div className="flex-1 min-w-0 text-[10px] text-muted-foreground font-body bg-white p-3 rounded-lg border border-border/40 flex flex-col gap-3">
                                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 bg-secondary/5 rounded-xl border border-border/10">
                                      {(() => {
                                        let imageUrls: string[] = [];
                                        if (item.customImage) {
                                          if (item.customImage.startsWith('[')) {
                                            try {
                                              imageUrls = JSON.parse(item.customImage);
                                            } catch {
                                              imageUrls = [item.customImage];
                                            }
                                          } else {
                                            imageUrls = [item.customImage];
                                          }
                                        }

                                        return imageUrls.length > 0 ? (
                                          imageUrls.map((url, uIdx) => (
                                            <div key={uIdx} className="w-12 h-12 rounded overflow-hidden border border-green-200 shrink-0 relative group bg-white">
                                              <img src={url} className="w-full h-full object-cover" alt="Custom upload" />
                                              <a 
                                                href={url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                              >
                                                <ExternalLink size={10} />
                                              </a>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="w-12 h-12 rounded border border-dashed border-border flex items-center justify-center text-muted-foreground/30 shrink-0">
                                            📷
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    
                                    <div className="border-t border-border/30 pt-2">
                                      <p className="font-semibold text-foreground text-[9px] uppercase tracking-wider mb-0.5">Engraving / Custom Note:</p>
                                      <p className="italic text-foreground/80 leading-relaxed text-[10px]">
                                        {item.customNote ? `"${item.customNote}"` : "No special instructions provided."}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Trigger Customizations button */}
                          {!hasCustomizations && (
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={() => navigate(`/customize/${order.id}`)}
                                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all"
                              >
                                Upload Photos & Notes
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
