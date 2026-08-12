import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Car, 
  ChevronDown, 
  Menu, 
  X, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  Phone, 
  Grid, 
  Sparkles 
} from 'lucide-react';
import { CATEGORIES } from '../data/catalogData';
import { useStore } from '../store/useStore';

interface NavbarProps {
  onNavigate: (page: 'storefront' | 'catalog' | 'quote' | 'checkout') => void;
  activePage: 'storefront' | 'catalog' | 'quote' | 'checkout';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  activePage,
  searchQuery,
  setSearchQuery,
}) => {
  const { openCart, getCartItemCount, activeVehicle, selectedCity, setSelectedCity } = useStore();
  const cartCount = getCartItemCount();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const saLocations = [
    'Johannesburg, GP',
    'Pretoria, GP',
    'Cape Town, WC',
    'Durban, KZN',
    'Gqeberha, EC',
    'Bloemfontein, FS',
    'Centurion, GP'
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-xl">
      {/* Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 text-xs font-semibold px-4 py-1.5 flex justify-between items-center max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <span className="text-sm">🇿🇦</span> South Africa's Premier Autoparts Marketplace
          </span>
          <span className="hidden md:inline-flex items-center gap-1 bg-slate-950/15 px-2 py-0.5 rounded text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Guaranteed Fitment Promise
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-[11px]">
          <button 
            onClick={() => onNavigate('quote')}
            className="hover:underline flex items-center gap-1 text-slate-950 font-bold bg-white/30 px-2 py-0.5 rounded transition focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
          >
            <FileText className="w-3 h-3" /> Need a Custom Quote?
          </button>
          <a href="tel:0800942872" className="hidden sm:flex items-center gap-1 hover:underline">
            <Phone className="w-3 h-3" /> 0800 942 872
          </a>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onNavigate('storefront')} 
              className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-xl"
              aria-label="WHATPART Homepage"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6 text-slate-950" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                  WHAT<span className="text-amber-500">PART</span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">ZA</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
                  Autoparts Marketplace
                </span>
              </div>
            </button>
          </div>

          {/* Location & Vehicle Quick Chips (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <div className="relative">
              <button 
                onClick={() => setShowLocationPicker(!showLocationPicker)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                aria-label="Select delivery city"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="max-w-[110px] truncate">{selectedCity || 'Select City'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLocationPicker && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-1">
                  {saLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setSelectedCity(loc); setShowLocationPicker(false); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition flex items-center justify-between ${selectedCity === loc ? 'text-amber-400 font-bold bg-slate-700/40' : 'text-slate-200'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Vehicle Pill */}
            {activeVehicle.displayName && (
              <button
                onClick={() => onNavigate('storefront')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition group focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                aria-label={`Active vehicle: ${activeVehicle.displayName}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Car className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold truncate max-w-[160px] font-mono">{activeVehicle.displayName}</span>
              </button>
            )}
          </div>

          {/* Prominent Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="relative w-full flex items-center">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="h-11 px-3 bg-slate-800 text-slate-300 border border-r-0 border-slate-700 rounded-l-xl text-xs font-semibold hover:bg-slate-750 flex items-center gap-1.5 transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                >
                  <Grid className="w-3.5 h-3.5 text-amber-400" />
                  <span>Categories</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {categoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onNavigate('catalog');
                          setCategoryDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center justify-between transition"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                          {cat.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by OEM #, Part Name (e.g. Brake Pads, Turbo)..."
                className="w-full h-11 bg-slate-950 text-white placeholder-slate-400 text-sm px-4 border border-slate-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition"
                aria-label="Search auto parts"
              />

              <button
                type="button"
                onClick={() => onNavigate('catalog')}
                className="h-11 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-r-xl transition flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                aria-label="Execute search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('catalog')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                activePage === 'catalog' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Grid className="w-4 h-4 text-amber-400" />
              <span>Browse Parts</span>
            </button>

            <button
              onClick={() => onNavigate('quote')}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                activePage === 'quote' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Request Quote</span>
            </button>

            {/* Shopping Cart Button connected to Zustand openCart */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 transition flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[11px] rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce font-mono">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden xl:inline text-xs font-semibold text-slate-200">
                Cart
              </span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by OEM # or Part Name..."
              className="w-full h-11 bg-slate-950 text-white placeholder-slate-400 text-xs px-4 rounded-xl border border-slate-700 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              aria-label="Mobile search"
            />
            <button
              onClick={() => onNavigate('catalog')}
              className="absolute right-1 h-9 px-3 bg-amber-500 text-slate-950 rounded-lg font-bold text-xs flex items-center justify-center"
              aria-label="Search parts"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onNavigate('storefront'); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-slate-800 text-xs font-semibold text-white flex items-center gap-2 border border-slate-700"
            >
              <Car className="w-4 h-4 text-amber-400" /> Storefront
            </button>
            <button
              onClick={() => { onNavigate('catalog'); setMobileMenuOpen(false); }}
              className="p-3 rounded-xl bg-slate-800 text-xs font-semibold text-white flex items-center gap-2 border border-slate-700"
            >
              <Grid className="w-4 h-4 text-amber-400" /> Catalog
            </button>
          </div>

          <button
            onClick={() => { onNavigate('quote'); setMobileMenuOpen(false); }}
            className="w-full p-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Request Custom Quote
          </button>
        </div>
      )}
    </header>
  );
};
