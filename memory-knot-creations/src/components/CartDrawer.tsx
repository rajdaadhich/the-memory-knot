import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowLeft, ArrowRight, Heart, ShieldCheck, Truck, RotateCcw, Plane, Package, Zap, CheckCircle2, Smartphone, ExternalLink, Loader2, Scan as LucideScanLine, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { SITE_CONFIG, API_BASE_URL } from '@/config';
import { QRCodeSVG } from 'qrcode.react';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
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
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, isCartOpen, setIsCartOpen, totalPrice } = useCart();
  const { user } = useUser();
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Shipping, 3: Payment
  const [isPaid, setIsPaid] = useState(false);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedApp, setSelectedApp] = useState<'paytm' | 'phonepe' | 'gpay'>('paytm');
  const [isQRMode, setIsQRMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showMockPopup, setShowMockPopup] = useState(false);
  const [mockOrderDetails, setMockOrderDetails] = useState<{ orderId: string, razorpayOrderId: string } | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
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
  const [addGiftBag, setAddGiftBag] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');

  // Detect mobile vs desktop to default QR code payments appropriately
  useEffect(() => {
    const checkMobile = () => {
      const match = window.matchMedia('(pointer: coarse)').matches || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(match);
      setIsQRMode(!match); // Default to QR code on desktop, Swipe/Deep-links on mobile
    };
    checkMobile();
  }, [isCartOpen]);

  // Load Razorpay Script
  useEffect(() => {
    const loadRazorpayScript = () => {
      if (document.getElementById('razorpay-sdk')) return;
      const script = document.createElement('script');
      script.id = 'razorpay-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    };
    if (isCartOpen) {
      loadRazorpayScript();
    }
  }, [isCartOpen]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!shippingInfo.name.trim()) errors.name = 'Full Name is required';
    
    if (!shippingInfo.email.trim()) {
      errors.email = 'Email Address is required';
    } else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) {
      errors.email = 'Invalid email address format';
    }
    
    if (!shippingInfo.phone.trim()) {
      errors.phone = 'WhatsApp number is required';
    } else if (!/^\d{10}$/.test(shippingInfo.phone.replace(/[^0-9]/g, ''))) {
      errors.phone = 'Enter a valid 10-digit WhatsApp number';
    }
    
    if (!shippingInfo.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(shippingInfo.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }
    
    if (!shippingInfo.address.trim()) errors.address = 'Complete Address is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setCheckoutStep(3);
    }
  };

  // Calculate final total including shipping
  const finalTotal = totalPrice + selectedShipping.price + (addGiftBag ? 40 : 0);
  
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
        setFormErrors({});
        setAddGiftBag(false);
        setCountryCode('+91');
      }, 300);
    }
  }, [isCartOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRazorpayPayment = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create order on backend (creates both DB order and Razorpay order)
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: shippingInfo.name,
          customerEmail: shippingInfo.email,
          customerPhone: `${countryCode} ${shippingInfo.phone}`,
          address: `${shippingInfo.address}${shippingInfo.pincode ? `, Pincode: ${shippingInfo.pincode}` : ''}${addGiftBag ? ' [PREMIUM GIFT BAG REQUESTED (+₹40)]' : ''}`,
          totalAmount: finalTotal,
          items: items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        })
      });

      if (!response.ok) throw new Error("Failed to place order");

      const data = await response.json();
      const { order, razorpayOrderId, keyId } = data;
      setCreatedOrderId(order.id);

      // 2. Determine if keys are dummy or missing
      const isDummyKey = !keyId || keyId === "" || keyId === "rzp_test_dummyKeyId";
      const isDummyOrder = !razorpayOrderId || razorpayOrderId.startsWith("order_dummy");
      const hasRazorpaySDK = typeof (window as any).Razorpay !== 'undefined';

      if (isDummyKey || isDummyOrder || !hasRazorpaySDK) {
        console.warn("Using sandbox mock popup because Razorpay credentials are dummy or SDK is not loaded.");
        setMockOrderDetails({ orderId: order.id, razorpayOrderId });
        setShowMockPopup(true);
        setIsSubmitting(false);
        return;
      }

      // 3. Initialize real Razorpay Checkout widget
      const options = {
        key: keyId,
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        name: "The Memory Knot",
        description: "Handcrafted Personalized Gifts",
        order_id: razorpayOrderId,
        handler: async function (paymentRes: any) {
          setIsSubmitting(true);
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                razorpay_order_id: paymentRes.razorpay_order_id,
                razorpay_payment_id: paymentRes.razorpay_payment_id,
                razorpay_signature: paymentRes.razorpay_signature
              })
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            setIsPaid(true);
            toast.success("Payment successful!");
          } catch (err) {
            console.error("Payment Verification Error:", err);
            toast.error("Failed to verify payment. Please contact support.");
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: shippingInfo.name,
          email: shippingInfo.email,
          contact: `${countryCode}${shippingInfo.phone}`
        },
        theme: {
          color: "#FF69B4"
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            toast.info("Payment cancelled.");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout Error:", error);
      toast.error("Failed to confirm order. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!mockOrderDetails) return;
    setIsSubmitting(true);
    setShowMockPopup(false);
    try {
      const verifyRes = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: mockOrderDetails.orderId,
          razorpay_order_id: mockOrderDetails.razorpayOrderId,
          razorpay_payment_id: "pay_dummy_123",
          razorpay_signature: "sig_dummy_123"
        })
      });

      if (!verifyRes.ok) throw new Error("Verification failed");

      setCreatedOrderId(mockOrderDetails.orderId);
      setIsPaid(true);
      toast.success("Sandbox mock payment successful!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify simulated payment");
    } finally {
      setIsSubmitting(false);
      setMockOrderDetails(null);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div 
          key="cart-drawer-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          className="fixed inset-0 z-[50000] flex justify-end overflow-hidden focus:outline-none"
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
                <button 
                  onClick={() => {
                    if (checkoutStep > 1) {
                      setCheckoutStep(checkoutStep - 1);
                    } else {
                      setIsCartOpen(false);
                    }
                  }}
                  className="w-10 h-10 -ml-2 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors text-foreground shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
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
                              className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 text-sm font-body shadow-sm ${
                                formErrors.name ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
                              }`}
                            />
                            {formErrors.name && <p className="text-[10px] text-red-500 ml-1 font-body">{formErrors.name}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                            <input
                              type="email"
                              name="email"
                              value={shippingInfo.email}
                              onChange={handleInputChange}
                              placeholder="For order updates"
                              className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 text-sm font-body shadow-sm ${
                                formErrors.email ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
                              }`}
                            />
                            {formErrors.email && <p className="text-[10px] text-red-500 ml-1 font-body">{formErrors.email}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">WhatsApp No.</label>
                            <div className="flex gap-2">
                              <Select value={countryCode} onValueChange={setCountryCode}>
                                <SelectTrigger className="w-[96px] h-12 bg-white border-border focus:ring-primary/20 rounded-xl px-2.5 text-sm font-semibold shadow-sm focus:ring-2 outline-none">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[12000] bg-white rounded-xl shadow-xl border-border/40 max-h-60 overflow-y-auto">
                                  <SelectItem value="+91">🇮🇳 +91</SelectItem>
                                  <SelectItem value="+1">🇺🇸 +1</SelectItem>
                                  <SelectItem value="+44">🇬🇧 +44</SelectItem>
                                  <SelectItem value="+971">🇦🇪 +971</SelectItem>
                                  <SelectItem value="+61">🇦🇺 +61</SelectItem>
                                  <SelectItem value="+65">🇸🇬 +65</SelectItem>
                                  <SelectItem value="+49">🇩🇪 +49</SelectItem>
                                  <SelectItem value="+966">🇸🇦 +966</SelectItem>
                                  <SelectItem value="+968">🇴🇲 +968</SelectItem>
                                </SelectContent>
                              </Select>
                              <input
                                type="tel"
                                name="phone"
                                value={shippingInfo.phone}
                                onChange={handleInputChange}
                                placeholder="WhatsApp number"
                                className={`flex-1 h-12 px-4 rounded-xl border bg-white focus:outline-none focus:ring-2 text-sm font-body shadow-sm ${
                                  formErrors.phone ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
                                }`}
                              />
                            </div>
                            {formErrors.phone && <p className="text-[10px] text-red-500 ml-1 font-body">{formErrors.phone}</p>}
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
                              className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 text-sm font-body shadow-sm ${
                                formErrors.pincode ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
                              }`}
                            />
                            {formErrors.pincode && <p className="text-[10px] text-red-500 ml-1 font-body">{formErrors.pincode}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Complete Address</label>
                            <textarea
                              name="address"
                              value={shippingInfo.address}
                              onChange={handleInputChange}
                              rows={3}
                              placeholder="House no, Area, City"
                              className={`w-full px-4 py-3 rounded-xl border bg-white focus:outline-none focus:ring-2 text-sm font-body shadow-sm resize-none ${
                                formErrors.address ? 'border-red-500 focus:ring-red-200' : 'border-border focus:ring-primary/20'
                              }`}
                            />
                            {formErrors.address && <p className="text-[10px] text-red-500 ml-1 font-body">{formErrors.address}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Step 3: Payment */
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <h3 className="font-heading text-2xl font-bold text-foreground">Secure Payment</h3>
                        <p className="text-sm text-muted-foreground font-body">Pay safely using Razorpay</p>
                      </div>

                      {isPaid ? (
                        <div className="py-6 text-center space-y-5">
                          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <ShieldCheck size={40} />
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-heading text-2xl font-black text-foreground">Order Placed! 🎉</h4>
                            <p className="text-sm text-muted-foreground font-body px-2">
                              Your order has been received and will be delivered to you shortly.
                            </p>
                          </div>

                          {/* Customize CTA — now the star of the show */}
                          <div className="space-y-3 pt-2">
                            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
                              <p className="text-sm font-semibold text-foreground mb-1">📸 One more step!</p>
                              <p className="text-xs text-muted-foreground font-body leading-relaxed">
                                Upload your photos &amp; personalization instructions to complete your gift.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setIsCartOpen(false);
                                clearCart();
                                if (createdOrderId) {
                                  navigate(`/customize/${createdOrderId}`);
                                } else {
                                  navigate('/orders');
                                }
                              }}
                              className="w-full py-4 bg-primary text-white rounded-xl font-bold font-heading hover:bg-primary/95 transition-all shadow-soft flex items-center justify-center gap-2 text-base"
                            >
                              ✨ Customize Your Order <ArrowRight size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setIsCartOpen(false);
                                clearCart();
                                navigate('/orders');
                              }}
                              className="w-full py-2 text-xs text-muted-foreground font-semibold hover:text-foreground transition-all"
                            >
                              Do it later / Go to My Orders
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6 text-center pt-4">
                          <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                            Click below to complete your payment securely using UPI, Card, Wallets, or Netbanking.
                          </p>

                          <button
                            onClick={handleRazorpayPayment}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold font-heading shadow-soft flex items-center justify-center gap-2 hover:bg-primary/95 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="animate-spin" size={20} /> Processing...
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={20} /> Pay with Razorpay
                              </>
                            )}
                          </button>
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
                {/* Premium Gift Bag Option (shown on first page) */}
                {checkoutStep === 1 && (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        <ShoppingBag size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Add Premium Gift Bag</p>
                        <p className="text-[10px] text-muted-foreground font-body">Beautiful wrap with custom cards</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary">₹40</span>
                      <input
                        type="checkbox"
                        checked={addGiftBag}
                        onChange={(e) => setAddGiftBag(e.target.checked)}
                        className="w-4 h-4 rounded text-primary border-border focus:ring-primary/20 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground font-body">
                    <span>Products Subtotal</span>
                    <span className="font-semibold text-foreground">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  {addGiftBag && (
                    <div className="flex justify-between text-sm text-muted-foreground font-body">
                      <span>Premium Gift Bag</span>
                      <span className="font-semibold text-foreground">+ ₹40</span>
                    </div>
                  )}
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
                    onClick={handleProceedToPayment}
                    className="w-full py-3.5 bg-primary text-white rounded-xl font-bold font-body shadow-soft transition-all hover:bg-primary/95 active:scale-[0.98] active:shadow-inner"
                  >
                    Proceed to Payment
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

            {/* Mock Checkout Modal (Sandbox Bypass) */}
            {showMockPopup && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60000] flex items-center justify-center p-6 text-center">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-6 shadow-2xl border border-border">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl font-bold text-foreground">Sandbox Test Payment</h3>
                    <p className="text-xs text-muted-foreground font-body">
                      No Razorpay credentials detected (or dummy keys are used). You can simulate the transaction flow here:
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleSimulatePaymentSuccess}
                      className="w-full py-3 bg-green-600 text-white rounded-xl font-bold font-heading hover:bg-green-700 transition-colors shadow-sm text-sm"
                    >
                      Simulate Payment Success
                    </button>
                    <button
                      onClick={() => {
                        setShowMockPopup(false);
                        setMockOrderDetails(null);
                        toast.error("Test payment simulated failure.");
                      }}
                      className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold font-heading hover:bg-red-100 transition-colors text-sm"
                    >
                      Simulate Payment Failure
                    </button>
                    <button
                      onClick={() => {
                        setShowMockPopup(false);
                        setMockOrderDetails(null);
                      }}
                      className="w-full py-2 text-xs text-muted-foreground font-semibold hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
