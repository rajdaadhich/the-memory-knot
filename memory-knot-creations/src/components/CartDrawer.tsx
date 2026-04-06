import { useState, useRef } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowLeft, Heart, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/config';

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1); // 1: Cart, 2: Shipping, 3: Payment
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', shipping: '199' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);


  const shippingMethods: Record<string, string> = {
    '199': 'Standard (6-7 Days)',
    '300': 'Big Orders (7-8 Days)',
    '399': 'Express Delivery',
    '600': 'Express by Air'
  };

  const currentShippingCost = Number(formData.shipping);
  const finalTotal = totalPrice + currentShippingCost;
  const upiLink = `upi://pay?pa=${SITE_CONFIG.upiId}&pn=${SITE_CONFIG.upiName}&am=${finalTotal}&cu=INR&tn=Order_TheMemoryKnot`;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCheckoutStep(3);
  };

  const handleFinalCheckout = async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        totalAmount: finalTotal,
        items: items.map(item => ({ id: item.id, quantity: item.quantity, price: item.price }))
      };
      
      const res = await api.createOrder(orderData);
      const orderId = res.order.id;
      const shippingName = shippingMethods[formData.shipping] || 'Standard';

      const message = `*NEW ORDER - THE MEMORY KNOT* 🎁\n---------------------------\n*Order ID:* ${orderId.slice(0, 8)}\n*Customer:* ${formData.name}\n*Phone:* ${formData.phone}\n*Delivery:* ${shippingName} (₹${currentShippingCost})\n\n*Items:*\n${items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')}\n\n*TOTAL AMOUNT:* ₹${finalTotal}\n*PAYMENT STATUS:* ✅ Paid via UPI (QR Code)\n---------------------------\nThank you for your order!`;
      
      const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      clearCart();
      setIsCartOpen(false);
      setCheckoutStep(1);
      window.open(whatsappUrl, '_blank');
      toast.success('Order placed successfully!');
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          key="cart-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/25 backdrop-blur-sm z-50"
          style={{ pointerEvents: isCartOpen ? 'auto' : 'none' }}
          onClick={() => setIsCartOpen(false)}
        />
      )}
      {isCartOpen && (
        <motion.div
          key="cart-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ pointerEvents: isCartOpen ? 'auto' : 'none' }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-elevated flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-[#F8F3EE]">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2 text-foreground">
                {checkoutStep === 2 ? (
                  <>
                    <button onClick={() => setCheckoutStep(1)} className="mr-1 hover:text-primary transition-colors">
                      <ArrowLeft size={18} />
                    </button>
                    Delivery Details
                  </>
                ) : checkoutStep === 3 ? (
                  <>
                    <button onClick={() => setCheckoutStep(2)} className="mr-1 hover:text-primary transition-colors">
                      <ArrowLeft size={18} />
                    </button>
                    Secure Payment
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} className="text-primary" />
                    Your Cart ({totalItems})
                  </>
                )}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 hover:text-primary transition-colors text-foreground/50">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {checkoutStep === 2 ? (
                <form id="shipping-form" onSubmit={handleNextStep} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                    <input
                      required type="text"
                      className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp No. *</label>
                      <input
                        required type="tel"
                        className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email (Optional)</label>
                      <input
                        type="email"
                        className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Shipping Address *</label>
                    <textarea
                      required rows={3}
                      className="w-full p-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 resize-none font-body text-sm"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, City, Pincode, State"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shipping Method *</label>
                    <div className="space-y-2">
                      {Object.entries(shippingMethods).map(([price, label]) => (
                        <label key={price} className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${formData.shipping === price ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              className="w-4 h-4 accent-primary"
                              checked={formData.shipping === price}
                              onChange={() => setFormData({ ...formData, shipping: price })}
                            />
                            <span className="text-sm font-medium text-foreground">{label}</span>
                          </div>
                          <span className="text-sm font-bold text-primary">₹{price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              ) : checkoutStep === 3 ? (
                <div className="space-y-8 flex flex-col items-center">
                  <div className="w-full p-4 bg-[#F8F3EE] rounded-xl border border-primary/20 text-center">
                    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Paying To</p>
                    <p className="font-heading text-lg font-bold text-foreground">{SITE_CONFIG.upiName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{SITE_CONFIG.upiId}</p>
                  </div>

                  {!hasPaid ? (
                    <div className="w-full space-y-6">
                      <div className="text-center space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payable Amount</p>
                        <div className="text-3xl font-bold text-primary">₹{finalTotal.toLocaleString()}</div>
                      </div>

                      <div className="relative w-full h-16 bg-secondary/30 rounded-full border border-border/60 overflow-hidden p-1.5 shadow-inner">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-sm font-bold text-foreground/40 animate-pulse-gentle select-none">
                            Swipe to Pay ₹{finalTotal.toLocaleString()}
                          </span>
                        </div>
                        
                        <motion.div
                          drag="x"
                          dragConstraints={{ left: 0, right: 300 }}
                          dragElastic={0.05}
                          onDragEnd={(_, info) => {
                            if (info.offset.x > 220) {
                              setHasPaid(true);
                              window.location.href = upiLink;
                              toast.success('Opening payment app...');
                            }
                          }}
                          className="relative h-full aspect-square bg-primary rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center text-white shadow-xl z-10"
                        >
                          <ChevronRight size={24} strokeWidth={3} />
                        </motion.div>
                      </div>

                      <div className="flex flex-col gap-2.5 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-center gap-2 text-primary">
                          <CheckCircle2 size={16} />
                          <span className="text-xs font-bold uppercase tracking-wide">SECURE UPI PAYMENT</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Sliding the bar above will automatically open your favorite UPI app (Paytm, GPay, PhonePe) with the exact amount.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-full text-center space-y-6 py-4"
                    >
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-2">
                        <CheckCircle2 size={40} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-heading text-xl font-bold text-foreground">Waiting for Payment</h3>
                        <p className="text-sm text-muted-foreground font-body max-w-[240px] mx-auto">
                          Once your payment is successful in the app, click the button below to record your order.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div className="w-full pt-2">
                    <div className="flex flex-col gap-2 p-3 bg-secondary/50 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                        <span>Status Notification</span>
                      </div>
                      <p className="text-[11px] text-foreground/70 font-medium px-1">
                        We will notify you via <b>WhatsApp</b> and <b>Email</b> as soon as your payment is verified by our team.
                      </p>
                    </div>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
                  <div className="w-20 h-20 bg-primary/8 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-primary/40" />
                  </div>
                  <p className="font-heading text-lg font-semibold text-foreground/60">Your cart is empty</p>
                  <p className="text-sm mt-1 font-body">Add some beautiful gifts!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-3 p-3 rounded-xl bg-[#F8F3EE] border border-border/40"
                    >
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&q=80'}
                        alt={item.name}
                        className="w-18 h-18 object-cover rounded-lg flex-shrink-0"
                        style={{ width: '72px', height: '72px' }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-semibold text-sm truncate text-foreground">{item.name}</h4>
                        <p className="text-primary font-bold text-sm mt-0.5">₹{item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-foreground/30 hover:text-red-500 transition-colors self-start p-1"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-border/60 space-y-4 bg-white">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-heading text-foreground/70">Subtotal</span>
                  <span className="font-heading font-semibold text-foreground/80">₹{totalPrice.toLocaleString()}</span>
                </div>
                {checkoutStep !== 1 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-heading text-foreground/70">Shipping</span>
                    <span className="font-heading font-semibold text-foreground/80">₹{formData.shipping}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <span className="font-heading font-semibold text-foreground">Total Amount</span>
                  <span className="font-heading font-bold text-xl text-primary">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>
                {checkoutStep === 3 ? (
                  <button
                    onClick={handleFinalCheckout}
                    disabled={isSubmitting || !hasPaid}
                    className={`w-full py-3.5 rounded-lg font-bold font-body transition-all flex justify-center items-center gap-2 shadow-card ${!hasPaid ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-[#25D366] text-white hover:opacity-90 active:scale-95'}`}
                  >
                    {isSubmitting ? 'Recording Order...' : '✅ Confirm My Order'}
                  </button>
                ) : checkoutStep === 2 ? (
                  <button
                    type="submit"
                    form="shipping-form"
                    className="w-full py-3.5 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 transition-colors shadow-soft"
                  >
                    Proceed to Payment
                  </button>
                ) : (
                  <button
                    onClick={() => setCheckoutStep(2)}
                    id="proceed-to-checkout"
                    className="w-full py-3.5 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 transition-colors shadow-soft"
                  >
                    Continue to Delivery
                  </button>
                )}
                <p className="text-center text-xs text-muted-foreground font-body flex items-center justify-center gap-1">
                  <Heart size={10} className="text-primary" fill="currentColor" />
                  Made with love, delivered with care
                </p>
              </div>
            )}
          </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
