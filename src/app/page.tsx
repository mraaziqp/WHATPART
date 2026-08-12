import React from 'react';
import { 
  GarageSearch 
} from '../components/GarageSearch';
import { 
  ProductGrid 
} from '../components/ProductGrid';
import { 
  CATEGORIES, 
  PRODUCTS, 
  Product, 
  RECENT_QUOTES 
} from '../data/catalogData';
import { 
  ShieldCheck, 
  Truck, 
  Zap, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  Car, 
  Disc, 
  Cpu, 
  Layers, 
  Thermometer, 
  Filter, 
  Shield 
} from 'lucide-react';

interface StorefrontPageProps {
  onAddToCart: (product: Product) => void;
  onNavigateToQuote: () => void;
  onNavigateToCatalog: () => void;
  activeVehicle: string;
  setActiveVehicle: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const StorefrontPage: React.FC<StorefrontPageProps> = ({
  onAddToCart,
  onNavigateToQuote,
  onNavigateToCatalog,
  activeVehicle,
  setActiveVehicle,
  searchQuery,
  setSearchQuery,
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Disc': return <Disc className="w-6 h-6 text-amber-400" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-amber-400" />;
      case 'Layers': return <Layers className="w-6 h-6 text-amber-400" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-400" />;
      case 'Thermometer': return <Thermometer className="w-6 h-6 text-amber-400" />;
      case 'Shield': return <Shield className="w-6 h-6 text-amber-400" />;
      case 'Filter': return <Filter className="w-6 h-6 text-amber-400" />;
      default: return <Car className="w-6 h-6 text-amber-400" />;
    }
  };

  const handleGarageSearchSubmit = (params: { make: string; model: string; year: string; engine: string; keyword: string }) => {
    const formatted = `${params.year} ${params.make} ${params.model} ${params.engine}`.trim();
    setActiveVehicle(formatted);
    if (params.keyword) {
      setSearchQuery(params.keyword);
    }
  };

  return (
    <div className="space-y-16">
      
      {/* ================= MASSIVE HERO SECTION WITH GARAGE SEARCH ================= */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        
        {/* Glow ambient spots */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          
          {/* Main Hero Headline & Subtitle */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 text-amber-300 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>South Africa's Premier Autoparts Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Find the exact part for your ride. <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Fast. Guaranteed.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Connect directly with 500+ verified scrap yards, OEM suppliers, and component specialists nationwide. Guaranteed fitment or 100% money back.
            </p>

            {/* Quick SA Stats */}
            <div className="pt-2 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 50,000+ Active Parts
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> 100% Vehicle Fitment Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" /> 24/48h Courier Guy Express
              </span>
            </div>
          </div>

          {/* ================= THE GARAGE SEARCH BLOCK ================= */}
          <div className="max-w-5xl mx-auto pt-2">
            <GarageSearch
              onSearchSubmit={handleGarageSearchSubmit}
              onRequestQuoteClick={onNavigateToQuote}
              activeVehicleName={activeVehicle}
            />
          </div>

        </div>
      </section>

      {/* ================= BROWSE POPULAR CATEGORIES ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Explore Top Categories</h2>
            <p className="text-slate-400 text-xs mt-0.5">Filter genuine OEM and high-quality replacement parts</p>
          </div>

          <button
            onClick={onNavigateToCatalog}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigateToCatalog()}
              className="group p-4 bg-slate-900/80 hover:bg-slate-850 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all duration-300 text-left flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-1 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-500/40 flex items-center justify-center transition-colors">
                {getCategoryIcon(cat.iconName)}
              </div>

              <div>
                <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  {cat.count.toLocaleString()} Parts
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ================= PRODUCT LISTING GRID SECTION ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProductGrid
          products={PRODUCTS}
          onAddToCart={onAddToCart}
          activeVehicle={activeVehicle}
          searchQuery={searchQuery}
          onClearFilters={() => setSearchQuery('')}
        />
      </div>

      {/* ================= HARD-TO-FIND PART QUOTE BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Can't Find Your Part Listed?</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Get Competitive Quotes From <br className="hidden sm:inline" />
                <span className="text-amber-400">500+ Verified South African Scrap Yards</span>
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
                Enter your 17-character VIN or snap a picture of your broken part. Verified suppliers across Johannesburg, Cape Town, and Durban will quote you directly on WhatsApp or Email within 30 minutes.
              </p>

              {/* Recent Live Quotes Feed */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {RECENT_QUOTES.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span className="font-bold text-amber-400">{q.vehicle}</span>
                      <span>{q.timeAgo}</span>
                    </div>
                    <p className="text-white font-semibold line-clamp-1 mt-1">{q.part}</p>
                    <div className="flex justify-between items-center mt-2 text-[10px] text-emerald-400 font-bold">
                      <span>{q.status}</span>
                      <span>From R {q.priceFromZAR}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Card */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Submit Part Sourcing Request</h3>
                <p className="text-xs text-slate-400 mt-1">100% Free & No Obligation</p>
              </div>

              <button
                onClick={onNavigateToQuote}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Request A Quote Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
