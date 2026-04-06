import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuickViewModal from '@/components/QuickViewModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import { SITE_CONFIG } from '@/config';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

const CATEGORIES = ['All', 'Couples', 'Family', 'Friends', 'Anniversary', 'Birthday'];

const ShopPage = () => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    api.getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 5000;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 500) * 500;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(p =>
        p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, sortBy, priceRange, selectedCategory]);

  return (
    <>
      <Helmet>
        <title>Shop All Gifts | {SITE_CONFIG.name}</title>
        <meta name="description" content={`Browse our full collection of personalized handcrafted gifts. Filter by price, category, and more. ${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}.`} />
      </Helmet>

      <div className="min-h-screen bg-[#F8F3EE]">
        <Navbar />

        {/* Page Header */}
        <div className="bg-white border-b border-border/60 py-8">
          <div className="max-w-6xl mx-auto px-4 lg:px-8">
            <p className="text-xs text-muted-foreground font-body mb-1">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              {' '}/{' '}
              <span className="text-foreground">Shop</span>
            </p>
            <h1 className="font-heading text-3xl font-bold text-foreground">All Products</h1>
            <p className="text-muted-foreground text-sm font-body mt-1">
              {filteredProducts.length} gift{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for gifts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                id="shop-search"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                id="shop-sort"
                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-body text-sm text-foreground min-w-[180px] cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              id="toggle-filters"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white font-body text-sm hover:border-primary hover:text-primary transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-5 mb-6 grid md:grid-cols-2 gap-6"
            >
              {/* Price Range */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">
                  Price Range: ₹{priceRange[0].toLocaleString()} – ₹{priceRange[1].toLocaleString()}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={100}
                    value={priceRange[0]}
                    onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full accent-primary"
                    id="price-min"
                  />
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={100}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-primary"
                    id="price-max"
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-body mt-1">
                  <span>₹0</span>
                  <span>₹{maxPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      id={`category-${cat.toLowerCase()}`}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-primary text-white'
                          : 'bg-secondary text-foreground/70 hover:bg-primary/10 hover:text-primary border border-border'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Category chips (always visible) */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-white text-foreground/70 hover:bg-primary/10 hover:text-primary border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-heading text-xl font-semibold text-foreground/50">No products found</p>
              <p className="text-sm mt-1 font-body">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setPriceRange([0, maxPrice]);
                }}
                className="mt-4 btn-primary text-sm"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group bg-white rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.isSoldOut ? (
                      <div className="absolute inset-x-0 top-6 flex justify-center z-10 pointer-events-none">
                        <span className="px-4 py-1.5 bg-red-500/90 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest rounded shadow-lg border border-red-400/30">
                          Sold Out
                        </span>
                      </div>
                    ) : product.featured ? (
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-sm">
                        Featured
                      </span>
                    ) : null}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                        disabled={product.isSoldOut}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-soft transition-transform ${product.isSoldOut ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70' : 'bg-primary text-white hover:scale-110'}`}
                        aria-label="Add to cart"
                        id={`shop-add-${product.id}`}
                      >
                        <ShoppingBag size={15} />
                      </button>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="w-9 h-9 rounded-full bg-white text-foreground flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
                        aria-label="Quick view"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-heading font-semibold text-foreground text-sm truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-primary font-bold">₹{product.price.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image })}
                      disabled={product.isSoldOut}
                      className={`mt-2 w-full py-1.5 text-xs font-medium border rounded transition-colors ${
                        product.isSoldOut 
                          ? 'border-border bg-secondary text-muted-foreground cursor-not-allowed' 
                          : 'border-primary text-primary hover:bg-primary hover:text-white'
                      }`}
                      id={`shop-cart-${product.id}`}
                    >
                      {product.isSoldOut ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <Footer />
        <QuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    </>
  );
};

export default ShopPage;
