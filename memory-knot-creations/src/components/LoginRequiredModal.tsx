import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Heart, ShoppingBag } from 'lucide-react';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          {/* Backdrop click close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-white rounded-3xl border border-border/60 shadow-2xl p-6 lg:p-8 text-center space-y-6 overflow-hidden z-10"
          >
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground/40 hover:text-foreground transition-colors rounded-lg hover:bg-secondary/60"
            >
              <X size={18} />
            </button>

            {/* Lock/Cart icon block */}
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary relative shadow-inner">
              <ShoppingBag size={24} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-primary/20 rounded-full flex items-center justify-center text-primary shadow-sm">
                <Lock size={12} />
              </div>
            </div>

            {/* Content text */}
            <div className="space-y-2">
              <h3 className="font-heading text-2xl font-black text-foreground">Sign In to Add Items</h3>
              <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-[260px] mx-auto">
                To customize products, save items in your cart, and secure your order details, please log in first.
              </p>
            </div>

            {/* Actions button list */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={onConfirm}
                className="w-full py-3.5 bg-primary text-white hover:bg-primary/95 rounded-xl font-bold font-body shadow-soft transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Lock size={14} /> Sign In / Register
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-secondary/50 hover:bg-secondary border border-border/60 rounded-xl text-xs font-bold text-foreground uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                Browse Products
              </button>
            </div>

            {/* Footer decoration */}
            <div className="text-[9px] text-muted-foreground font-body flex items-center justify-center gap-1 opacity-70">
              <Heart size={8} className="text-primary" fill="currentColor" />
              Keeps your selections saved forever
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginRequiredModal;
