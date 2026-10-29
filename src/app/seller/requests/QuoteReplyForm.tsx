'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { respondToRequest, type FormState } from '../actions';

type Existing = { condition: string; price: number; notes: string | null } | null;

export function QuoteReplyForm({ requestId, existing }: { requestId: string; existing: Existing }) {
  const [state, action, pending] = useActionState<FormState, FormData>(respondToRequest, {});
  return (
    <form action={action} className="mt-3 grid gap-2 sm:grid-cols-[180px_130px_1fr_auto]">
      <input type="hidden" name="requestId" value={requestId} />
      <select name="condition" defaultValue={existing?.condition ?? 'NEW_AFTERMARKET'} className="input py-2" aria-label="Condition">
        <option value="NEW_GENUINE">New, genuine</option>
        <option value="NEW_AFTERMARKET">New, aftermarket</option>
        <option value="REMANUFACTURED">Remanufactured</option>
        <option value="USED">Used, tested</option>
      </select>
      <input name="price" type="number" step="0.01" min="1" required defaultValue={existing?.price} placeholder="Price (R)" className="input py-2" aria-label="Price in rands" />
      <input name="notes" maxLength={500} defaultValue={existing?.notes ?? ''} placeholder="Notes: brand, warranty, lead time" className="input py-2" aria-label="Notes" />
      <button type="submit" disabled={pending} className="btn-primary py-2">
        {pending && <Loader2 className="size-4 animate-spin" />} {existing ? 'Update quote' : 'Send quote'}
      </button>
      {(state.error || state.ok) && <p className={`text-xs sm:col-span-4 ${state.error ? 'text-red-600' : 'text-emerald-700'}`}>{state.error ?? state.ok}</p>}
    </form>
  );
}
