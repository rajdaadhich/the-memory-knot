import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

const CATEGORY_CARDS = [
  {
    id: 'Boquet',
    title: 'Bouquets',
    description: 'Beautiful Polaroid, jewellery, and chocolate arrangements wrapping your memories.',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80',
  },
  {
    id: 'Hampers',
    title: 'Gift Hampers',
    description: 'Beautifully curated collection of sweets, keepsakes, and products styled with love.',
    image: 'https://images.unsplash.com/photo-1608228088998-57828365d486?w=800&q=80',
  },
  {
    id: 'Jewellery',
    title: 'Jewellery',
    description: 'Premium handcrafted earrings, bracelets, anklets, and elegant accessories.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
  },
  {
    id: 'Mini Boquet',
    title: 'Mini Bouquets',
    description: 'Aesthetic smaller-sized arrangements packed with details and love.',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80',
  },
  {
    id: 'Mini Hampers',
    title: 'Mini Hampers',
    description: 'Cute, budget-friendly curated gift sets that deliver huge smiles.',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&q=80',
  },
  {
    id: 'Accesories',
    title: 'Accessories',
    description: 'Adorable matching clips, pins, and custom details to elevate any outfit.',
    image: 'https://images.unsplash.com/photo-1590156546746-c58d2f15fecb?w=800&q=80',
  },
  {
    id: 'Personalised',
    title: 'Personalised',
    description: 'Custom photo journals, printed t-shirts, mobile covers, keychains, and mugs.',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
  }
];

const SUBCATEGORIES_MAP: Record<string, string[]> = {
  'Boquet': ['Polaroid boquets', 'jewellery boquets', 'hair accesories boquet', 'hotwheels boquet', 'choclate boquet'],
  'Hampers': ['Premium Hampers', 'Self Care Hampers', 'Chocolate Hampers', 'Celebration Hampers'],
  'Jewellery': ['earing', 'bracelet', 'anlet', 'necklace', 'ring'],
  'Mini Boquet': ['Polaroid boquets', 'jewellery boquets', 'hair accesories boquet', 'hotwheels boquet', 'choclate boquet'],
  'Mini Hampers': ['Polaroid boquets', 'jewellery boquets', 'hair accesories boquet', 'hotwheels boquet', 'choclate boquet'],
  'Accesories': [],
  'Personalised': ['magazines', 'personalised tshirts', 'mobile covers', 'mug / cups', 'keychains']
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  // Bouquets
  'Polaroid boquets': 'Polaroid Bouquets',
  'jewellery boquets': 'Jewellery Bouquets',
  'hair accesories boquet': 'Hair Accessories Bouquets',
  'hotwheels boquet': 'Hot Wheels Bouquets',
  'choclate boquet': 'Chocolate Bouquets',
  // Hampers
  'Premium Hampers': 'Premium Hampers',
  'Self Care Hampers': 'Self Care Hampers',
  'Chocolate Hampers': 'Chocolate Hampers',
  'Celebration Hampers': 'Celebration Hampers',
  // Jewellery
  'earing': 'Earrings',
  'bracelet': 'Bracelets',
  'anlet': 'Anklets',
  'necklace': 'Necklaces',
  'ring': 'Rings',
  // Personalised
  'magazines': 'Magazines & Booklets',
  'personalised tshirts': 'Personalised T-Shirts',
  'mobile covers': 'Custom Mobile Covers',
  'mug / cups': 'Mugs & Cups',
  'keychains': 'Personalised Keychains'
};

const OCCASIONS = [
  'birthday', 'anniversiry', 'engagement', 'baby shower', 'proposal', 'mothers day', 'fathers day', 
  'valentines week days', 'diwali', 'eid', 'rakhi', 'holi', 'christmas', 'sisters day', 
  'boyfriends day', 'girlfriends day'
];

const OCCASION_LABELS: Record<string, string> = {
  'birthday': 'Birthday',
  'anniversiry': 'Anniversary',
  'engagement': 'Engagement',
  'baby shower': 'Baby Shower',
  'proposal': 'Proposal',
  'mothers day': "Mother's Day",
  'fathers day': "Father's Day",
  'valentines week days': "Valentine's Week",
  'diwali': 'Diwali',
  'eid': 'Eid',
  'rakhi': 'Rakhi / Bhai Dooj',
  'holi': 'Holi',
  'christmas': 'Christmas',
  'sisters day': "Sister's Day",
  'boyfriends day': "Boyfriend's Day",
  'girlfriends day': "Girlfriend's Day"
};

