import { Heart, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground/80">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={20} className="text-primary" fill="currentColor" />
              <span className="font-heading text-xl font-semibold text-primary-foreground">
                Memory <span className="text-primary italic">Knot</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/60">
              Turning your most cherished memories into beautiful, handcrafted gifts that last forever.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4">Quick Links</h4>
            <div className="space-y-2.5">
              {['Home', 'Shop', 'Categories', 'How It Works', 'Contact'].map(link => (
                <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="block text-sm text-primary-foreground/60 hover:text-primary transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4">Categories</h4>
            <div className="space-y-2.5">
              {['Gifts for Couples', 'Gifts for Friends', 'Gifts for Family', 'Birthday Gifts', 'Anniversary Gifts'].map(cat => (
                <a key={cat} href="#categories" className="block text-sm text-primary-foreground/60 hover:text-primary transition-colors">
                  {cat}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-primary-foreground mb-4">Connect</h4>
            <p className="text-sm text-primary-foreground/60 mb-2">hello@memoryknot.com</p>
            <p className="text-sm text-primary-foreground/60 mb-4">+91 98765 43210</p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-sm text-primary-foreground/40">
            © 2026 The Memory Knot. Made with <Heart size={12} className="inline text-primary" fill="currentColor" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
