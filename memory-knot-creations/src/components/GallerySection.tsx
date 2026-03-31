import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import gallery1 from '@/assets/gallery-1.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import gallery3 from '@/assets/gallery-3.jpg';
import gallery4 from '@/assets/gallery-4.jpg';
import productMemoryBox from '@/assets/product-memory-box.jpg';
import productKeepsake from '@/assets/product-keepsake.jpg';

const images = [gallery1, gallery2, gallery3, gallery4, productMemoryBox, productKeepsake];

const GallerySection = () => {
  return (
    <section className="py-20 lg:py-28 gradient-romantic">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest flex items-center justify-center gap-2">
            <Instagram size={16} /> Follow Us
          </span>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mt-2 text-foreground">
            Gift Gallery
          </h2>
          <p className="mt-3 text-muted-foreground">@memoryknot</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-square rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer"
            >
              <img src={img} alt={`Gift gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300 flex items-center justify-center">
                <Instagram className="text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={28} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
