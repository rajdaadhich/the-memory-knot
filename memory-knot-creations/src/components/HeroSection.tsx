import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import heroFamily from '@/assets/hero-family.png';

const HeroSection = () => {
  return (
    <section id="home" className="bg-[#F8F3EE] overflow-hidden">
      {/* Decorative watercolor blobs */}
      <div className="absolute top-20 left-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(347,52%,70%) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div className="absolute top-10 right-0 w-64 h-64 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(34,60%,70%) 0%, transparent 70%)', filter: 'blur(50px)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left — Text Content */}
          <div className="order-2 lg:order-1">
            {/* Decorative leaf SVG */}
            <div className="mb-4 opacity-50">
              <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                <path d="M0 10 Q15 2 30 10 Q45 18 60 10" stroke="hsl(347,52%,35%)" strokeWidth="1.5" fill="none"/>
              </svg>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-heading text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight text-foreground"
            >
              Turn Moments
              <br />
              into Memories{' '}
              <Heart size={32} className="inline text-primary mb-1" fill="currentColor" />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-4 text-base lg:text-lg text-foreground/70 font-body flex items-center gap-2"
            >
              Personalized Gifts for Couples &amp; Families{' '}
              <Heart size={14} className="text-primary" fill="currentColor" />
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                to="/shop"
                id="hero-shop-now"
                className="px-7 py-3.5 bg-primary text-white rounded-md font-medium font-body hover:bg-primary/90 transition-all duration-200 shadow-soft text-sm"
              >
                Shop Now
              </Link>
              <Link
                to="/shop"
                id="hero-get-discount"
                className="px-7 py-3.5 bg-primary/10 text-primary border border-primary/30 rounded-md font-medium font-body hover:bg-primary hover:text-white transition-all duration-200 text-sm"
              >
                Get 20% Off Today!
              </Link>
            </motion.div>

            {/* Trust badges strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 flex flex-wrap items-center gap-6 text-xs text-foreground/60 font-body"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(347,52%,35%)" strokeWidth="1.8">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <span>Made with Love</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(347,52%,35%)" strokeWidth="1.8">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <span>100% Satisfaction Guarantee</span>
              </div>
            </motion.div>
          </div>

          {/* Right — Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="order-1 lg:order-2 relative"
          >
            {/* Decorative frame */}
            <div className="absolute -top-4 -right-4 w-full h-full border-2 border-primary/15 rounded-2xl hidden lg:block" />
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={heroFamily}
                alt="Indian family with personalized photo frames"
                className="w-full h-72 sm:h-96 lg:h-[480px] object-cover"
              />
              {/* Watercolor overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-elevated border border-border/60 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Heart size={14} className="text-primary" fill="currentColor" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">500+ Happy Families</p>
                <p className="text-[10px] text-muted-foreground">Across India</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
