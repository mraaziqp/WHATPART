import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { StorefrontPage } from './app/page';
import { ProductGrid } from './components/ProductGrid';
import { RequestQuotePage } from './app/quote/page';
import { CheckoutPage } from './app/checkout/page';
import { PRODUCTS } from './data/catalogData';
import { useStore } from './store/useStore';

export default function App() {
  const [activePage, setActivePage] = useState<'storefront' | 'catalog' | 'quote' | 'checkout'>('storefront');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem, activeVehicle } = useStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950 flex flex-col justify-between">
      
      {/* 1. STOREFRONT HERO & STICKY NAVIGATION */}
      <Navbar
        onNavigate={(p) => setActivePage(p)}
        activePage={activePage}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content Router */}
      <main className="flex-1 pb-16">
        {activePage === 'storefront' && (
          <StorefrontPage
            onAddToCart={(prod) => addItem(prod)}
            onNavigateToQuote={() => setActivePage('quote')}
            onNavigateToCatalog={() => setActivePage('catalog')}
            activeVehicle={activeVehicle.displayName}
            setActiveVehicle={() => { /* TODO: parse display name into vehicle parts */ }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activePage === 'catalog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <ProductGrid
              products={PRODUCTS}
              searchQuery={searchQuery}
              onClearFilters={() => setSearchQuery('')}
            />
          </div>
        )}

        {activePage === 'quote' && (
          <RequestQuotePage onBackToStorefront={() => setActivePage('storefront')} />
        )}

        {activePage === 'checkout' && (
          <CheckoutPage
            onBackToCart={() => setActivePage('catalog')}
            onOrderSuccess={() => {}}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(p) => setActivePage(p)} />

      {/* Interactive Cart Drawer connected to Zustand */}
      <CartDrawer
        onNavigateToCheckout={() => setActivePage('checkout')}
        onNavigateToCatalog={() => setActivePage('catalog')}
      />

    </div>
  );
}