const GIFT_FOR_OPTIONS = ['male', 'female'];
const PAGE_LIMIT = 12;

const ShopPage = () => {
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const isCategorySelected = !!categoryParam && CATEGORY_CARDS.some(c => c.id === categoryParam);

  // Products state
  const [products, setProducts]       = useState<any[]>([]);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter state
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [sortBy, setSortBy]                   = useState('popular');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedOccasion, setSelectedOccasion]       = useState('All');
  const [selectedGiftFor, setSelectedGiftFor]         = useState('All');
  
  const [showFilters, setShowFilters]           = useState(false);
  const [minPrice, setMinPrice]                 = useState(199);
  const [maxPrice, setMaxPrice]                 = useState(1000);

  // Temporary drawer states (applied only on "Apply" button click)
  const [tempCategory, setTempCategory]         = useState(categoryParam || 'All');
  const [tempSubCategory, setTempSubCategory]   = useState('All');
  const [tempOccasion, setTempOccasion]         = useState('All');
  const [tempGiftFor, setTempGiftFor]           = useState('All');
  const [tempMinPrice, setTempMinPrice]         = useState(199);
  const [tempMaxPrice, setTempMaxPrice]         = useState(1000);

  // Sync category param with filter state
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setTempCategory(categoryParam);
    } else {
      setSelectedCategory('All');
      setTempCategory('All');
    }
    // Reset filters when category changes
    setSelectedSubCategory('All');
    setTempSubCategory('All');
    setSelectedOccasion('All');
    setTempOccasion('All');
    setSelectedGiftFor('All');
    setTempGiftFor('All');
  }, [categoryParam]);

  const handleOpenFilters = () => {
    setTempCategory(selectedCategory);
    setTempSubCategory(selectedSubCategory);
    setTempOccasion(selectedOccasion);
    setTempGiftFor(selectedGiftFor);
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
    setShowFilters(true);
  };

  const handleApplyFilters = () => {
    setSelectedCategory(tempCategory);
    setSelectedSubCategory(tempSubCategory);
    setSelectedOccasion(tempOccasion);
    setSelectedGiftFor(tempGiftFor);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    
    // Sync category URL search param if category was changed in filters (if we allow it, otherwise keep search params synced)
    if (tempCategory !== 'All' && tempCategory !== categoryParam) {
      setSearchParams({ category: tempCategory });
    } else if (tempCategory === 'All' && categoryParam) {
      setSearchParams({});
    }
    
    setShowFilters(false);
  };

  // Multi-select toggle helper functions
  const handleToggleSubCategory = (sub: string) => {
    if (sub === 'All') {
      setTempSubCategory('All');
      return;
    }
    if (tempSubCategory === 'All') {
      setTempSubCategory(sub);
      return;
    }
    const current = tempSubCategory.split(',').map(s => s.trim()).filter(Boolean);
    if (current.includes(sub)) {
      const next = current.filter(x => x !== sub);
      setTempSubCategory(next.length > 0 ? next.join(',') : 'All');
    } else {
      setTempSubCategory([...current, sub].join(','));
    }
  };

  const isSubCategorySelected = (sub: string) => {
    if (sub === 'All') return tempSubCategory === 'All';
    if (tempSubCategory === 'All') return false;
    return tempSubCategory.split(',').map(s => s.trim()).includes(sub);
  };

  const handleToggleOccasion = (occ: string) => {
    if (occ === 'All') {
      setTempOccasion('All');
      return;
    }
    if (tempOccasion === 'All') {
      setTempOccasion(occ);
      return;
    }
    const current = tempOccasion.split(',').map(s => s.trim()).filter(Boolean);
    if (current.includes(occ)) {
      const next = current.filter(x => x !== occ);
      setTempOccasion(next.length > 0 ? next.join(',') : 'All');
    } else {
      setTempOccasion([...current, occ].join(','));
    }
  };

  const isOccasionSelected = (occ: string) => {
    if (occ === 'All') return tempOccasion === 'All';
    if (tempOccasion === 'All') return false;
    return tempOccasion.split(',').map(s => s.trim()).includes(occ);
  };

  const handleToggleGiftFor = (gf: string) => {
    if (gf === 'All') {
      setTempGiftFor('All');
      return;
    }
    if (tempGiftFor === 'All') {
      setTempGiftFor(gf);
      return;
    }
    const current = tempGiftFor.split(',').map(s => s.trim()).filter(Boolean);
    if (current.includes(gf)) {
      const next = current.filter(x => x !== gf);
      setTempGiftFor(next.length > 0 ? next.join(',') : 'All');
    } else {
      setTempGiftFor([...current, gf].join(','));
    }
  };

  const isGiftForSelected = (gf: string) => {
    if (gf === 'All') return tempGiftFor === 'All';
    if (tempGiftFor === 'All') return false;
    return tempGiftFor.split(',').map(s => s.trim()).includes(gf);
  };

  // Screen size check for mobile filter drawer direction
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(1000);

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
    if (isCategorySelected) {
      setProducts([]);
      setPage(1);
      setHasMore(true);
      setLoading(true);
    }
  }, [debouncedSearch, sortBy, selectedCategory, selectedSubCategory, selectedOccasion, selectedGiftFor, debouncedMinPrice, debouncedMaxPrice, isCategorySelected]);

  // Fetch a page of products
  const fetchPage = useCallback(async (pageNum: number) => {
    if (!isCategorySelected) return;
    try {
      const data = await api.getProductsPaginated({
        page: pageNum,
        limit: PAGE_LIMIT,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        occasion: selectedOccasion,
        giftFor: selectedGiftFor,
        search: debouncedSearch,
        sort: sortBy,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
      });
      setProducts(prev => {
        if (pageNum === 1) return data.products;
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
  }, [debouncedSearch, sortBy, selectedCategory, selectedSubCategory, selectedOccasion, selectedGiftFor, debouncedMinPrice, debouncedMaxPrice, isCategorySelected]);

  // Initial load and page changes
  useEffect(() => {
    if (isCategorySelected && page === 1 && loading) {
      fetchPage(1);
    }
  }, [page, loading, fetchPage, isCategorySelected]);

  useEffect(() => {
    if (isCategorySelected && page > 1) {
      fetchPage(page);
    }
  }, [page, isCategorySelected]);

  // IntersectionObserver sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading && isCategorySelected) {
          setLoadingMore(true);
          setPage(prev => prev + 1);
        }
      },
      { rootMargin: '1200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, isCategorySelected]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSubCategory('All');
    setTempSubCategory('All');
    setSelectedOccasion('All');
    setTempOccasion('All');
    setSelectedGiftFor('All');
    setTempGiftFor('All');
    setSortBy('popular');
    setMinPrice(199);
    setTempMinPrice(199);
    setMaxPrice(1000);
    setTempMaxPrice(1000);
  };

  // 1. RENDER CATEGORY CARDS (NO CATEGORY SELECTED)
  if (!isCategorySelected) {
    return (
      <>
        <Helmet>
          <title>Shop Collections | {SITE_CONFIG.name}</title>
          <meta name="description" content={`Explore our customized gift collections. Choose from Bouquets, Hampers, Jewellery, Mini bouquets, Mini Hampers, Accessories, and Magazines.`} />
        </Helmet>

        <div className="min-h-screen bg-[#F8F3EE]">
          <Navbar />

          <div className="max-w-[1600px] mx-auto px-4 lg:px-8 pt-8 pb-16">
            {/* Header section */}
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
              <p className="text-[11px] text-primary font-bold uppercase tracking-widest mb-2 font-body">The Memory Knot</p>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4">Our Collections</h1>
              <p className="text-sm md:text-base text-muted-foreground font-body leading-relaxed">
                Choose a collection to browse our custom creations. Each category features dedicated, custom filters to help you find exactly what you are looking for.
              </p>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {CATEGORY_CARDS.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  onClick={() => setSearchParams({ category: card.id })}
                  className="group relative h-72 rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 cursor-pointer border border-border/40"
                >
                  {/* Card Background Image */}
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Backdrop Color Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
                  
                  {/* Color Pink Tint overlay on hover */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Card content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-primary mb-1 opacity-90">
                      Collection
                    </span>
                    <h2 className="font-heading text-xl md:text-2xl font-bold mb-1.5 group-hover:translate-x-1 transition-transform duration-300">
                      {card.title}
                    </h2>
                    <p className="text-xs font-body text-white/75 line-clamp-2 mb-4 leading-relaxed group-hover:text-white transition-colors">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary group-hover:underline">
                      Explore
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <Footer />
        </div>
      </>
    );
  }

  // 2. RENDER PRODUCT LIST (CATEGORY SELECTED)
  return (
    <>
      <Helmet>
        <title>{CATEGORY_CARDS.find(c => c.id === selectedCategory)?.title || selectedCategory} | {SITE_CONFIG.name}</title>
        <meta name="description" content={`Browse our full collection of ${selectedCategory} gifts. Filter by price, type, occasion, and more.`} />
      </Helmet>

      <div className="min-h-screen bg-[#F8F3EE]">
        <Navbar />

        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 pt-6 pb-10">
          {/* Integrated Page Header & Breadcrumb */}
          <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-0.5">
                <a href="/" className="hover:text-primary transition-colors">Home</a>
                {' '}/{' '}
                <button onClick={() => setSearchParams({})} className="hover:text-primary transition-colors">Shop</button>
                {' '}/{' '}
                <span className="text-foreground">{CATEGORY_CARDS.find(c => c.id === selectedCategory)?.title || selectedCategory}</span>
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <button
                  onClick={() => setSearchParams({})}
                  className="px-2.5 py-1 bg-white hover:bg-secondary text-foreground text-xs font-bold rounded-lg border border-border transition-all flex items-center gap-1 hover:text-primary"
                >
                  <span>← Collections</span>
                </button>
                <h1 className="font-heading text-xl lg:text-2xl font-black text-foreground">
                  {CATEGORY_CARDS.find(c => c.id === selectedCategory)?.title || selectedCategory}
                </h1>
              </div>
            </div>
          </div>

          {/* Search + Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={`Search inside ${selectedCategory.toLowerCase()}...`}
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
                onClick={() => handleOpenFilters()}
                id="toggle-filters"
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-white font-body text-sm hover:border-primary hover:text-primary transition-colors"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i % PAGE_LIMIT, 7) * 0.05 }}
                    className="group bg-white rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
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
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 hidden lg:flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => { e.stopPropagation(); addItem({ id: product.id, name: product.name, price: product.price, image: product.image }); }}
                          disabled={product.isSoldOut}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-soft transition-transform ${product.isSoldOut ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70' : 'bg-primary text-white hover:scale-110'}`}
                          aria-label="Add to cart"
                          id={`shop-add-${product.id}`}
                        >
                          <ShoppingBag size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
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
                        onClick={(e) => { e.stopPropagation(); addItem({ id: product.id, name: product.name, price: product.price, image: product.image }); }}
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

        {/* Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <div key="filter-drawer-wrapper" className={`fixed inset-0 z-[12000] flex ${isMobile ? 'justify-start' : 'justify-end'}`}>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: isMobile ? '-100%' : '100%' }}
                animate={{ x: 0 }}
                exit={{ x: isMobile ? '-100%' : '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className={`relative h-full w-full max-w-[360px] bg-[#FAF8F5] shadow-2xl flex flex-col z-10 ${isMobile ? 'border-r' : 'border-l'} border-border`}
              >
                {/* Header */}
                <div className="p-6 border-b border-border/60 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-primary" />
                    <h2 className="font-heading text-xl font-bold text-foreground">Filters</h2>
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 text-muted-foreground/60 hover:text-foreground transition-colors hover:bg-secondary/60 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-7">

                  {/* Dynamic Sub-Category Selector */}
                  {selectedCategory && SUBCATEGORIES_MAP[selectedCategory]?.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 font-body">Filter by Type</h3>
                      <div className="flex flex-wrap gap-2">
                        {['All', ...SUBCATEGORIES_MAP[selectedCategory]].map(sub => {
                          const isSel = isSubCategorySelected(sub);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => handleToggleSubCategory(sub)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold font-body transition-all border flex items-center gap-1.5 ${
                                isSel
                                  ? 'bg-primary text-white border-primary shadow-soft'
                                  : 'bg-white text-foreground/75 border-border/80 hover:border-primary/50 hover:text-primary'
                              }`}
                            >
                              {isSel && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                              {sub === 'All' ? 'All Types' : SUBCATEGORY_LABELS[sub] || sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Occasions Selector */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 font-body">Occasion</h3>
                    <div className="max-h-52 overflow-y-auto pr-1 border border-border/40 rounded-xl p-2.5 bg-white shadow-xs space-y-1 scrollbar-thin">
                      {['All', ...OCCASIONS].map(occ => {
                        const isSel = isOccasionSelected(occ);
                        return (
                          <button
                            key={occ}
                            type="button"
                            onClick={() => handleToggleOccasion(occ)}
                            className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-left text-xs font-body transition-all ${
                              isSel ? 'bg-primary/5' : 'hover:bg-secondary/40'
                            } group`}
                          >
                            <span className={`font-medium ${
                              isSel ? 'text-primary font-bold' : 'text-foreground/75 group-hover:text-foreground'
                            }`}>
                              {occ === 'All' ? 'All Occasions' : OCCASION_LABELS[occ] || occ}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                              isSel ? 'border-primary bg-primary text-white scale-105' : 'border-border bg-white group-hover:border-primary/50'
                            }`}>
                              {isSel && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gift For (Him/Her Segmented Controller) */}
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 font-body">Gift For</h3>
                    <div className="grid grid-cols-3 gap-1 bg-[#FAF6F0] p-1.5 rounded-xl border border-border/40 shadow-inner">
                      {['All', ...GIFT_FOR_OPTIONS].map(gf => {
                        const isSel = isGiftForSelected(gf);
                        return (
                          <button
                            key={gf}
                            type="button"
                            onClick={() => handleToggleGiftFor(gf)}
                            className={`py-2 rounded-lg text-xs font-semibold font-body transition-all text-center ${
                              isSel
                                ? 'bg-white text-primary shadow-soft font-bold'
                                : 'text-foreground/50 hover:text-foreground'
                            }`}
                          >
                            {gf === 'All' ? 'Everyone' : gf === 'male' ? 'Him ♂' : 'Her ♀'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Range Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-body">Price Range</h3>
                      <span className="text-xs font-bold text-primary font-body bg-primary/10 px-2.5 py-0.5 rounded-full">
                        ₹{tempMinPrice} - ₹{tempMaxPrice}
                      </span>
                    </div>
                    <div className="px-2 pt-2 pb-4 bg-white rounded-xl border border-border/40 p-4 shadow-sm">
                      <div className="relative h-6 flex items-center">
                        <div className="absolute w-full h-1.5 bg-secondary rounded-lg"></div>
                        <div
                          className="absolute h-1.5 bg-primary rounded-lg pointer-events-none"
                          style={{
                            left: `${((tempMinPrice - 199) / (1000 - 199)) * 100}%`,
                            right: `${100 - ((tempMaxPrice - 199) / (1000 - 199)) * 100}%`
                          }}
                        ></div>
                        <input
                          type="range"
                          min="199" max="1000" step="10"
                          value={tempMinPrice}
                          onChange={(e) => setTempMinPrice(Math.min(Number(e.target.value), tempMaxPrice - 50))}
                          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer z-10"
                        />
                        <input
                          type="range"
                          min="199" max="1000" step="10"
                          value={tempMaxPrice}
                          onChange={(e) => setTempMaxPrice(Math.max(Number(e.target.value), tempMinPrice + 50))}
                          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer z-20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border/60 bg-white flex gap-3">
                  <button
                    onClick={() => {
                      handleClearFilters();
                      setShowFilters(false);
                    }}
                    className="flex-1 py-3.5 border border-border/80 text-foreground font-body font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-secondary/50 active:scale-[0.98] transition-all"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => handleApplyFilters()}
                    className="flex-1 py-3.5 bg-primary text-white font-body font-bold text-xs uppercase tracking-widest rounded-xl shadow-soft hover:bg-primary/95 active:scale-[0.98] transition-all"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default ShopPage;
