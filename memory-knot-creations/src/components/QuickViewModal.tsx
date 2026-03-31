import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface QuickViewModalProps {
  product: any | null;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem } = useCart();

  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-foreground/30 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-card w-full max-w-4xl rounded-3xl overflow-hidden shadow-elevated flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 text-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-soft"
          >
            <X size={20} />
          </button>

          {/* Image Gallery Side */}
          <div className="md:w-1/2 relative bg-secondary/20 h-64 md:h-auto overflow-hidden">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-full">
                Featured Collection
              </span>
            )}
          </div>

          {/* Product Details Side */}
          <div className="md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto bg-card">
            <div className="mb-auto">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
                {product.category || 'Personalized Gift'}
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
                {product.name}
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold text-primary">₹ {product.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground line-through">₹ {(product.price * 1.2).toFixed(0)}</span>
              </div>
              
              <div className="bg-secondary/30 rounded-2xl p-4 mb-6">
                <p className="text-foreground/80 leading-relaxed text-sm">
                  {product.description || 'Our handcrafted gifts are designed to preserve your precious memories forever. Each piece is made with high-quality materials and infinite care.'}
                </p>
              </div>

              <ul className="space-y-2 mb-8 text-sm text-muted-foreground font-medium">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Premium Handcrafted Quality
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Express WhatsApp Ordering
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Customized Just for You
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-6 border-t border-border">
              <div className="flex gap-2">
                 <button
                  onClick={() => {
                    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
                    onClose();
                  }}
                  className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-soft"
                >
                  <ShoppingBag size={18} />
                  Add to Shopping Cart
                </button>
                <button className="w-14 h-14 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-primary">
                  <Heart size={20} />
                </button>
              </div>
              <button className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-2 uppercase tracking-widest">
                <Share2 size={12} />
                Share this treasure
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
