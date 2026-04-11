import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Heart, ShieldCheck, Truck, RotateCcw, Plane, Package, Zap, CheckCircle2, Smartphone, ExternalLink, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { SITE_CONFIG, API_BASE_URL } from '@/config';
import { QRCodeSVG } from 'qrcode.react';

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Delivery', price: 199, timeline: '6-7 Days', icon: Truck },
  { id: 'bulky', name: 'Big/Bulky Order', price: 300, timeline: '7-8 Days', icon: Package },
  { id: 'express', name: 'Express Speed', price: 399, timeline: '2-3 Days', icon: Zap },
  { id: 'air', name: 'Express By Air', price: 600, timeline: 'Lightning Fast', icon: Plane }
];

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, clearCart, isCartOpen, setIsCartOpen, totalPrice } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Shipping, 3: Payment
  const [isPaid, setIsPaid] = useState(false);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);

  // Calculate final total including shipping
  const finalTotal = totalPrice + selectedShipping.price;
  
  // UPI Deep Link Generation
  const upiId = SITE_CONFIG.upiId || "7073691168@ptsbi";
  const upiName = SITE_CONFIG.upiName || "Raj Dadhich";
  // Generic UPI Link
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${finalTotal}&cu=INR&tn=Order-TheMemoryKnot`;
  
  // App-Specific Deep Links (Best for Mobile)
  const phonepeUrl = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${finalTotal}&cu=INR`;
  const gpayUrl = `googlepay://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${finalTotal}&cu=INR`;
  const paytmUrl = `paytmmpay://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${finalTotal}&cu=INR`;

  // Fix: Robust Scroll Lock
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      // Reset checkout when closing
      setTimeout(() => {
        setCheckoutStep(1);
        setIsPaid(false);
        setIsWaitingForConfirmation(false);
      }, 300);
    }
  }, [isCartOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalCheckout = async () => {
    setIsSubmitting(true);
    try {
      // Send Odrer to Backend
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: shippingInfo.name,
          customerPhone: shippingInfo.phone,
          address: shippingInfo.address,
          totalAmount: finalTotal,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        })
      });

      if (!response.ok) throw new Error("Failed to place order");

      setIsPaid(true);
      clearCart();
      
      setTimeout(() => {
        setIsCartOpen(false);
      }, 4000);
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Failed to confirm order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiatePayment = (customUrl?: string) => {
    // Open the UPI link
    window.open(customUrl || upiUrl, '_self');
    
    // Move to waiting view instead of finalizing
    setIsWaitingForConfirmation(true);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div 
          key="cart-drawer-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          className="fixed inset-0 z-[9999] flex justify-end overflow-hidden focus:outline-none"
        >
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <motion.div
            key="cart-drawer-content"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-[#F8F3EE]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground leading-tight">Your Gift Box</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-body font-bold">
                    {items.length} {items.length === 1 ? 'item' : 'items'} • step {checkoutStep} of 3
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-black/5 rounded-full transition-colors group"
                aria-label="Close cart"
              >
                <X size={20} className="text-muted-foreground group-hover:text-foreground group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>

            {/* Steps Progress */}
            <div className="flex h-1.5 w-full bg-secondary/50">
              <div className={`h-full bg-primary transition-all duration-500 ${checkoutStep === 1 ? 'w-1/3' : checkoutStep === 2 ? 'w-2/3' : 'w-full'}`} />
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground/30">
                    <ShoppingBag size={40} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground">Your box is empty</h3>
                    <p className="text-muted-foreground text-sm font-body mt-2 max-w-[240px] mx-auto">
                      Fill it with beautiful memories and handcrafted love.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="btn-primary text-sm mt-4 px-8"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {checkoutStep === 1 ? (
                    /* Step 1: Cart Items */
                    <div className="space-y-4">
                      {items.map((item) => (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4 p-3 rounded-xl bg-secondary/20 border border-border/40 group relative overflow-hidden"
                        >
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-border/60">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="font-heading font-bold text-foreground text-sm truncate pr-6">{item.name}</h4>
                              <p className="text-primary font-bold mt-0.5">₹{item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center bg-white rounded-full border border-border/80 shadow-sm overflow-hidden p-0.5">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 px-2 hover:bg-secondary/50 text-muted-foreground transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-8 text-center text-xs font-bold font-body">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 px-2 hover:bg-secondary/50 text-muted-foreground transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="absolute top-2 right-2 p-1.5 text-muted-foreground/40 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}

                      {/* Upsell/Info area */}
                      <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <h5 className="font-heading font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-2 mb-2">
                          <RotateCcw size={12} /> Easy Returns & Exchange
                        </h5>
                        <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
                          We take pride in our crafts. If your gift arrives damaged, we'll replace it instantly within 48 hours.
                        </p>
                      </div>
                    </div>
                  ) : checkoutStep === 2 ? (
                    /* Step 2: Shipping Info */
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="font-heading text-lg font-bold text-foreground border-l-4 border-primary pl-3">Delivery Details</h3>
                        <div className="space-y-4 mt-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                            <input
                              type="text"
                              name="name"
                              value={shippingInfo.name}
                              onChange={handleInputChange}
                              placeholder="Who is receiving the love?"
                              className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp No.</label>
                            <input
                              type="tel"
                              name="phone"
                              value={shippingInfo.phone}
                              onChange={handleInputChange}
                              placeholder="For delivery updates"
                              className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Shipping Address</label>
                            <textarea
                              name="address"
                              value={shippingInfo.address}
                              onChange={handleInputChange}
                              rows={3}
                              placeholder="Where should we deliver?"
                              className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4 Custom Shipping Tiers */}
                      <div className="space-y-4">
                        <h3 className="font-heading text-lg font-bold text-foreground border-l-4 border-primary pl-3">Select Delivery Method</h3>
                        <div className="grid grid-cols-1 gap-3 mt-4">
                          {SHIPPING_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            const isSelected = selectedShipping.id === option.id;
                            return (
                              <button
                                key={option.id}
                                onClick={() => setSelectedShipping(option)}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left ${
                                  isSelected 
                                    ? 'bg-primary/5 border-primary shadow-sm' 
                                    : 'bg-white border-border/60 hover:border-primary/40'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-secondary/50 text-muted-foreground'}`}>
                                  <Icon size={20} />
                                </div>
                                <div className="flex-1">
                                  <h4 className={`text-sm font-bold font-heading ${isSelected ? 'text-primary' : 'text-foreground'}`}>{option.name}</h4>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">{option.timeline}</p>
                                </div>
                                <div className="text-right">
                                  <p className={`font-black ${isSelected ? 'text-primary' : 'text-foreground'}`}>₹{option.price}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Step 3: Payment */
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <h3 className="font-heading text-2xl font-bold text-foreground">Secure Payment</h3>
                        <p className="text-sm text-muted-foreground font-body">Pay safely using any UPI app</p>
                      </div>

                      {/* Display Total prominently */}
                      <div className="bg-primary/5 p-6 rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest px-3 py-1 bg-white rounded-full shadow-sm">Total Payable</span>
                          <span className="text-[10px] text-muted-foreground font-body">{selectedShipping.name} included</span>
                        </div>
                        <span className="text-4xl font-heading font-black text-primary">₹{finalTotal.toLocaleString()}</span>
                      </div>

                      {isPaid ? (
                        <div className="py-10 text-center space-y-4">
                          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <ShieldCheck size={40} />
                          </div>
                          <div>
                            <h4 className="font-heading text-xl font-bold text-foreground">Order Received!</h4>
                            <p className="text-sm text-muted-foreground mt-1 px-6">Thank you for your trust. We're starting to prepare your handcrafted gift.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {isWaitingForConfirmation ? (
                            <div className="space-y-6">
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/20 text-center space-y-4"
                              >
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                                  <Smartphone size={32} className="animate-bounce" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-heading text-lg font-bold text-foreground">Waiting for Payment</h4>
                                  <p className="text-xs text-muted-foreground font-body">Please finish the payment in your UPI app and then return here.</p>
                                </div>
                              </motion.div>

                              <button
                                onClick={handleFinalCheckout}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-primary text-white rounded-xl font-bold font-heading shadow-soft flex items-center justify-center gap-2 hover:bg-primary/95 transition-all text-lg"
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="animate-spin" size={20} /> Confirming...
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck size={20} /> I Have Paid
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => setIsWaitingForConfirmation(false)}
                                className="w-full py-2 text-xs text-muted-foreground font-bold uppercase tracking-widest hover:text-primary transition-colors"
                              >
                                Try another method / Back
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-8">
                              {/* Direct App Buttons */}
                              <div className="space-y-4">
                                <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest">Open via App</p>
                                <div className="grid grid-cols-3 gap-3">
                                  {[
                                    { name: 'GPay', url: gpayUrl, color: 'hover:bg-blue-50 hover:border-blue-200' },
                                    { name: 'PhonePe', url: phonepeUrl, color: 'hover:bg-purple-50 hover:border-purple-200' },
                                    { name: 'Paytm', url: paytmUrl, color: 'hover:bg-cyan-50 hover:border-cyan-200' },
                                  ].map((app) => (
                                    <button
                                      key={app.name}
                                      onClick={() => initiatePayment(app.url)}
                                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-border/60 bg-white transition-all duration-300 ${app.color} group`}
                                    >
                                      <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ExternalLink size={18} className="text-muted-foreground group-hover:text-primary" />
                                      </div>
                                      <span className="text-[10px] font-bold font-heading uppercase">{app.name}</span>
                                    </button>
                                  ))}
                                </div>
                                <button 
                                  onClick={() => initiatePayment()}
                                  className="w-full text-[10px] text-center text-primary font-bold hover:underline"
                                >
                                  Or use any other UPI app
                                </button>
                              </div>

                              {/* Payment Slider - Visible on all devices */}
                              <div className="space-y-4 pt-2">
                                <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest">Or Swipe to initiate</p>
                                <div className="relative w-full h-16 bg-secondary/30 rounded-full border border-border/60 overflow-hidden p-1.5 shadow-inner">
                                  <motion.div
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 300 }}
                                    dragElastic={0.05}
                                    onDragEnd={(_, info) => {
                                      if (info.offset.x > 100) {
                                        initiatePayment();
                                      }
                                    }}
                                    className="absolute left-1.5 top-1.5 h-[52px] w-16 bg-primary rounded-full shadow-lg flex items-center justify-center text-white cursor-grab active:cursor-grabbing z-10"
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <ArrowRight size={24} className="animate-pulse-gentle" />
                                  </motion.div>
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-sm font-bold text-primary/40 uppercase tracking-widest pl-12 font-body">Swipe for UPI</span>
                                  </div>
                                </div>
                              </div>

                              {/* Fallback for Desktop/Issue cases */}
                              <div className="flex flex-col items-center gap-3 border-t border-border/40 pt-6">
                                <p className="text-[10px] text-muted-foreground font-body">Issues with apps? Use this ID:</p>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(upiId);
                                    alert(`UPI ID Copied: ${upiId}`);
                                  }}
                                  className="text-xs font-bold text-primary border border-primary/20 bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-all flex items-center gap-2"
                                >
                                  <ShieldCheck size={14} /> Copy UPI ID: {upiId}
                                </button>
                              </div>

                              {/* QR Code - Optional Fallback for Desktop */}
                              <div className="hidden md:flex flex-col items-center gap-4 py-4 border-t border-border/40 mt-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-border/40">
                                  <QRCodeSVG value={upiUrl} size={120} />
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Or Scan to Pay</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Summary (Only in Cart/Shipping Step) */}
            {items.length > 0 && !isPaid && (
              <div className="p-5 border-t border-border/60 space-y-4 bg-white">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground font-body">
                    <span>Products Subtotal</span>
                    <span className="font-semibold text-foreground">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {checkoutStep >= 2 && (
                    <div className="flex justify-between text-sm text-muted-foreground font-body">
                      <span>{selectedShipping.name}</span>
                      <span className="font-semibold text-foreground">₹{selectedShipping.price}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-heading font-black pt-2 border-t border-border/40">
                    <span className="text-foreground">Total Payable</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {checkoutStep === 2 ? (
                  <button
                    onClick={() => setCheckoutStep(3)}
                    disabled={!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address}
                    className="w-full py-3.5 bg-primary text-white disabled:bg-muted disabled:text-muted-foreground rounded-xl font-bold font-body shadow-soft transition-all active:scale-[0.98] active:shadow-inner"
                  >
                    Proceed to Secure Payment
                  </button>
                ) : checkoutStep === 1 ? (
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold font-body shadow-soft flex items-center justify-center gap-2 hover:bg-primary/95 transition-all active:scale-[0.98]"
                  >
                    Continue to Delivery <ArrowRight size={18} />
                  </button>
                ) : null}

                <p className="text-center text-[10px] text-muted-foreground font-body flex items-center justify-center gap-1">
                  <Heart size={10} className="text-primary" fill="currentColor" />
                  Made with love, delivered with care
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
