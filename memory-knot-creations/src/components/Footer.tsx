import { Link } from 'react-router-dom';
import { Heart, Instagram, Facebook, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { SITE_CONFIG } from '@/config';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-border/60">
      {/* Main footer links bar */}
      <div className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { label: 'Quick Links', href: '/' },
              { label: 'About Us', href: '/about' },
              { label: 'FAQs', href: '/about#faqs' },
              { label: 'Shipping & Returns', href: '/contact#shipping' },
              { label: 'Contact', href: '/contact' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-1.5 text-xs font-medium text-foreground/60 hover:text-primary transition-colors font-body"
              >
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Payment icons */}
            <div className="flex items-center gap-2 ml-auto">
              {['VISA', 'MC', 'Paytm'].map(p => (
                <span
                  key={p}
                  className="px-2.5 py-1 bg-secondary text-foreground/60 text-[10px] font-bold rounded border border-border/60 font-body"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom contact bar */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1 text-xs text-foreground/50 font-body">
            <div className="flex items-center gap-2">
              <Mail size={11} />
              <span>Email: {SITE_CONFIG.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={11} />
              <span>Call / WhatsApp: {SITE_CONFIG.phone}</span>
            </div>
          </div>

          {/* Brand watermark */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <a href={SITE_CONFIG.instagram} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors">
                <Instagram size={14} />
              </a>
              <a href={SITE_CONFIG.facebook} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground/50 hover:text-primary hover:bg-primary/10 transition-colors">
                <Facebook size={14} />
              </a>
              <a href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground/50 hover:text-[#25D366] hover:bg-green-50 transition-colors">
                <MessageCircle size={14} />
              </a>
            </div>
            <p className="font-heading text-4xl font-bold text-foreground/8 select-none">M&K</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border/40 text-center">
          <p className="text-[11px] text-foreground/40 font-body flex items-center justify-center gap-1">
            © 2026 {SITE_CONFIG.name}. Made with
            <Heart size={10} className="text-primary" fill="currentColor" />
            in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
