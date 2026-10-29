'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { createOffer, type FormState } from '../../actions';
import { OfferFieldset } from '../../OfferFieldset';

export function NewOfferForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createOffer, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <OfferFieldset errors={state.fieldErrors} />
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        {pending && <Loader2 className="size-4 animate-spin" />} Publish listing
      </button>
    </form>
  );
}
