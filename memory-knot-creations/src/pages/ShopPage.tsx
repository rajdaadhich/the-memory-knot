import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, Search, SlidersHorizontal, X, ChevronDown, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuickViewModal from '@/components/QuickViewModal';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import { SITE_CONFIG } from '@/config';

const SORT_OPTIONS = [
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest',     label: 'Newest First' },
];

const CATEGORIES = ['All', 'Couples', 'Family', 'Friends', 'Anniversary', 'Birthday'];
const PAGE_LIMIT = 12;

const ShopPage = () => {
  const { addItem } = useCart();

  // Products state
  const [products, setProducts]     = useState<any[]>([]);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter state
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [sortBy, setSortBy]                   = useState('popular');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters]           = useState(false);
  const [minPrice, setMinPrice]                 = useState(199);
  const [maxPrice, setMaxPrice]                 = useState(200000);

  // Custom Sort Dropdown State
  const [isSortOpen, setIsSortOpen]             = useState(false);
  const sortRef                                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search and filters
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(199);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(200000);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, minPrice, maxPrice]);

  // Reset + reload when filters change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, [debouncedSearch, sortBy, selectedCategory, debouncedMinPrice, debouncedMaxPrice]);

  // Fetch a page of products
  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      const data = await api.getProductsPaginated({
        page: pageNum,
        limit: PAGE_LIMIT,
        category: selectedCategory,
        search: debouncedSearch,
        sort: sortBy,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
      });
      setProducts(prev => {
        if (pageNum === 1) return data.products;
        // Deduplicate to avoid React key warnings if StrictMode double-invokes
        const newProducts = [...prev];
        data.products.forEach((p: any) => {
          if (!newProducts.find(existing => existing.id === p.id)) {
            newProducts.push(p);
          }
        });
        return newProducts;
      });
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch {
      // silently fail, keep existing products
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, sortBy, selectedCategory, debouncedMinPrice, debouncedMaxPrice]);

  // Initial load and page changes
  useEffect(() => {
    if (page === 1 && loading) {
      fetchPage(1);
    }
  }, [page, loading, fetchPage]);

  useEffect(() => {
    if (page > 1) {
      fetchPage(page);
    }
  }, [page]);

  // IntersectionObserver sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          setLoadingMore(true);
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: '1200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('popular');
    setMinPrice(199);
    setMaxPrice(200000);
  };

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
          <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
            <p className="text-xs text-muted-foreground font-body mb-1">
              <a href="/" className="hover:text-primary transition-colors">Home</a>
              {' '}/{' '}
              <span className="text-foreground">Shop</span>
            </p>
            <h1 className="font-heading text-3xl font-bold text-foreground">All Products</h1>
            <p className="text-muted-foreground text-sm font-body mt-1">
              {loading ? 'Loading...' : `${total} gift${total !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
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

            {/* Sort & Filter Container */}
            <div className="flex gap-3 w-full sm:w-auto">
              {/* Sort */}
              <div className="relative flex-1 sm:flex-none sm:w-auto" ref={sortRef}>
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full sm:w-[180px] flex items-center justify-between pl-4 pr-3 py-2.5 rounded-lg border border-border bg-white hover:border-primary/50 transition-colors font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <span className="truncate">{SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Sort By'}</span>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-2 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isSortOpen && (
                  <div className="absolute z-30 top-full mt-2 left-0 w-full bg-white border border-border rounded-xl shadow-elevated overflow-hidden py-1 origin-top animate-in fade-in zoom-in-95 duration-200">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setIsSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sortBy === opt.value
                            ? 'bg-primary/5 text-primary font-medium'
                            : 'text-foreground/80 hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                id="toggle-filters"
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white font-body text-sm hover:border-primary hover:text-primary transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-5 mb-6"
            >
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

              {/* Price Range Filter */}
              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center justify-between">
                  <span>Price Range</span>
                  <span className="text-primary font-bold normal-case tracking-normal">₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}</span>
                </label>
                <div className="px-2 pt-2 pb-4">
                  <div className="relative h-6 flex items-center">
                    {/* Track background */}
                    <div className="absolute w-full h-1.5 bg-secondary rounded-lg"></div>
                    {/* Active Track */}
                    <div 
                      className="absolute h-1.5 bg-primary rounded-lg pointer-events-none"
                      style={{
                        left: `${((minPrice - 199) / (200000 - 199)) * 100}%`,
                        right: `${100 - ((maxPrice - 199) / (200000 - 199)) * 100}%`
                      }}
                    ></div>
                    <input 
                      type="range" 
                      min="199" max="200000" step="100"
                      value={minPrice} 
                      onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))}
                      className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer z-10" 
                    />
                    <input 
                      type="range" 
                      min="199" max="200000" step="100"
                      value={maxPrice} 
                      onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))}
                      className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer z-20" 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {Array(PAGE_LIMIT).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-heading text-xl font-semibold text-foreground/50">No products found</p>
              <p className="text-sm mt-1 font-body">Try adjusting your filters or search terms</p>
              <button onClick={handleClearFilters} className="mt-4 btn-primary text-sm">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i % PAGE_LIMIT, 7) * 0.05 }}
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

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                    <Loader2 size={18} className="animate-spin text-primary" />
                    Loading more gifts...
                  </div>
                )}
                {!hasMore && products.length > 0 && (
                  <p className="text-xs text-muted-foreground font-body">
                    ✨ You've seen all {total} gifts
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <Footer />
        <QuickViewModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    </>
  );
};

export default ShopPage;
