import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    text: 'The memory box I ordered for our anniversary was absolutely stunning! My husband was in tears.The Memory Knot truly understands emotions.',
    rating: 5,
    occasion: 'Anniversary Gift',
  },
  {
    name: 'Rahul Mehta',
    text: 'Ordered a surprise hamper for my best friend\'s birthday. The attention to detail and personalization was beyond amazing!',
    rating: 5,
    occasion: 'Birthday Gift',
  },
  {
    name: 'Ananya Gupta',
    text: 'The love letter set was so beautifully crafted. It felt like a piece of art. Will definitely order again for special occasions!',
    rating: 5,
    occasion: 'Valentine\'s Day',
  },
  {
    name: 'Vikram Singh',
    text: 'I proposed with a custom star map from The Memory Knot and she said yes! The quality and packaging was luxury level.',
    rating: 5,
    occasion: 'Proposal',
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Love Letters</span>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mt-2 text-foreground">
            What Our Customers Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-500 relative"
            >
              <Quote size={32} className="text-rose-light/50 absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-gold fill-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic">"{t.text}"</p>
              <div className="mt-5 pt-4 border-t border-border/50">
                <p className="font-heading font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.occasion}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
