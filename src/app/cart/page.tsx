'use client';

import { formatRand } from '@/lib/format';
import Link from 'next/link';
import { Loader2, ShoppingCart, Trash2, Truck } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { useResolvedCart } from '@/components/cart/useResolvedCart';
import { FREE_DELIVERY_CENTS } from '@/lib/shipping';


export default function CartPage() {
  const { setQuantity, remove } = useCart();
  const { items, subtotalCents, loading } = useResolvedCart();
  const toFree = FREE_DELIVERY_CENTS - subtotalCents;
  const blocked = (items ?? []).some((i) => i.available < i.quantity);

  if (loading) {
    return <div className="container-page flex justify-center py-24"><Loader2 className="size-8 animate-spin text-slate-400" /></div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="card mx-auto flex max-w-lg flex-col items-center gap-3 p-10 text-center">
          <ShoppingCart className="size-10 text-slate-400" />
          <h1 className="text-xl font-bold">Your cart is empty</h1>
          <p className="text-sm text-slate-600">Add your vehicle and find parts that fit.</p>
          <Link href="/" className="btn-primary mt-2">Start shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-6">
      <h1 className="mb-5 text-2xl font-bold">Cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <ul className="card divide-y divide-slate-100">
          {items.map((i) => (
            <li key={i.offerId} className="flex gap-4 p-4">
              <Link href={`/p/${i.slug}`} className="size-20 shrink-0 rounded-lg bg-slate-50 p-2">
                {i.image && <img src={i.image} alt="" className="size-full object-contain" />}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/p/${i.slug}`} className="line-clamp-2 font-medium hover:text-navy-700">{i.title}</Link>
                <p className="mt-0.5 text-xs text-slate-500">{i.conditionLabel} · Sold by {i.sellerName}</p>
                <p className={`text-xs ${i.available > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {i.available === 0 ? 'Out of stock, please remove' : i.available < i.quantity ? `Only ${i.available} available` : i.dispatchText}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <select aria-label="Quantity" className="input w-20 py-1.5" value={i.quantity} onChange={(e) => setQuantity(i.offerId, Number(e.target.value))}>
                    {Array.from({ length: Math.max(i.quantity, Math.min(10, i.available)) }, (_, n) => n + 1).map((n) => <option key={n}>{n}</option>)}
                  </select>
                  <button onClick={() => remove(i.offerId)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"><Trash2 className="size-4" /> Remove</button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{formatRand(i.unitCents * i.quantity)}</p>
                {i.quantity > 1 && <p className="text-xs text-slate-500">{formatRand(i.unitCents)} each</p>}
              </div>
            </li>
          ))}
        </ul>

        <aside className="card h-fit space-y-4 p-5 lg:sticky lg:top-36">
          <div className="flex justify-between text-sm"><span>Subtotal</span><span className="font-semibold">{formatRand(subtotalCents)}</span></div>
          <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
            <Truck className="size-4 shrink-0" />
            {toFree > 0 ? <>Add {formatRand(toFree)} more for free delivery</> : <>You qualify for free delivery</>}
          </p>
          <p className="text-xs text-slate-500">Delivery options and fees are shown at checkout. Prices include all charges.</p>
          {blocked ? (
            <p className="text-sm font-medium text-red-600">Update quantities for items with limited stock to continue.</p>
          ) : (
            <Link href="/checkout" className="btn-primary w-full py-3 text-base">Proceed to checkout</Link>
          )}
          <Link href="/" className="block text-center text-sm font-medium text-navy-700 hover:underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
