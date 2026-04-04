import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowLeft, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { SITE_CONFIG } from '@/config';

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        totalAmount: totalPrice,
        items: items.map(item => ({ id: item.id, quantity: item.quantity, price: item.price }))
      };
      const res = await api.createOrder(orderData);
      const message = `Hello, I would like to place an order!\n\n*Order ID:* ${res.order.id}\n*Name:* ${formData.name}\n*Total:* ₹${totalPrice}\n\n*Items:*\n${items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')}\n\nPlease let me know how I can make the payment.`;
      const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
      clearCart();
      setIsCartOpen(false);
      setIsCheckoutMode(false);
      window.open(whatsappUrl, '_blank');
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
          className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-elevated flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/60 bg-[#F8F3EE]">
              <h2 className="font-heading text-lg font-semibold flex items-center gap-2 text-foreground">
                {isCheckoutMode ? (
                  <>
                    <button onClick={() => setIsCheckoutMode(false)} className="mr-1 hover:text-primary transition-colors">
                      <ArrowLeft size={18} />
                    </button>
                    Delivery Details
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
              {isCheckoutMode ? (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                    <input
                      required type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone (WhatsApp) *</label>
                    <input
                      required type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email (Optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery Address *</label>
                    <textarea
                      required rows={3}
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-body text-sm"
                      placeholder="Street, City, Pincode"
                    />
                  </div>
                </form>
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
                <div className="flex justify-between items-center">
                  <span className="font-heading font-semibold text-foreground">Total Amount</span>
                  <span className="font-heading font-bold text-xl text-primary">₹{totalPrice.toLocaleString()}</span>
                </div>
                {isCheckoutMode ? (
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#25D366] text-white rounded-lg font-medium font-body hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-soft"
                  >
                    {isSubmitting ? 'Processing...' : '🎁 Place Order via WhatsApp'}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCheckoutMode(true)}
                    id="proceed-to-checkout"
                    className="w-full py-3.5 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 transition-colors shadow-soft"
                  >
                    Continue to Checkout
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
