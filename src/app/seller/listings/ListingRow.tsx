'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { updateOffer, type FormState } from '../actions';

type Props = {
  offerId: string;
  slug: string;
  title: string;
  image: string | null;
  conditionLabel: string;
  price: number; // rands
  stock: number;
  active: boolean;
};

export function ListingRow(p: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateOffer, {});
  return (
    <form action={action} className="grid grid-cols-[48px_1fr] items-center gap-3 p-3 sm:grid-cols-[48px_1fr_110px_90px_70px_90px]">
      <input type="hidden" name="offerId" value={p.offerId} />
      <span className="size-12 rounded bg-slate-50 p-1">{p.image && <img src={p.image} alt="" className="size-full object-contain" />}</span>
      <div className="min-w-0">
        <Link href={`/p/${p.slug}`} className="line-clamp-2 text-sm font-medium hover:text-navy-700">{p.title}</Link>
        <p className="text-xs text-slate-500">{p.conditionLabel}</p>
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      </div>
      <label className="col-start-2 flex items-center gap-1 text-sm sm:col-start-auto">
        <span className="text-slate-500 sm:hidden">Price</span>
        <span className="text-slate-500">R</span>
        <input name="price" type="number" step="0.01" min="1" defaultValue={p.price} className="input py-1.5" aria-label="Price in rands" />
      </label>
      <label className="col-start-2 flex items-center gap-1 text-sm sm:col-start-auto">
        <span className="text-slate-500 sm:hidden">Stock</span>
        <input name="stock" type="number" min="0" defaultValue={p.stock} className={`input py-1.5 ${p.stock === 0 ? 'border-red-400' : ''}`} aria-label="Stock" />
      </label>
      <label className="col-start-2 flex items-center gap-2 text-sm sm:col-start-auto">
        <input name="active" type="checkbox" defaultChecked={p.active} className="size-4 accent-brand-600" /> <span>Live</span>
      </label>
      <button type="submit" disabled={pending} className="btn-outline col-start-2 py-1.5 sm:col-start-auto">
        {pending ? <Loader2 className="size-4 animate-spin" /> : state.ok ? <><Check className="size-4 text-emerald-600" /> Saved</> : 'Save'}
      </button>
    </form>
  );
}
