'use client';

import { useActionState, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { submitReview } from '@/app/account/actions';

type Props = {
  productId: string;
  vehicles: { id: string; label: string }[];
  existing: { rating: number; title: string; body: string; vehicleId: string | null } | null;
};

export function ReviewForm({ productId, vehicles, existing }: Props) {
  const [state, action, pending] = useActionState(submitReview, {});
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);

  if (state.ok) return <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{state.ok}</p>;

  return (
    <form action={action} className="space-y-3 rounded-lg border border-slate-200 p-4">
      <p className="text-sm font-semibold">{existing ? 'Update your review' : 'You bought this part. How was it?'}</p>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>
            <Star className={`size-7 ${(hover || rating) >= n ? 'fill-brand-500 text-brand-500' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
      <input name="title" defaultValue={existing?.title} maxLength={100} placeholder="Headline, e.g. Perfect fit, quiet braking" className="input" aria-label="Headline" />
      <textarea name="body" defaultValue={existing?.body} rows={3} maxLength={2000} placeholder="How did it fit? How has it performed?" className="input" aria-label="Review" />
      {vehicles.length > 0 && (
        <select name="vehicleId" defaultValue={existing?.vehicleId ?? ''} className="input" aria-label="Vehicle fitted to">
          <option value="">Fitted to (optional)</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
      )}
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary">{pending && <Loader2 className="size-4 animate-spin" />} {existing ? 'Update review' : 'Post review'}</button>
    </form>
  );
}
