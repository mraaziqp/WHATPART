'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Check, MapPin, ShieldCheck, ShoppingCart, Truck, Zap } from 'lucide-react';
import { useCart } from '@/lib/cart-store';

export type OfferView = {
  id: string;
  sellerName: string;
  sellerCity: string;
  sellerProvince: string;
  sellerVerified: boolean;
  sellerType: string;
  conditionLabel: string;
  priceCents: number;
  wasCents: number | null;
  dealLabel: string | null;
  dealEnds: string | null;
  stock: number;
  warrantyMonths: number;
  dispatchText: string;
};

const rand = (c: number) => `R ${(c / 100).toLocaleString('en-ZA', { minimumFractionDigits: c % 100 ? 2 : 0 })}`;

export function BuyBox({ offers, initialId }: { offers: OfferView[]; initialId: string }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [selected, setSelected] = useState(initialId);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const offer = offers.find((o) => o.id === selected) ?? offers[0];
  const saving = offer.wasCents && offer.wasCents > offer.priceCents ? offer.wasCents - offer.priceCents : 0;

  const addToCart = (go: boolean) => {
    add(offer.id, qty);
    if (go) router.push('/cart');
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    }
  };

  return (
    <div className="card space-y-4 p-5">
      {offer.dealLabel && (
        <p className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
          <Zap className="size-3" /> {offer.dealLabel}{offer.dealEnds && ` · ends ${offer.dealEnds}`}
        </p>
      )}
      <div>
        <p className="text-3xl font-bold">{rand(offer.priceCents)}</p>
        {saving > 0 && (
          <p className="text-sm text-slate-600">
            <span className="line-through">{rand(offer.wasCents!)}</span> <span className="font-semibold text-red-600">Save {rand(saving)}</span>
          </p>
        )}
        <p className="mt-1 text-sm font-medium text-slate-700">{offer.conditionLabel}</p>
      </div>

      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Truck className="size-4 text-emerald-600" />
          <span className={offer.stock > 0 ? 'font-medium text-emerald-700' : 'text-slate-500'}>
            {offer.stock > 0 ? offer.dispatchText : 'Out of stock with this seller'}
          </span>
        </li>
        {offer.stock > 0 && offer.stock <= 3 && <li className="pl-6 text-xs font-semibold text-red-600">Only {offer.stock} left</li>}
        <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-slate-500" /> {offer.warrantyMonths}-month warranty</li>
        <li className="flex items-center gap-2">
          <MapPin className="size-4 text-slate-500" />
          <span>Sold by <strong>{offer.sellerName}</strong>, {offer.sellerCity}</span>
          {offer.sellerVerified && <BadgeCheck className="size-4 text-navy-700" aria-label="Verified seller" />}
        </li>
      </ul>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium" htmlFor="qty">Qty</label>
        <select id="qty" className="input w-20 py-2" value={qty} onChange={(e) => setQty(Number(e.target.value))} disabled={offer.stock === 0}>
          {Array.from({ length: Math.max(1, Math.min(10, offer.stock)) }, (_, i) => i + 1).map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>
      <div className="grid gap-2">
        <button onClick={() => addToCart(false)} disabled={offer.stock === 0} className="btn-primary py-3 text-base">
          {added ? <><Check className="size-5" /> Added to cart</> : <><ShoppingCart className="size-5" /> Add to cart</>}
        </button>
        <button onClick={() => addToCart(true)} disabled={offer.stock === 0} className="btn-dark py-3 text-base">Buy now</button>
      </div>

      {offers.length > 1 && (
        <div className="border-t border-slate-100 pt-4">
          <p className="mb-2 text-sm font-semibold">{offers.length} offers for this part</p>
          <ul className="space-y-2">
            {offers.map((o) => (
              <li key={o.id}>
                <button
                  onClick={() => { setSelected(o.id); setQty(1); }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${o.id === offer.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{o.sellerName}</span>
                    <span className="block text-xs text-slate-500">{o.conditionLabel} · {o.stock > 0 ? o.dispatchText : 'Out of stock'}</span>
                  </span>
                  <span className="shrink-0 font-semibold">{rand(o.priceCents)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
