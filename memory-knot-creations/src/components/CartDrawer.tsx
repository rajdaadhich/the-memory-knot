import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowLeft, ArrowRight, Heart, ShieldCheck, Truck, RotateCcw, Plane, Package, Zap, CheckCircle2, Smartphone, ExternalLink, Loader2, Scan as LucideScanLine, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { SITE_CONFIG, API_BASE_URL } from '@/config';
import { QRCodeSVG } from 'qrcode.react';
import { Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import paytmLogo from '@/assets/paytm.svg';
import phonepeLogo from '@/assets/phonepe.svg';
import gpayLogo from '@/assets/gpay.svg';

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Delivery', price: 199, timeline: '6-7 Days', icon: Truck },
  { id: 'bulky', name: 'Big/Bulky Order', price: 300, timeline: '7-8 Days', icon: Package },
  { id: 'express', name: 'Express Speed', price: 399, timeline: '2-3 Days', icon: Zap },
  { id: 'air', name: 'Express By Air', price: 600, timeline: 'Lightning Fast', icon: Plane },
  { id: 'special', name: 'Special Delivery', price: 1, timeline: 'As Discussed', icon: Star }
];

const CartDrawer = () => {
  const { items, removeItem, updateQuantity, clearCart, isCartOpen, setIsCartOpen, totalPrice } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Shipping, 3: Payment
  const [isPaid, setIsPaid] = useState(false);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedApp, setSelectedApp] = useState<'paytm' | 'phonepe' | 'gpay'>('paytm');
  const [isQRMode, setIsQRMode] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: ''
  });
  
  // Set default shipping to Standard Delivery (SHIPPING_OPTIONS[0]) 
  // ensuring the select has a solid default value.
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);

  // Calculate final total including shipping
  const finalTotal = totalPrice + selectedShipping.price;
  
  // Device detection for smart deep linking
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // UPI Deep Link Generation
  const upiId = SITE_CONFIG.upiId || "7073691168@ptsbi";
  const upiName = SITE_CONFIG.upiName || "Raj Dadhich";
  
  // Base parameters for UPI (Barebones, to avoid P2P risk filters)
  const baseUpiParams = `pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${finalTotal}&cu=INR`;
  
  // App-specific intent parameters (Omit mode/purpose to act as a basic link)
  const intentParams = `${baseUpiParams}`;
  
  // QR Code parameters (mode=02 for Secure QR Code, tn for transaction note)
  const qrParams = `${baseUpiParams}&mode=02&purpose=00&tn=Order-TheMemoryKnot`;
  
  // Generic UPI Link (for the actual visual QR code)
  const upiUrl = `upi://pay?${qrParams}`;
  
  // App-Specific Deep Links (Revised for iPhone Compatibility and solving ₹2000 limits)
  const phonepeUrl = `phonepe://pay?${intentParams}`;
  // Use 'gpay://' or 'tez://' for Indian GPay on iOS
  const gpayUrl = isIOS ? `gpay://upi/pay?${intentParams}` : `tez://upi/pay?${intentParams}`;
  // Use 'paytmmp://' for Paytm on iOS (more reliable than 'paytm://')
  const paytmUrl = isIOS ? `paytmmp://pay?${intentParams}` : `paytmmpay://pay?${intentParams}`;

  const appLinks = {
    paytm: paytmUrl,
    phonepe: phonepeUrl,
    gpay: gpayUrl
  };

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
          customerEmail: shippingInfo.email,
          customerPhone: shippingInfo.phone,
          address: `${shippingInfo.address}${shippingInfo.pincode ? `, Pincode: ${shippingInfo.pincode}` : ''}`,
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
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Failed to confirm order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiatePayment = (customUrl?: string) => {
    // Determine the target URL
    const targetUrl = customUrl || appLinks[selectedApp];
    
    // Open the UPI link using direct assignment for better iOS reliability
    if (typeof window !== 'undefined') {
      window.location.href = targetUrl;
    }
    
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
                {checkoutStep > 1 ? (
                  <button 
                    onClick={() => setCheckoutStep(checkoutStep - 1)}
                    className="w-10 h-10 -ml-2 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-foreground"
                    aria-label="Go back"
                  >
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <ShoppingBag size={20} />
                  </div>
                )}
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground leading-tight">
                    {checkoutStep === 1 ? 'Your Gift Box' : checkoutStep === 2 ? 'Delivery Address' : 'Secure Payment'}
                  </h2>
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
                      <div className="space-y-3">
                        {items.map((item) => (
                          <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 p-3 rounded-xl bg-secondary/20 border border-border/40 group relative overflow-hidden"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border/60 bg-secondary/30 flex items-center justify-center">
                              <img 
                                src={item.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80'} 
                                alt={item.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="font-heading font-bold text-foreground text-[13px] truncate pr-6">{item.name}</h4>
                                <p className="text-primary font-bold text-xs mt-0.5">₹{item.price.toLocaleString()}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center bg-white rounded-full border border-border/80 shadow-sm overflow-hidden p-0.5 scale-90 -ml-1">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1 px-1.5 hover:bg-secondary/50 text-muted-foreground transition-colors"
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="w-6 text-center text-xs font-bold font-body">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1 px-1.5 hover:bg-secondary/50 text-muted-foreground transition-colors"
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="absolute top-2 right-2 p-1.5 text-muted-foreground/40 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </button>
                          </motion.div>
                        ))}
                      </div>

                      {/* Step 1 Delivery Type Choice */}
                      <div className="space-y-4 pt-4 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <h5 className="font-heading font-bold text-sm text-foreground">Delivery Speed</h5>
                          <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-full">
                            <Truck size={12} /> Fast & Safe
                          </div>
                        </div>
                        <div className="relative">
                          <Select 
                            value={selectedShipping.id}
                            onValueChange={(value) => {
                              const option = SHIPPING_OPTIONS.find(opt => opt.id === value);
                              if (option) setSelectedShipping(option);
                            }}
                          >
                            <SelectTrigger className="w-full bg-white border-border/60 hover:border-primary/40 focus:ring-primary/10 rounded-xl px-4 py-[26px] text-sm font-bold font-heading shadow-sm transition-all focus:ring-2">
                              <SelectValue placeholder="Select Delivery Method" />
                            </SelectTrigger>
                            <SelectContent className="z-[10000] bg-white/95 backdrop-blur-md rounded-xl shadow-xl border-border/40">
                              {SHIPPING_OPTIONS.map((option) => (
                                <SelectItem key={option.id} value={option.id} className="cursor-pointer py-3 rounded-lg focus:bg-primary/5 focus:text-primary transition-colors">
                                  {option.name} (₹{option.price}) - {option.timeline}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Selected Option Explanation Details */}
                        <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-border/40">
                           <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              {selectedShipping.id === 'standard' && <Truck size={16} />}
                              {selectedShipping.id === 'bulky' && <Package size={16} />}
                              {selectedShipping.id === 'express' && <Zap size={16} />}
                              {selectedShipping.id === 'air' && <Plane size={16} />}
                              {selectedShipping.id === 'special' && <Star size={16} />}
                           </div>
                           <div className="flex-1">
                             <p className="text-xs font-bold text-foreground">{selectedShipping.name}</p>
                             <p className="text-[10px] text-muted-foreground leading-tight">{
                                selectedShipping.id === 'standard' ? 'Standard delivery timeline via surface transport.' :
                                selectedShipping.id === 'bulky' ? 'Specialized handling for large/heavy items.' :
                                selectedShipping.id === 'express' ? 'Priority dispatch and delivery.' :
                                selectedShipping.id === 'air' ? 'Premium expedited delivery via air cargo.' :
                                'Custom delivery as mutually discussed. ₹1 only.'
                             }</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  ) : checkoutStep === 2 ? (
                    /* Step 2: Shipping Info (Strictly Address) */
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 border-l-4 border-primary pl-3">
                          <h3 className="font-heading text-lg font-bold text-foreground">Where should we deliver?</h3>
                        </div>
                        <div className="space-y-4 mt-4 bg-secondary/10 p-4 rounded-2xl border border-border/40">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                            <input
                              type="text"
                              name="name"
                              value={shippingInfo.name}
                              onChange={handleInputChange}
                              placeholder="Receiver's name"
                              className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                            <input
                              type="email"
                              name="email"
                              value={shippingInfo.email}
                              onChange={handleInputChange}
                              placeholder="For order updates"
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
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Pincode</label>
                            <input
                              type="text"
                              name="pincode"
                              value={shippingInfo.pincode}
                              onChange={handleInputChange}
                              placeholder="6-digit Pincode"
                              maxLength={6}
                              className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Complete Address</label>
                            <textarea
                              name="address"
                              value={shippingInfo.address}
                              onChange={handleInputChange}
                              rows={3}
                              placeholder="House no, Area, City"
                              className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-body shadow-sm resize-none"
                            />
                          </div>
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

                      <div className="bg-primary/5 p-6 rounded-2xl border-2 border-dashed border-primary/20 flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest px-3 py-1 bg-white rounded-full shadow-sm">Total Payable</span>
                          <span className="text-[10px] text-muted-foreground font-body">{selectedShipping.name} included</span>
                        </div>
                        <span className="text-4xl font-heading font-black text-primary">₹{finalTotal.toLocaleString()}</span>
                      </div>

                      {isPaid ? (
                        <div className="py-10 text-center space-y-5">
                          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <ShieldCheck size={40} />
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-heading text-2xl font-black text-foreground">Thank You!</h4>
                            <div className="text-sm text-muted-foreground px-2 space-y-3 font-body">
                              <p>Thank you for ordering with <strong>The Memory Knot</strong>.</p>
                              <p className="bg-secondary/30 p-3 rounded-lg border border-primary/10 text-xs text-balance text-foreground/80 leading-relaxed">
                                Our team will soon verify your payment. Once confirmed, we will share all the updates and formally confirm your order details via Email and WhatsApp!
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setIsCartOpen(false);
                              setTimeout(() => clearCart(), 300);
                            }}
                            className="mt-6 w-full py-3.5 bg-primary/10 text-primary rounded-xl font-bold font-body hover:bg-primary/20 transition-all active:scale-[0.98]"
                          >
                            Close this window
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {isWaitingForConfirmation ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-6"
                            >
                              <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/20 text-center space-y-4">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                                  <Smartphone size={32} className="animate-bounce" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="font-heading text-lg font-bold text-foreground">Waiting for Payment</h4>
                                  <p className="text-xs text-muted-foreground font-body text-balance">Please finish the payment in your UPI app and then return here to confirm.</p>
                                </div>
                              </div>

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
                                className="w-full py-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest hover:text-primary transition-colors text-center"
                              >
                                Try another method / Back
                              </button>
                            </motion.div>
                          ) : (
                            <AnimatePresence mode="wait">
                              {!isQRMode ? (
                                <motion.div
                                  key="slider-view"
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  className="space-y-6"
                                >
                                  <div className="flex items-center gap-2">
                                    {/* Swipe Slider (Moved to Left) */}
                                    <div className="flex-1 relative h-16 bg-secondary/30 rounded-full border border-border/60 overflow-hidden p-1.5 shadow-inner">
                                      <motion.div
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 140 }}
                                        dragElastic={0.05}
                                        onDragEnd={(_, info) => {
                                          if (info.offset.x > 70) {
                                            initiatePayment();
                                          }
                                        }}
                                        className="absolute left-1.5 top-1.5 h-[52px] w-16 bg-primary rounded-full shadow-lg flex items-center justify-center text-white cursor-grab active:cursor-grabbing z-10"
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <ArrowRight size={22} />
                                      </motion.div>
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[9px] font-bold text-primary/40 uppercase tracking-[0.2em] pl-10 font-body">Swipe to Pay</span>
                                      </div>
                                    </div>

                                    {/* Beautiful App Selector Dropdown */}
                                    <Select value={selectedApp} onValueChange={(value: any) => setSelectedApp(value)}>
                                      <SelectTrigger className="h-16 w-32 bg-white border-border/60 rounded-2xl flex items-center justify-center shadow-sm hover:border-primary/40 focus:ring-primary/20 transition-all group overflow-hidden relative px-2 [&>svg:last-child]:hidden outline-none">
                                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                                        <div className="flex items-center justify-center w-full relative">
                                          <div className="flex items-center justify-center h-7 w-full relative">
                                            {selectedApp === 'paytm' && <div className="w-[64px] h-[14px] flex items-center justify-center"><img src={paytmLogo} className="max-h-full max-w-full object-contain" alt="Paytm" /></div>}
                                            {selectedApp === 'phonepe' && <div className="w-[64px] h-[22px] flex items-center justify-center"><img src={phonepeLogo} className="max-h-full max-w-full object-contain" alt="PhonePe" /></div>}
                                            {selectedApp === 'gpay' && <div className="w-[64px] h-[20px] flex items-center justify-center"><img src={gpayLogo} className="max-h-full max-w-full object-contain" alt="GPay" /></div>}

                                            <div className="absolute top-1/2 -translate-y-1/2 -right-1 text-muted-foreground/40 group-hover:text-primary transition-colors">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                          </div>
                                        </div>
                                      </SelectTrigger>
                                      
                                      <SelectContent className="z-[10000] w-[140px] p-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border-border/40" side="top" align="center" sideOffset={10}>
                                        <SelectItem value="paytm" className="cursor-pointer py-3.5 rounded-xl focus:bg-primary/5 focus:text-primary transition-colors [&>span]:w-full">
                                          <div className="w-full h-8 flex items-center justify-center">
                                            <img src={paytmLogo} className="h-[14px] w-auto max-w-[100px] object-contain" alt="Paytm" />
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="phonepe" className="cursor-pointer py-3.5 rounded-xl focus:bg-primary/5 focus:text-primary transition-colors [&>span]:w-full">
                                          <div className="w-full h-8 flex items-center justify-center">
                                            <img src={phonepeLogo} className="h-[22px] w-auto max-w-[100px] object-contain" alt="PhonePe" />
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="gpay" className="cursor-pointer py-3.5 rounded-xl focus:bg-primary/5 focus:text-primary transition-colors [&>span]:w-full">
                                          <div className="w-full h-8 flex items-center justify-center">
                                            <img src={gpayLogo} className="h-[24px] w-auto max-w-[100px] object-contain" alt="GPay" />
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <button
                                    onClick={() => setIsQRMode(true)}
                                    className="w-full py-2 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold hover:text-primary transition-colors uppercase tracking-widest"
                                  >
                                    <LucideScanLine size={14} /> Pay using the QR code
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="qr-view"
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex flex-col items-center justify-center h-full max-h-[300px]"
                                >
                                  <div className="p-3 bg-white rounded-[2rem] shadow-xl border border-border/40 relative group overflow-hidden mb-4">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    <QRCodeSVG value={upiUrl} size={160} />
                                  </div>
                                  <div className="text-center space-y-1 mb-4">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Scan with any UPI app</p>
                                  </div>
                                  <button
                                    onClick={() => setIsQRMode(false)}
                                    className="px-6 py-2 bg-secondary/50 hover:bg-secondary rounded-full flex items-center gap-2 text-[10px] font-bold text-foreground transition-colors uppercase tracking-widest shrink-0"
                                  >
                                    <ArrowLeft size={14} /> Back
                                  </button>
                                </motion.div>
                              )}
                           </AnimatePresence>
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
                  <div className="flex justify-between text-sm text-muted-foreground font-body">
                    <span>Delivery ({selectedShipping.name})</span>
                    <span className="font-semibold text-foreground border border-primary/20 bg-primary/5 px-2 rounded-md">+ ₹{selectedShipping.price}</span>
                  </div>
                  <div className="flex justify-between text-lg font-heading font-black pt-2 border-t border-border/40">
                    <span className="text-foreground">Total Payable</span>
                    <span className="text-primary">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {checkoutStep === 2 ? (
                  <button
                    onClick={() => setCheckoutStep(3)}
                    disabled={!shippingInfo.name || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.pincode}
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
