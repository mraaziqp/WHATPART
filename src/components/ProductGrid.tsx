import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingCart, 
  Check, 
  ShieldCheck, 
  MapPin, 
  Star, 
  ChevronDown, 
  X, 
  SlidersHorizontal, 
  Zap, 
  Eye 
} from 'lucide-react';
import { Product, CATEGORIES } from '../data/catalogData';
import { useStore } from '../store/useStore';
import { formatZAR } from '../utils/formatters';
import { GridSkeleton } from './Skeletons';

interface ProductGridProps {
  products: Product[];
  searchQuery?: string;
  onClearFilters?: () => void;
}

export const ProductGridContent: React.FC<ProductGridProps> = ({
  products,
  searchQuery = '',
  onClearFilters,
}) => {
  const { addItem } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating'>('relevance');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [addedToCartId, setAddedToCartId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter products
  let filtered = [...products];
  
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.oemNumber.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
    );
  }

  if (selectedCategory !== 'all') {
    filtered = filtered.filter((p) => p.category === selectedCategory);
  }

  if (conditionFilter !== 'all') {
    filtered = filtered.filter((p) => p.condition === conditionFilter);
  }

  // Sort products
  switch (sortBy) {
    case 'price_asc':
      filtered.sort((a, b) => a.priceZAR - b.priceZAR);
      break;
    case 'price_desc':
      filtered.sort((a, b) => b.priceZAR - a.priceZAR);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
  }

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedToCartId(product.id);
    setTimeout(() => setAddedToCartId(null), 1500);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Parts Catalog</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {filtered.length} part{filtered.length !== 1 ? 's' : ''} found
            {searchQuery && <span className="text-amber-400"> for "{searchQuery}"</span>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Filters</span>
          </button>

          {/* Category Filter */}
          <div className="relative hidden sm:block">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 bg-slate-800 text-white text-xs px-3 pr-8 rounded-xl border border-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-amber-500"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Condition Filter */}
          <div className="relative hidden sm:block">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="h-9 bg-slate-800 text-white text-xs px-3 pr-8 rounded-xl border border-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-amber-500"
              aria-label="Filter by condition"
            >
              <option value="all">Any Condition</option>
              <option value="New (OEM)">New (OEM)</option>
              <option value="New (Aftermarket)">Aftermarket</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Used (Grade A Scrap)">Used (Grade A)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 bg-slate-800 text-white text-xs px-3 pr-8 rounded-xl border border-slate-700 appearance-none cursor-pointer focus:outline-none focus:border-amber-500"
              aria-label="Sort products"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Rating: Best First</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {showFilters && (
        <div className="sm:hidden grid grid-cols-2 gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 bg-slate-950 text-white text-xs px-2 rounded-lg border border-slate-700 appearance-none"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full h-9 bg-slate-950 text-white text-xs px-2 rounded-lg border border-slate-700 appearance-none"
              aria-label="Filter by condition"
            >
              <option value="all">Any Condition</option>
              <option value="New (OEM)">New (OEM)</option>
              <option value="New (Aftermarket)">Aftermarket</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Used (Grade A Scrap)">Used (Grade A)</option>
            </select>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Search className="w-12 h-12 text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-white">No parts found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Try adjusting your filters or search for a different term.</p>
          {onClearFilters && (
            <button
              onClick={() => { onClearFilters(); setSelectedCategory('all'); setConditionFilter('all'); }}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl uppercase"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-amber-500/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-800 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.originalPriceZAR && (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                        SAVE {formatZAR(product.originalPriceZAR - product.priceZAR)}
                      </span>
                    )}
                    {product.expressDelivery && (
                      <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" /> EXPRESS
                      </span>
                    )}
                  </div>

                  {/* Quick View */}
                  <button
                    onClick={() => setQuickViewProduct(product)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-slate-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
                    aria-label={`Quick view ${product.title}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Condition Tag */}
                  <div className="absolute bottom-2 left-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      product.condition === 'New (OEM)' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      product.condition === 'New (Aftermarket)' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      product.condition === 'Refurbished' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }`}>
                      {product.condition}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">{product.oemNumber}</p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {product.rating} ({product.reviewsCount})
                    </span>
                  </div>

                  {/* Seller */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    {product.sellerVerified && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                    <span className="truncate">{product.sellerName}</span>
                    <span className="text-slate-600">|</span>
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{product.sellerLocation}</span>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-end justify-between pt-1">
                    <div>
                      {product.originalPriceZAR && (
                        <span className="text-[10px] text-slate-500 line-through font-mono block">
                          {formatZAR(product.originalPriceZAR)}
                        </span>
                      )}
                      <span className="text-lg font-black text-amber-400 font-mono">
                        {formatZAR(product.priceZAR)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addedToCartId === product.id}
                      className={`h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                        addedToCartId === product.id
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/10'
                      }`}
                    >
                      {addedToCartId === product.id ? (
                        <><Check className="w-4 h-4" /><span>Added!</span></>
                      ) : (
                        <><ShoppingCart className="w-4 h-4" /><span>Add</span></>
                      )}
                    </button>
                  </div>

                  {/* Stock indicator */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-semibold ${product.inStock ? 'text-emerald-400' : 'text-red-400'}`}>
                      {product.inStock ? `In Stock (${product.stockCount})` : 'Out of Stock'}
                    </span>
                    <span className="text-slate-500">{product.warranty}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewProduct(null)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden relative z-10 shadow-2xl"
            >
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white z-10"
                aria-label="Close quick view"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-56 bg-slate-800">
                <img
                  src={quickViewProduct.imageUrl}
                  alt={quickViewProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">{quickViewProduct.title}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">{quickViewProduct.oemNumber}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-0.5">{renderStars(quickViewProduct.rating)}</div>
                  <span className="text-xs text-slate-400">
                    {quickViewProduct.rating} ({quickViewProduct.reviewsCount} reviews)
                  </span>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(quickViewProduct.partSpecs).map(([key, val]) => (
                    <div key={key} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">{key}</span>
                      <span className="text-white font-semibold">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Compatible Vehicles */}
                <div className="text-xs">
                  <span className="text-slate-400 font-semibold">Compatible Vehicles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {quickViewProduct.compatibleVehicles.map((v) => (
                      <span key={v} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[10px] border border-slate-700">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    {quickViewProduct.originalPriceZAR && (
                      <span className="text-xs text-slate-500 line-through font-mono block">
                        {formatZAR(quickViewProduct.originalPriceZAR)}
                      </span>
                    )}
                    <span className="text-2xl font-black text-amber-400 font-mono">
                      {formatZAR(quickViewProduct.priceZAR)}
                    </span>
                  </div>
                  <button
                    onClick={() => { handleAddToCart(quickViewProduct); setQuickViewProduct(null); }}
                    className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ProductGrid: React.FC<ProductGridProps & { onAddToCart?: (p: Product) => void; activeVehicle?: string }> = (props) => {
  return (
    <Suspense fallback={<GridSkeleton />}>
      <ProductGridContent {...props} />
    </Suspense>
  );
};
