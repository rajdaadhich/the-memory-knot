import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Share2 } from 'lucide-react';
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
          className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-elevated flex flex-col md:flex-row max-h-[90vh] border border-border/60"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 text-foreground hover:bg-primary hover:text-white transition-all shadow-soft border border-border/60"
          >
            <X size={16} />
          </button>

          {/* Image Side */}
          <div className="md:w-5/12 relative bg-[#F8F3EE] h-60 md:h-auto overflow-hidden flex-shrink-0">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {product.featured && (
              <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wide rounded-sm">
                Featured
              </span>
            )}
          </div>

          {/* Details Side */}
          <div className="flex-1 p-6 md:p-7 flex flex-col overflow-y-auto bg-white">
            <div className="mb-auto">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block font-body">
                {product.category || 'Personalized Gift'}
              </span>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
                {product.name}
              </h2>
              <div className="flex items-center gap-4 mb-5">
                <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground line-through">₹{(product.price * 1.2).toFixed(0)}</span>
              </div>

              <div className="bg-[#F8F3EE] rounded-xl p-4 mb-5">
                <p className="text-foreground/70 leading-relaxed text-sm font-body">
                  {product.description || 'Our handcrafted gifts are designed to preserve your precious memories forever. Each piece is made with high-quality materials and infinite care.'}
                </p>
              </div>

              <ul className="space-y-2 text-sm text-foreground/60 font-body">
                {['Premium Handcrafted Quality', 'Express WhatsApp Ordering', 'Customized Just for You', '100% Satisfaction Guarantee'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-5 mt-5 border-t border-border/50">
              <button
                onClick={() => {
                  addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
                  onClose();
                }}
                id={`quickview-add-${product.id}`}
                className="w-full py-3.5 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-soft"
              >
                <ShoppingBag size={17} />
                Add to Cart
              </button>
              <button className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1 uppercase tracking-widest font-body">
                <Share2 size={12} />
                Share this gift
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
