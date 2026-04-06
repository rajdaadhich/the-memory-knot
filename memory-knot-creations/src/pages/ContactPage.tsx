import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Send, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { SITE_CONFIG } from '@/config';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitContactForm(formData);
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try WhatsApp instead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | {SITE_CONFIG.name}</title>
        <meta name="description" content={`Get in touch with ${SITE_CONFIG.name}. Contact us via WhatsApp, email, or our contact form for personalized gift inquiries.`} />
      </Helmet>

      <div className="min-h-screen bg-[#F8F3EE]">
        <Navbar />

        {/* Page Header */}
        <div className="bg-white border-b border-border/60 py-12 lg:py-16">
          <div className="max-w-6xl mx-auto px-4 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart size={20} className="text-primary" fill="currentColor" />
              <span className="text-sm font-medium text-primary font-body uppercase tracking-widest">Get In Touch</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-foreground">Contact Us</h1>
            <p className="mt-4 text-muted-foreground font-body max-w-md mx-auto">
              Have a custom gift idea? Want to know more? We'd love to hear from you.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">We're Here to Help</h2>
              <p className="text-foreground/65 font-body leading-relaxed mb-8">
                Whether you want a completely custom order, have questions about an existing order, or just want to say hello — we're always happy to chat!
              </p>

              <div className="space-y-5">
                <a
                  href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border/60 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <MessageCircle size={22} className="text-[#25D366]" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">WhatsApp (Fastest)</p>
                    <p className="text-muted-foreground text-xs font-body mt-0.5">{SITE_CONFIG.phone}</p>
                  </div>
                </a>

                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border/60 shadow-card hover:shadow-elevated hover:border-primary/30 transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/8 rounded-full flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Mail size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">Email Us</p>
                    <p className="text-muted-foreground text-xs font-body mt-0.5">{SITE_CONFIG.email}</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border/60 shadow-card">
                  <div className="w-12 h-12 bg-primary/8 rounded-full flex items-center justify-center">
                    <MapPin size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">Our Location</p>
                    <p className="text-muted-foreground text-xs font-body mt-0.5">{SITE_CONFIG.address}</p>
                  </div>
                </div>
              </div>

              {/* Shipping & Returns */}
              <div id="shipping" className="mt-10 space-y-4">
                <div className="p-5 bg-white rounded-xl border border-border/60">
                  <h3 className="font-heading font-semibold text-foreground mb-3">Shipping Charges</h3>
                  <div className="space-y-2 text-sm text-foreground/70 font-body">
                    <div className="flex justify-between items-center bg-[#F8F3EE] p-2.5 rounded-lg border border-border/30">
                      <span>Standard <span className="text-muted-foreground text-xs">(6-7 Days)</span></span>
                      <span className="font-semibold text-primary">₹199</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#F8F3EE] p-2.5 rounded-lg border border-border/30">
                      <span>Express Delivery</span>
                      <span className="font-semibold text-primary">₹399</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#F8F3EE] p-2.5 rounded-lg border border-border/30">
                      <span>Big Orders <span className="text-muted-foreground text-xs">(7-8 Days)</span></span>
                      <span className="font-semibold text-primary">₹300</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#F8F3EE] p-2.5 rounded-lg border border-border/30">
                      <span>Express by Air</span>
                      <span className="font-semibold text-primary">₹600 - ₹900</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-border/60">
                  <h3 className="font-heading font-semibold text-foreground mb-3">Policies & Returns</h3>
                  <div className="space-y-2 text-sm text-foreground/65 font-body">
                    <p>• Orders are processed within 5–7 business days</p>
                    <p>• Pan-India delivery (2–5 additional days)</p>
                    <p>• Contact us within 48 hours of delivery for any issues</p>
                    <p>• We ensure every order is packaged with care</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl border border-border/60 shadow-card p-8">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Send a Message</h2>
                <p className="text-sm text-muted-foreground font-body mb-6">Tell us about your custom gift idea</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Name *</label>
                    <input
                      required
                      type="text"
                      id="contact-name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-3.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm placeholder:text-muted-foreground/60"
                      placeholder="Raj Sharma"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address *</label>
                    <input
                      required
                      type="email"
                      id="contact-email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm placeholder:text-muted-foreground/60"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message *</label>
                    <textarea
                      required
                      rows={5}
                      id="contact-message"
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full p-3.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-body text-sm placeholder:text-muted-foreground/60"
                      placeholder="Tell us what kind of personalized gift you'd like..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="contact-submit"
                    className="w-full py-3.5 bg-primary text-white rounded-lg font-medium font-body hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-soft disabled:opacity-60"
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>

                  <p className="text-center text-xs text-muted-foreground font-body">
                    Or chat directly on{' '}
                    <a
                      href={`https://wa.me/${SITE_CONFIG.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-semibold hover:underline"
                    >
                      WhatsApp
                    </a>
                    {' '}for a faster response
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>

        <Footer />
        <CartDrawer />
        <WhatsAppButton />
      </div>
    </>
  );
};

export default ContactPage;
