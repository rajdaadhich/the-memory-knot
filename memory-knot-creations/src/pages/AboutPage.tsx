import { Helmet } from 'react-helmet-async';
import { Heart, Award, Users, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { SITE_CONFIG } from '@/config';
import { Link } from 'react-router-dom';

const stats = [
  { icon: Users, value: '500+', label: 'Happy Families' },
  { icon: Heart, value: '1000+', label: 'Gifts Delivered' },
  { icon: Award, value: '5★', label: 'Average Rating' },
  { icon: Smile, value: '100%', label: 'Satisfaction' },
];

const values = [
  {
    title: 'Handcrafted with Love',
    desc: 'Every single piece is made by hand with attention to detail. We believe a gift should feel as special as the moment it represents.',
  },
  {
    title: 'Truly Personalized',
    desc: 'No two gifts are alike. Each creation is customized specifically for you — your photos, your story, your memories.',
  },
  {
    title: 'Premium Quality',
    desc: 'We use only the finest materials so that your memories are preserved beautifully for years to come.',
  },
  {
    title: 'Delivered with Care',
    desc: 'We package every order with the same care as the crafting — so it arrives safe, beautiful, and ready to gift.',
  },
];

const faqs = [
  {
    q: 'How long does it take to receive my order?',
    a: 'Most orders are completed and shipped within 5–7 business days. Custom or complex orders may take a bit longer. We\'ll keep you updated via email.',
  },
  {
    q: 'How do I place a custom order?',
    a: 'You can place a custom order by contacting us directly via the contact form on our Contact page or by emailing our support team.',
  },
  {
    q: 'What if I am not satisfied with my order?',
    a: 'Your satisfaction is our priority. If there\'s any issue with your order, please contact us within 48 hours of delivery and we\'ll make it right.',
  },
  {
    q: 'Do you deliver across India?',
    a: 'Yes! We deliver pan-India. Please expect 2–5 additional days for delivery depending on your location.',
  },
];

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us | {SITE_CONFIG.name}</title>
        <meta name="description" content={`Learn about ${SITE_CONFIG.name} — our story, values, and mission to turn your most precious moments into beautiful handcrafted gifts.`} />
      </Helmet>

      <div className="min-h-screen bg-[#F8F3EE]">
        <Navbar />

        {/* Hero Banner */}
        <div className="bg-white border-b border-border/60 py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart size={20} className="text-primary" fill="currentColor" />
              <span className="text-sm font-medium text-primary font-body uppercase tracking-widest">Our Story</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">
              About {SITE_CONFIG.name}
            </h1>
            <p className="mt-4 text-muted-foreground font-body max-w-xl mx-auto leading-relaxed">
              We believe that the best gifts are not just things — they are memories given a beautiful form.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-3xl font-bold text-foreground mb-6">How It All Started</h2>
              <div className="space-y-4 text-foreground/70 font-body leading-relaxed">
                <p>
                  {SITE_CONFIG.name} was born out of a simple belief: that the moments we share with our loved ones deserve to be remembered — and celebrated — in the most beautiful way possible.
                </p>
                <p>
                  We started as a small handcrafted studio in Jaipur, driven by a passion for creating personalized keepsakes that carry real emotion. Every frame, every box, every gift we create holds a story inside it.
                </p>
                <p>
                  Today, we have had the privilege of delighting over 500 families across India — from anniversary surprises to birthday celebrations, proposals to everyday moments of love.
                </p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-primary text-white rounded-md font-medium font-body hover:bg-primary/90 transition-all text-sm shadow-soft"
              >
                Explore Our Gifts
              </Link>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-6 text-center shadow-card border border-border/50">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <s.icon size={22} className="text-primary" />
                  </div>
                  <p className="font-heading text-3xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground font-body mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-foreground">Our Values</h2>
              <p className="text-muted-foreground mt-2 font-body">What makes every {SITE_CONFIG.name} gift special</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#F8F3EE] rounded-xl p-5 border border-border/50"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Heart size={14} className="text-primary" fill="currentColor" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2 text-sm">{v.title}</h3>
                  <p className="text-xs text-foreground/65 font-body leading-relaxed">{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div id="faqs" className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground">FAQs</h2>
            <p className="text-muted-foreground mt-2 font-body">Frequently asked questions</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-border/50 shadow-card">
                <h3 className="font-heading font-semibold text-foreground text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-foreground/65 font-body leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
