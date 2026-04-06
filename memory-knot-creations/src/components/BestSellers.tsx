import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import QuickViewModal from './QuickViewModal';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const BADGES = ['Bestseller', '20% Off', 'Limited Stock', 'New Arrival', 'Popular', 'Trending'];

const BestSellers = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    api.getProducts().then(data => {
      setProducts(data.slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <section id="products" className="py-16 lg:py-20 bg-[#F8F3EE]">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">

        {/* Section Header with ornament */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(to right, transparent, hsl(38,60%,50%))' }} />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="hsl(38,60%,50%)" className="opacity-80">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Best Sellers</h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="hsl(38,60%,50%)" className="opacity-80">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <div className="h-px flex-1 max-w-24" style={{ background: 'linear-gradient(to left, transparent, hsl(38,60%,50%))' }} />
          </div>
          <p className="text-muted-foreground font-body text-sm">Our Most Loved Gifts</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <div className="space-y-2 px-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))
          ) : (
            products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-400 border border-border/50"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Badge */}
                  {product.isSoldOut ? (
                    <div className="absolute inset-x-0 top-6 flex justify-center z-10 pointer-events-none">
                      <span className="px-4 py-1.5 bg-red-500/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest rounded shadow-lg border border-red-400/30">
                        Sold Out
                      </span>
                    </div>
                  ) : (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-[11px] font-bold uppercase tracking-wide rounded-sm shadow-sm">
                      {BADGES[i % BADGES.length]}
                    </span>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                      disabled={product.isSoldOut}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-soft transition-transform ${product.isSoldOut ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70' : 'bg-primary text-white hover:scale-110'}`}
                      aria-label="Add to cart"
                      id={`add-to-cart-${product.id}`}
                    >
                      <ShoppingBag size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="w-10 h-10 rounded-full bg-white text-foreground flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
                      aria-label="Quick view"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-heading font-semibold text-foreground truncate text-base">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-bold text-lg">₹{product.price.toLocaleString()}</span>
                    <button
                      onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                      disabled={product.isSoldOut}
                      className={`text-xs px-3 py-1 rounded font-medium transition-colors border ${
                        product.isSoldOut 
                          ? 'border-border bg-secondary text-muted-foreground cursor-not-allowed' 
                          : 'border-primary text-primary hover:bg-primary hover:text-white'
                      }`}
                      id={`add-to-cart-mobile-${product.id}`}
                    >
                      {product.isSoldOut ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-10">
          <Link
            to="/shop"
            id="view-all-products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-md font-medium font-body hover:bg-primary/90 transition-all duration-200 shadow-soft text-sm"
          >
            View All Products
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <QuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
};

export default BestSellers;
