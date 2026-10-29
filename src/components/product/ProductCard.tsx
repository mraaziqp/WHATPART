import Link from 'next/link';
import { CircleCheck, CircleAlert, Zap } from 'lucide-react';
import type { ProductDoc } from '@/lib/search';
import type { SelectedVehicle } from '@/lib/vehicle';
import { dispatchLabel, formatRand } from '@/lib/format';
import { Stars } from './Stars';

export function FitBadge({ doc, vehicle }: { doc: Pick<ProductDoc, 'universal' | 'vehicleIds'>; vehicle: SelectedVehicle | null }) {
  if (!vehicle) return null;
  if (doc.universal) return <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600"><CircleCheck className="size-3.5" /> Universal fit</span>;
  return doc.vehicleIds.includes(vehicle.id) ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CircleCheck className="size-3.5" /> Fits your {vehicle.model}</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700"><CircleAlert className="size-3.5" /> Doesn’t fit your {vehicle.model}</span>
  );
}

export function ProductCard({ doc, vehicle }: { doc: ProductDoc; vehicle: SelectedVehicle | null }) {
  const saving = doc.compareAtCents && doc.compareAtCents > doc.priceCents ? Math.round((1 - doc.priceCents / doc.compareAtCents) * 100) : 0;
  return (
    <Link href={`/p/${doc.slug}`} className="card group flex h-full flex-col overflow-hidden transition hover:border-slate-300 hover:shadow-md">
      <div className="relative aspect-square bg-slate-50 p-6">
        {doc.image && <img src={doc.image} alt={doc.title} loading="lazy" className="size-full object-contain transition group-hover:scale-105" />}
        {doc.hasDeal && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white"><Zap className="size-3" /> Deal</span>
        )}
        {!doc.hasDeal && saving >= 10 && <span className="absolute left-2 top-2 rounded bg-navy-900 px-2 py-0.5 text-xs font-bold text-white">-{saving}%</span>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{doc.brand}</p>
        <h3 className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-navy-700">{doc.title}</h3>
        <Stars value={doc.ratingAvg} count={doc.ratingCount} />
        <FitBadge doc={doc} vehicle={vehicle} />
        <div className="mt-auto pt-2">
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">{formatRand(doc.priceCents)}</span>
            {saving > 0 && <span className="text-xs text-slate-500 line-through">{formatRand(doc.compareAtCents!)}</span>}
          </p>
          <p className={`text-xs ${doc.inStock ? 'text-emerald-700' : 'text-slate-500'}`}>
            {doc.inStock ? dispatchLabel(doc.dispatchDays) : 'Out of stock'}
            {doc.sellerCount > 1 && <span className="text-slate-500"> · {doc.sellerCount} sellers</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}
