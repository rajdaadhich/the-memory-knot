import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import productMemoryBox from '@/assets/product-memory-box.jpg';
import productLoveLetter from '@/assets/product-love-letter.jpg';
import productPhotoGift from '@/assets/product-photo-gift.jpg';
import productHamper from '@/assets/product-hamper.jpg';
import productKeepsake from '@/assets/product-keepsake.jpg';
import productScrapbook from '@/assets/product-scrapbook.jpg';
import productStarmap from '@/assets/product-starmap.jpg';
import gallery2 from '@/assets/gallery-2.jpg';
import QuickViewModal from './QuickViewModal';

const FeaturedProducts = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    api.getProducts().then(data => {
      // Limit to first 8 for featured section if "featured" flag is not fully customized yet
      setProducts(data.slice(0, 8));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-muted-foreground">Loading featured gifts...</div>;
  }

  return (
    <section id="products" className="py-20 lg:py-28 gradient-romantic">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Our Collection</span>
          <h2 className="font-heading text-3xl lg:text-4xl font-bold mt-2 text-foreground">
            Featured Gifts
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Each gift is handcrafted with love and personalized just for you
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                {product.tag && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider rounded-full">
                    {product.tag}
                  </span>
                )}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
                    aria-label="Add to cart"
                  >
                    <ShoppingBag size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="w-10 h-10 rounded-full bg-card text-foreground flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
                    aria-label="View details"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-heading text-sm lg:text-base font-semibold text-foreground truncate">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary font-bold">₹{product.price.toLocaleString()}</span>
                  <button
                    onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                    className="text-xs text-muted-foreground hover:text-primary font-medium transition-colors lg:hidden"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <QuickViewModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </section>
  );
};

export default FeaturedProducts;
