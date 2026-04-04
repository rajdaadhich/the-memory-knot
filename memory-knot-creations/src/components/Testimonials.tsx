import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Shweta & Rohan',
    text: '"Beautiful gift! Made our anniversary so special. Highly recommend"',
    initials: 'SR',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    name: 'Aarav S.',
    text: '"Amazing quality and fast delivery. My wife loved it"',
    initials: 'AS',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    name: 'Neha M.',
    text: '"Such a unique and heartfelt gift. Will order again."',
    initials: 'NM',
    color: 'bg-purple-100 text-purple-600',
  },
];

const Testimonials = () => {
  return (
    <section id="reviews" className="py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(to right, transparent, hsl(38,60%,50%))' }} />
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Why Choose Us?</h2>
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(to left, transparent, hsl(38,60%,50%))' }} />
          </div>
          <p className="text-muted-foreground font-body text-sm">What Our Customers Say</p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#F8F3EE] rounded-xl p-6 border border-border/50 hover:shadow-card transition-all duration-300"
            >
              {/* Profile */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground text-sm">{t.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array(5).fill(0).map((_, j) => (
                      <svg key={j} width="12" height="12" viewBox="0 0 24 24" fill="hsl(38,60%,50%)">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                {/* Decorative initial avatar (right side) */}
                <div className="ml-auto">
                  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" opacity="0.15">
                    <circle cx="32" cy="22" r="14" stroke="hsl(347,52%,35%)" strokeWidth="2"/>
                    <path d="M8 56c0-13.25 10.75-24 24-24s24 10.75 24 24" stroke="hsl(347,52%,35%)" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
              <p className="text-sm text-foreground/75 leading-relaxed font-body italic">{t.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
