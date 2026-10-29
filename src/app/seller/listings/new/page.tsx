import Link from 'next/link';
import { ArrowLeft, PackagePlus, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { requireSellerPage } from '@/lib/guards';
import { productsIndex } from '@/lib/search';
import { formatRand } from '@/lib/format';
import { NewOfferForm } from './NewOfferForm';

type Props = { searchParams: Promise<{ q?: string; product?: string }> };

export default async function NewListingPage({ searchParams }: Props) {
  const { seller } = await requireSellerPage('/seller/listings/new');
  if (seller.status !== 'ACTIVE') return null;
  const { q = '', product: productId } = await searchParams;

  if (productId) {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { brand: true, category: true, images: { take: 1 }, offers: { where: { sellerId: seller.id }, select: { condition: true } } },
    });
    if (!product) return <p className="card p-6">That part wasn’t found.</p>;
    return (
      <div className="space-y-5">
        <Link href={`/seller/listings/new?q=${encodeURIComponent(q)}`} className="inline-flex items-center gap-1 text-sm text-navy-700 hover:underline"><ArrowLeft className="size-4" /> Back to search</Link>
        <div className="card flex gap-4 p-4">
          <span className="size-20 shrink-0 rounded bg-slate-50 p-2">{product.images[0] && <img src={product.images[0].url} alt="" className="size-full object-contain" />}</span>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">{product.brand.name} · {product.category.name}</p>
            <p className="font-semibold">{product.title}</p>
            <p className="text-xs text-slate-500">Part no. {product.partNumber}</p>
            {product.offers.length > 0 && <p className="mt-1 text-xs text-amber-700">You already list this part as: {product.offers.map((o) => o.condition.toLowerCase().replace('_', ' ')).join(', ')}.</p>}
          </div>
        </div>
        <div className="card p-5"><NewOfferForm productId={product.id} /></div>
      </div>
    );
  }

  const hits = q.trim()
    ? (await productsIndex().search(q.trim(), { limit: 20, attributesToRetrieve: ['id', 'title', 'brand', 'partNumber', 'image', 'priceCents', 'sellerCount'] })).hits
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold">Add a part</h2>
        <p className="text-sm text-slate-600">Search our catalogue first. If the part is already listed, add your offer so buyers can compare you on the same page.</p>
      </div>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} autoFocus placeholder="Part name, part number or OEM number" className="input" />
        <button className="btn-dark"><Search className="size-4" /> Search</button>
      </form>

      {q.trim() && (
        hits.length === 0 ? (
          <p className="card p-6 text-sm text-slate-600">No catalogue parts match “{q}”.</p>
        ) : (
          <ul className="card divide-y divide-slate-100">
            {hits.map((h) => (
              <li key={h.id} className="flex items-center gap-3 p-3">
                <span className="size-12 shrink-0 rounded bg-slate-50 p-1">{h.image && <img src={h.image} alt="" className="size-full object-contain" />}</span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{h.title}</p>
                  <p className="text-xs text-slate-500">{h.brand} · {h.partNumber} · {h.sellerCount} seller{h.sellerCount === 1 ? '' : 's'} from {formatRand(h.priceCents)}</p>
                </div>
                <Link href={`/seller/listings/new?product=${h.id}&q=${encodeURIComponent(q)}`} className="btn-primary shrink-0 py-1.5">Sell this</Link>
              </li>
            ))}
          </ul>
        )
      )}

      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex gap-3">
          <PackagePlus className="size-6 shrink-0 text-brand-600" />
          <div>
            <p className="font-semibold">Part not in the catalogue?</p>
            <p className="text-sm text-slate-600">Add it with photos and the vehicles it fits.</p>
          </div>
        </div>
        <Link href="/seller/products/new" className="btn-outline">Add a new part</Link>
      </div>
    </div>
  );
}
