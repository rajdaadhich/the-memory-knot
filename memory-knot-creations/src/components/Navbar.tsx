import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Heart, ChevronDown, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE_CONFIG } from '@/config';



const Navbar = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAuthenticated } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Automatically close mobile menu on route or hash changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  // Listen to hash changes or route navigation to handle smooth scrolling to anchors
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        // Delay slightly to ensure layout rendering is complete
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    } else if (location.pathname === '/') {
      // Scroll to top if home path is loaded without hash
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'About Us', href: '/about' },
    { label: 'Reviews', href: '/#reviews' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    const currentPath = location.pathname.replace(/\/$/, '') || '/';
    
    if (href === '/') {
      return currentPath === '/';
    }
    
    const [path, hash] = href.split('#');
    const normalizedPath = path.replace(/\/$/, '') || '/';
    
    if (hash) {
      return currentPath === normalizedPath && location.hash === `#${hash}`;
    }
    
    return currentPath.startsWith(normalizedPath) && normalizedPath !== '/';
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[10000] transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white py-3'
        } border-b border-border/60`}>
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Left Section (Hamburger & Logo) */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-foreground/70 hover:text-primary transition-colors mr-1"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5 group">
                <Heart size={28} className="text-primary group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
                <span className="text-xl md:text-2xl font-heading font-bold text-foreground transition-colors group-hover:text-primary">
                  {SITE_CONFIG.name}
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-sm font-medium transition-colors duration-200 relative group ${isActive(link.href)
                    ? 'text-primary font-semibold'
                    : 'text-foreground/70 hover:text-primary'
                    }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full transition-all duration-300 ${isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                className="p-2 text-foreground/70 hover:text-primary transition-colors animate-fade-in"
                aria-label="Profile"
                id="profile-button"
              >
                <User size={22} />
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-foreground/70 hover:text-primary transition-colors animate-fade-in"
                aria-label="Cart"
                id="cart-button"
              >
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slide-Over Drawer - Rendered outside of nav to prevent backdrop-filter stacking context transparency issues */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] lg:hidden"
          />
        )}

        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu-container"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-0 w-[285px] bg-white z-[9999] shadow-2xl flex flex-col justify-between p-6 lg:hidden border-r border-border/40"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-border/50 mb-6">
                <div className="flex items-center gap-2">
                  <Heart size={22} className="text-primary" fill="currentColor" />
                  <span className="font-heading text-lg font-bold text-foreground">{SITE_CONFIG.name}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-secondary rounded-lg text-foreground/60 hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Links */}
              <div className="space-y-1.5">
                {navLinks.map(link => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center py-3 px-4 rounded-xl text-sm font-bold transition-all ${isActive(link.href)
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground/70 hover:text-primary hover:bg-secondary/30'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-border/50 space-y-3">
              <Link
                to={isAuthenticated ? "/dashboard" : "/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-border/80 text-foreground hover:bg-secondary/40 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-sm bg-white"
              >
                <User size={14} />
                {isAuthenticated ? 'My Account' : 'Sign In / Register'}
              </Link>

              <button
                onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-soft hover:bg-primary/95 transition-all"
              >
                <ShoppingBag size={14} />
                View Cart {totalItems > 0 && `(${totalItems})`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 lg:h-18" />
    </>
  );
};

export default Navbar;
