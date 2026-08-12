import type React from 'react';
import { Car, ShieldCheck, Truck, Zap, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: 'storefront' | 'catalog' | 'quote' | 'checkout') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      {/* Trust Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="flex items-start gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Fitment Guarantee</h4>
              <p className="text-xs text-slate-400 mt-0.5">Every part is VIN-matched for your exact vehicle. Full refund if it doesn't fit.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/48h Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Via The Courier Guy, RAM, or Pargo pickup. Free delivery over R1,500.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">500+ Verified Suppliers</h4>
              <p className="text-xs text-slate-400 mt-0.5">Scrap yards, OEM importers and specialists across all 9 SA provinces.</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-6 border-t border-slate-800">
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Shop</h5>
            <div className="space-y-2">
              <button onClick={() => onNavigate('catalog')} className="block text-xs text-slate-400 hover:text-amber-400 transition">Browse All Parts</button>
              <button onClick={() => onNavigate('quote')} className="block text-xs text-slate-400 hover:text-amber-400 transition">Request a Quote</button>
              <button onClick={() => onNavigate('storefront')} className="block text-xs text-slate-400 hover:text-amber-400 transition">Popular Categories</button>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Support</h5>
            <div className="space-y-2">
              <span className="block text-xs text-slate-400">Returns & Refunds</span>
              <span className="block text-xs text-slate-400">Shipping Policy</span>
              <span className="block text-xs text-slate-400">FAQ</span>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Company</h5>
            <div className="space-y-2">
              <span className="block text-xs text-slate-400">About WHATPART</span>
              <span className="block text-xs text-slate-400">Sell on WHATPART</span>
              <span className="block text-xs text-slate-400">Careers</span>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Contact</h5>
            <div className="space-y-2">
              <a href="tel:0800942872" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition">
                <Phone className="w-3 h-3" /> 0800 942 872
              </a>
              <a href="mailto:support@whatpart.co.za" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition">
                <Mail className="w-3 h-3" /> support@whatpart.co.za
              </a>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3 h-3" /> Johannesburg, South Africa
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center">
              <Car className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-sm font-black text-white">
              WHAT<span className="text-amber-500">PART</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} WHATPART (Pty) Ltd. All rights reserved. South Africa.
          </p>
        </div>
      </div>
    </footer>
  );
};
