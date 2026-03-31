import { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { toast } from 'sonner';

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
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        totalAmount: totalPrice,
        items: items.map(item => ({ id: item.id, quantity: item.quantity, price: item.price }))
      };

      const res = await api.createOrder(orderData);

      // WhatsApp Formatting
      const message = `Hello, I would like to place an order!\n\n*Order ID:* ${res.order.id}\n*Name:* ${formData.name}\n*Total:* ₹${totalPrice}\n\n*Items:*\n${items.map(i => `- ${i.name} (x${i.quantity})`).join('\n')}\n\nPlease let me know how I can make the payment.`;
      const whatsappUrl = `https://wa.me/917073691168?text=${encodeURIComponent(message)}`;
      
      clearCart();
      setIsCartOpen(false);
      setIsCheckoutMode(false);
      
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-elevated flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                {isCheckoutMode ? (
                  <>
                    <button onClick={() => setIsCheckoutMode(false)} className="mr-2 hover:text-primary"><ArrowLeft size={20} /></button>
                    Checkout Info
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} className="text-primary" />
                    Your Cart ({totalItems})
                  </>
                )}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:text-primary transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isCheckoutMode ? (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Full Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-lg border border-border bg-background focus:outline-primary" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Phone Number * (WhatsApp)</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 rounded-lg border border-border bg-background focus:outline-primary" placeholder="+91 9876543210" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Email Address (Optional)</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 rounded-lg border border-border bg-background focus:outline-primary" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Delivery Address *</label>
                    <textarea required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-3 rounded-lg border border-border bg-background focus:outline-primary resize-none" placeholder="123 Street, City, Pincode" />
                  </div>
                </form>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingBag size={48} className="mb-4 opacity-30" />
                  <p className="font-body">Your cart is empty</p>
                  <p className="text-sm mt-1">Add some beautiful gifts!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-4 p-3 rounded-xl bg-secondary/30"
                    >
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&q=80'} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover rounded-lg" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-primary font-semibold text-sm mt-1">₹{item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors self-start">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between text-lg font-heading font-semibold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                </div>
                {isCheckoutMode ? (
                  <button type="submit" form="checkout-form" disabled={isSubmitting} className="w-full py-3.5 bg-[#25D366] text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
                    {isSubmitting ? 'Processing...' : 'Place Order via WhatsApp'}
                  </button>
                ) : (
                  <button onClick={() => setIsCheckoutMode(true)} className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity">
                    Continue to Checkout
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
