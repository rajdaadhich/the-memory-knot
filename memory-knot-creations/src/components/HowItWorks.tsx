import { motion } from 'framer-motion';
import { MousePointerClick, Palette, PackageCheck } from 'lucide-react';

const steps = [
  { icon: MousePointerClick, title: 'Choose Your Gift', desc: 'Browse our curated collection of personalized gifts', num: '01' },
  { icon: Palette, title: 'Customize Details', desc: 'Add photos, messages, and personal touches', num: '02' },
  { icon: PackageCheck, title: 'We Create & Deliver', desc: 'Handcrafted with love and delivered to your door', num: '03' },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 gradient-romantic">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Simple Process</span>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mt-2 text-foreground">
            How It Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px border-t-2 border-dashed border-primary/30" />
              )}
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full bg-card shadow-card flex items-center justify-center text-primary mx-auto">
                  <step.icon size={32} />
                </div>
                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.num}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold mt-5 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
