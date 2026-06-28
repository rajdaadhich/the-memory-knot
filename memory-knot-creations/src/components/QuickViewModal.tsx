import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Share2, Heart, Star, ShieldCheck, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { SITE_CONFIG } from '@/config';

interface QuickViewModalProps {
  product: any | null;
  onClose: () => void;
}

const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const { addItem } = useCart();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out "${product.name}" on ${SITE_CONFIG.name} — ₹${product.price.toLocaleString()}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: shareText, url: shareUrl });
      } catch (err) {
        // User cancelled share — do nothing
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        prompt('Copy this link:', shareUrl);
      }
    }
  };

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

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => <Star key={i} size={11} fill="currentColor" />)}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Highly Rated</span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground leading-tight">{product.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
                  </div>
                  
                  {/* Premium Size Badge */}
                  {product.size && (
                    <div className="mt-3 flex items-baseline gap-2 text-muted-foreground font-body">
                      <span className="text-xs font-bold uppercase tracking-wider">Size:</span>
                      <span className="text-primary font-heading text-xl md:text-2xl font-bold tracking-wide">
                        {product.size.replace(/\s*\*\s*/g, ' × ').replace(/\s*[xX]\s*(?=\d)/g, ' × ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground font-body leading-relaxed">
                    {product.description || `This beautiful ${product.name} is handcrafted with premium materials to preserve your most precious memories. A perfect gift for any special occasion that your loved ones will cherish forever.`}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[10px] font-bold tracking-wider font-body border border-[#C8E6C9]/40 select-none">
                      <ShieldCheck size={12} className="shrink-0" />
                      Quality Check Approved
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FDF2F4] text-[#C2185B] rounded-full text-[10px] font-bold tracking-wider font-body border border-[#F8BBD0]/40 select-none">
                      <Heart size={12} className="shrink-0" />
                      Handmade with Love
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => { addItem(product); onClose(); }}
                    disabled={product.isSoldOut}
                    className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-3"
                  >
                    <ShoppingBag size={16} />
                    {product.isSoldOut ? 'Sold Out' : 'Add to Gift Box'}
                  </button>
                  <button
                    onClick={handleShare}
                    title={copied ? 'Link Copied!' : 'Share this product'}
                    className={`p-3 border rounded-xl transition-all ${
                      copied
                        ? 'border-green-400 text-green-500 bg-green-50'
                        : 'border-border text-muted-foreground hover:text-primary hover:border-primary'
                    }`}
                  >
                    {copied ? <Check size={18} /> : <Share2 size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-border/40 text-center">
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
