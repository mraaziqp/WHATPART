'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { createDeal, type ActionResult } from '../actions';

type Offer = { id: string; label: string; priceCents: number };

export function DealForm({ offers, defaultStart }: { offers: Offer[]; defaultStart: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(createDeal, {});
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="offerId" className="label">Offer</label>
        <select id="offerId" name="offerId" className="input">
          {offers.map((o) => <option key={o.id} value={o.id}>{o.label} · now R {(o.priceCents / 100).toFixed(2)}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="price" className="label">Deal price (R)</label>
        <input id="price" name="price" type="number" step="0.01" min="1" required className="input" />
      </div>
      <div>
        <label htmlFor="label" className="label">Badge</label>
        <input id="label" name="label" defaultValue="Daily Deal" maxLength={30} className="input" />
      </div>
      <div>
        <label htmlFor="startsAt" className="label">Starts</label>
        <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={defaultStart} required className="input" />
      </div>
      <div>
        <label htmlFor="days" className="label">Runs for (days)</label>
        <input id="days" name="days" type="number" min="1" max="30" defaultValue={1} required className="input" />
      </div>
      {state.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
      {state.ok && <p className="text-sm text-emerald-700 sm:col-span-2">{state.ok}</p>}
      <button type="submit" disabled={pending} className="btn-primary sm:col-span-2">{pending && <Loader2 className="size-4 animate-spin" />} Schedule deal</button>
    </form>
  );
}
