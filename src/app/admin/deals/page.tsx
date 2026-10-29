import Link from 'next/link';
import { Search } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdminPage } from '@/lib/guards';
import { CONDITION_LABEL, formatRand } from '@/lib/format';
import { offerVisibility } from '@/lib/catalog';
import { productsIndex } from '@/lib/search';
import { ActionButton } from '../ActionButton';
import { endDeal } from '../actions';
import { DealForm } from './DealForm';

type Props = { searchParams: Promise<{ q?: string; product?: string }> };

const when = (d: Date) => d.toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg', dateStyle: 'medium', timeStyle: 'short' });

export default async function AdminDealsPage({ searchParams }: Props) {
  await requireAdminPage();
  const { q = '', product: productId } = await searchParams;
  const now = new Date();

  const deals = await db.deal.findMany({
    where: { endsAt: { gte: now } },
    include: { offer: { include: { seller: { select: { name: true } }, product: { select: { title: true, slug: true } } } } },
    orderBy: { startsAt: 'asc' },
  });
  const hits = q.trim() ? (await productsIndex().search(q.trim(), { limit: 10, attributesToRetrieve: ['id', 'title', 'priceCents'] })).hits : [];
  const product = productId
    ? await db.product.findUnique({ where: { id: productId }, include: { offers: { where: offerVisibility(), include: { seller: { select: { name: true } } } } } })
    : null;
  // datetime-local shows wall-clock time: "now" in SAST is UTC + 2h (the VPS runs on UTC).
  const defaultStart = new Date(now.getTime() + 2 * 3600_000).toISOString().slice(0, 16);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-3">
        <h2 className="text-lg font-bold">Live and upcoming deals ({deals.length})</h2>
        {deals.length === 0 ? (
          <p className="card p-6 text-sm text-slate-600">No deals running. The home page Daily Deals rail and /deals stay hidden until you add some.</p>
        ) : (
          <ul className="card divide-y divide-slate-100">
            {deals.map((d) => {
              const live = d.startsAt <= now;
              return (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
                  <div className="min-w-0">
                    <Link href={`/p/${d.offer.product.slug}`} className="line-clamp-1 font-medium hover:text-navy-700">{d.offer.product.title}</Link>
                    <p className="text-xs text-slate-500">
                      {d.offer.seller.name} · {CONDITION_LABEL[d.offer.condition]} · <strong className="text-red-600">{formatRand(d.priceCents)}</strong>{' '}
                      <span className="line-through">{formatRand(d.offer.priceCents)}</span>
                    </p>
                    <p className="text-xs text-slate-500">{live ? 'Live' : `Starts ${when(d.startsAt)}`} · ends {when(d.endsAt)}</p>
                  </div>
                  <ActionButton action={endDeal.bind(null, d.id)} label={live ? 'End now' : 'Cancel'} confirm="End this deal?" />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card h-fit space-y-4 p-5">
        <h2 className="font-bold">New deal</h2>
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Find a part" className="input" />
          <button className="btn-dark" aria-label="Search"><Search className="size-4" /></button>
        </form>
        {hits.length > 0 && !product && (
          <ul className="divide-y divide-slate-100 text-sm">
            {hits.map((h) => (
              <li key={h.id}><Link href={`/admin/deals?q=${encodeURIComponent(q)}&product=${h.id}`} className="block py-2 hover:text-navy-700">{h.title} <span className="text-slate-500">from {formatRand(h.priceCents)}</span></Link></li>
            ))}
          </ul>
        )}
        {product && (
          product.offers.length ? (
            <>
              <p className="text-sm font-medium">{product.title}</p>
              <DealForm
                offers={product.offers.map((o) => ({ id: o.id, label: `${o.seller.name}, ${CONDITION_LABEL[o.condition]}`, priceCents: o.priceCents }))}
                defaultStart={defaultStart}
              />
            </>
          ) : (
            <p className="text-sm text-slate-600">This part has no live offers.</p>
          )
        )}
      </section>
    </div>
  );
}
