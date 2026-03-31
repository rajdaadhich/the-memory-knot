import { motion } from 'framer-motion';
import { Heart, Gift, Truck, Mail } from 'lucide-react';

const features = [
  { icon: Heart, title: 'Personalized with Love', desc: 'Every gift is tailored to your unique story and emotions', emoji: '❤️' },
  { icon: Gift, title: 'Unique Handmade Gifts', desc: 'Crafted by artisans who pour their heart into every detail', emoji: '🎁' },
  { icon: Truck, title: 'Fast & Safe Delivery', desc: 'Carefully packaged and delivered right to your doorstep', emoji: '🚚' },
  { icon: Mail, title: 'Emotional Value', desc: 'Gifts that create lasting memories and bring happy tears', emoji: '💌' },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Why Us</span>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mt-2 text-foreground">
            Why Choose The Memory Knot?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="text-center p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-500 group"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-light/50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <f.icon size={28} />
              </div>
              <h3 className="font-heading text-lg font-semibold mt-5 text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
