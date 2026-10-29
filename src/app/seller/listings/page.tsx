import Link from 'next/link';
import { CircleCheck, PlusCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { requireSellerPage } from '@/lib/guards';
import { CONDITION_LABEL } from '@/lib/format';
import { ListingRow } from './ListingRow';

type Props = { searchParams: Promise<{ q?: string; page?: string; added?: string }> };
const PER_PAGE = 50;

export default async function ListingsPage({ searchParams }: Props) {
  const { seller } = await requireSellerPage('/seller/listings');
  if (seller.status !== 'ACTIVE') return null;
  const { q = '', page = '1', added } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const where = {
    sellerId: seller.id,
    ...(q.trim() ? { product: { OR: [{ title: { contains: q.trim(), mode: 'insensitive' as const } }, { partNumber: { contains: q.trim(), mode: 'insensitive' as const } }] } } : {}),
  };
  const [offers, total] = await Promise.all([
    db.offer.findMany({
      where,
      include: { product: { select: { slug: true, title: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } } } },
      orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
      take: PER_PAGE,
      skip: (p - 1) * PER_PAGE,
    }),
    db.offer.count({ where }),
  ]);

  return (
    <div className="space-y-4">
      {added && <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"><CircleCheck className="size-4" /> Listing added. It’s live in search now.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Your listings <span className="font-normal text-slate-500">({total})</span></h2>
        <div className="flex gap-2">
          <form className="flex gap-2">
            <input name="q" defaultValue={q} placeholder="Search your listings" className="input w-56 py-2" />
          </form>
          <Link href="/seller/listings/new" className="btn-primary"><PlusCircle className="size-4" /> Add a part</Link>
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-600">{q ? 'No listings match that search.' : 'You have no listings yet.'}</div>
      ) : (
        <div className="card divide-y divide-slate-100">
          <div className="hidden grid-cols-[48px_1fr_110px_90px_70px_90px] gap-3 px-3 py-2 text-xs font-semibold text-slate-500 sm:grid">
            <span /><span>Part</span><span>Price</span><span>Stock</span><span>Live</span><span />
          </div>
          {offers.map((o) => (
            <ListingRow
              key={o.id}
              offerId={o.id}
              slug={o.product.slug}
              title={o.product.title}
              image={o.product.images[0]?.url ?? null}
              conditionLabel={CONDITION_LABEL[o.condition]}
              price={o.priceCents / 100}
              stock={o.stock}
              active={o.active}
            />
          ))}
        </div>
      )}
      {total > PER_PAGE && (
        <div className="flex justify-center gap-2 text-sm">
          {p > 1 && <Link className="btn-outline" href={`?q=${encodeURIComponent(q)}&page=${p - 1}`}>Previous</Link>}
          {p * PER_PAGE < total && <Link className="btn-outline" href={`?q=${encodeURIComponent(q)}&page=${p + 1}`}>Next</Link>}
        </div>
      )}
    </div>
  );
}
