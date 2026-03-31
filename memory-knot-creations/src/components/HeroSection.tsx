import { motion } from 'framer-motion';
import heroBg from '@/assets/hero-bg.jpg';

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="Beautiful personalized gifts" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/40 to-foreground/20" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-primary/10 animate-float hidden lg:block" />
      <div className="absolute bottom-32 left-10 w-14 h-14 rounded-full bg-peach/20 animate-float hidden lg:block" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-6 backdrop-blur-sm border border-primary-foreground/10">
              ✨ Handcrafted with Love
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-primary-foreground"
          >
            Turn Memories Into{' '}
            <span className="italic text-rose-light">Beautiful</span>{' '}
            Gifts
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-lg text-primary-foreground/80 font-body max-w-lg leading-relaxed"
          >
            Celebrate love, friendship, and family with personalized gifts that capture your most cherished moments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <a
              href="#products"
              className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:shadow-elevated hover:scale-[1.02] transition-all duration-300"
            >
              Shop Now
            </a>
            <a
              href="#how-it-works"
              className="px-8 py-3.5 bg-primary-foreground/10 text-primary-foreground rounded-xl font-medium text-sm backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300"
            >
              How It Works
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
