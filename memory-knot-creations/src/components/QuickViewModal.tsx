import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Share2, Heart, Star, ShieldCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { SITE_CONFIG } from '@/config';

interface QuickViewModalProps {
  product: any | null;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const { addItem } = useCart();

  if (!product) return null;

  return (
    <AnimatePresence>
      {product && (
        <div key="quickview-master" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] border border-border/40"
          >
            {/* Image Section */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-secondary/20 relative overflow-hidden">
              <img
                src={product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isSoldOut && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="px-6 py-2 bg-red-500 text-white font-bold uppercase tracking-widest rounded-full shadow-lg">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors z-10"
              >
                <X size={20} className="text-muted-foreground" />
              </button>

              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Highly Rated</span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-tight">{product.name}</h2>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                    {product.price > 499 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">
                        Free Shipping
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    {product.description || `This beautiful ${product.name} is handcrafted with premium materials to preserve your most precious memories. A perfect gift for any special occasion that your loved ones will cherish forever.`}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <ShieldCheck size={14} className="text-primary" />
                      Quality Check Approved
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                      <Heart size={14} className="text-primary" />
                      Handmade with Love
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { addItem(product); onClose(); }}
                    disabled={product.isSoldOut}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={18} />
                    {product.isSoldOut ? 'Sold Out' : 'Add to Gift Box'}
                  </button>
                  <button className="p-3 border border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  Guaranteed safe checkout with UPI
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
