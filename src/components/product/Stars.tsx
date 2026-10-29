import { Star } from 'lucide-react';

export function Stars({ value, count, size = 'sm' }: { value: number; count: number; size?: 'sm' | 'md' }) {
  if (count === 0) return <span className="text-xs text-slate-500">No reviews yet</span>;
  const px = size === 'sm' ? 'size-3.5' : 'size-4.5';
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Rated ${value.toFixed(1)} out of 5 from ${count} reviews`}>
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${px} ${value >= i - 0.25 ? 'fill-brand-500 text-brand-500' : value >= i - 0.75 ? 'fill-brand-500/50 text-brand-500' : 'text-slate-300'}`} />
        ))}
      </span>
      <span className="text-xs text-slate-600">({count})</span>
    </span>
  );
}
