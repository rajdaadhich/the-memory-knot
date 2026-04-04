import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { SITE_CONFIG } from '@/config';

// Using existing gallery images
import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';

const galleryImages = [gallery1, gallery2, gallery3, gallery4];

const InstagramSection = () => {
  return (
    <section className="py-16 lg:py-20 bg-[#F8F3EE]">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(to right, transparent, hsl(38,60%,50%))' }} />
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Follow Us on Instagram</h2>
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(to left, transparent, hsl(38,60%,50%))' }} />
          </div>
          <a
            href={SITE_CONFIG.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors font-body"
          >
            <Instagram size={14} />
            @thememoryknot
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {galleryImages.map((img, i) => (
            <motion.a
              key={i}
              href={SITE_CONFIG.instagram}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative aspect-square overflow-hidden rounded-xl shadow-card hover:shadow-elevated transition-all duration-300"
            >
              <img
                src={img}
                alt={`Instagram post ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-300 flex items-center justify-center">
                <Instagram size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
