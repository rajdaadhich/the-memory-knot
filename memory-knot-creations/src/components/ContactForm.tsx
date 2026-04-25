import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { SITE_CONFIG } from '@/config';


const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', customization: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please fill in your name and email');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.submitContactForm({
        name: form.name,
        email: form.email,
        message: `Message: ${form.message}\n\nCustomization: ${form.customization}`
      });
      toast.success('Thank you! We\'ll get back to you soon 💕');
      setForm({ name: '', email: '', message: '', customization: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-primary uppercase tracking-widest">Get in Touch</span>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold mt-2 text-foreground">
              Let's Create Something Special
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Have a custom gift idea? Tell us about it and we'll bring it to life with love and creativity.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-light/50 flex items-center justify-center text-primary">
                  <Mail size={18} />
                </div>
                <p className="text-sm font-medium text-foreground">{SITE_CONFIG.email}</p>

              </div>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-rose-light/50 flex items-center justify-center text-primary">
                  <MapPin size={18} />
                </div>
                <p className="text-sm font-medium text-foreground">{SITE_CONFIG.address}</p>

              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Your Name *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-5 py-3.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 font-body text-sm placeholder:text-muted-foreground transition-all"
              maxLength={100}
            />
            <input
              type="email"
              placeholder="Email Address *"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-5 py-3.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 font-body text-sm placeholder:text-muted-foreground transition-all"
              maxLength={100}
            />
            <textarea
              placeholder="Your Message"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              rows={3}
              className="w-full px-5 py-3.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 font-body text-sm placeholder:text-muted-foreground resize-none transition-all"
              maxLength={1000}
            />
            <textarea
              placeholder="Customization Details (photos, text, colors...)"
              value={form.customization}
              onChange={e => setForm(f => ({ ...f, customization: e.target.value }))}
              rows={3}
              className="w-full px-5 py-3.5 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 font-body text-sm placeholder:text-muted-foreground resize-none transition-all"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-soft transition-all duration-300 disabled:opacity-50"
            >
              <Send size={16} />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
