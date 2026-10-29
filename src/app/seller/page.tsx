import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSellerPage } from '@/lib/guards';
import { daysAgo, formatRand } from '@/lib/format';

export default async function SellerDashboard() {
  const { seller } = await requireSellerPage('/seller');
  if (seller.status !== 'ACTIVE') return null;

  const since = daysAgo(30);
  const [listings, stock, toConfirm, toShip, openRequests, sold, lowStock] = await Promise.all([
    db.offer.count({ where: { sellerId: seller.id, active: true } }),
    db.offer.aggregate({ where: { sellerId: seller.id, active: true }, _sum: { stock: true } }),
    db.orderItem.count({ where: { sellerId: seller.id, status: 'PENDING', order: { status: { not: 'CANCELLED' } } } }),
    db.orderItem.count({ where: { sellerId: seller.id, status: { in: ['PENDING', 'ACCEPTED'] }, order: { status: { in: ['PAID', 'PROCESSING'] } } } }),
    db.quoteRequest.count({ where: { status: { in: ['OPEN', 'QUOTED'] }, createdAt: { gte: since }, responses: { none: { sellerId: seller.id } } } }),
    db.orderItem.findMany({ where: { sellerId: seller.id, status: { notIn: ['CANCELLED', 'RETURNED'] }, order: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: since } } }, select: { unitCents: true, quantity: true } }),
    db.offer.findMany({ where: { sellerId: seller.id, active: true, stock: { lte: 2 } }, include: { product: { select: { title: true, slug: true } } }, orderBy: { stock: 'asc' }, take: 8 }),
  ]);
  const revenue = sold.reduce((n, i) => n + i.unitCents * i.quantity, 0);

  const tiles: [string, string | number, string, string?][] = [
    ['Orders to confirm', toConfirm, '/seller/orders', toConfirm > 0 ? 'text-red-600' : undefined],
    ['Ready to ship', toShip, '/seller/orders', toShip > 0 ? 'text-red-600' : undefined],
    ['New part requests', openRequests, '/seller/requests'],
    ['Sales, last 30 days', formatRand(revenue), '/seller/orders'],
    ['Active listings', listings, '/seller/listings'],
    ['Units in stock', stock._sum.stock ?? 0, '/seller/listings'],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map(([label, value, href, cls]) => (
          <Link key={label} href={href} className="card p-4 hover:border-slate-300">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${cls ?? ''}`}>{value}</p>
          </Link>
        ))}
      </div>

      {lowStock.length > 0 && (
        <section className="card p-5">
          <h2 className="mb-3 font-bold">Running low</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {lowStock.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                <Link href={`/p/${o.product.slug}`} className="line-clamp-1 hover:text-navy-700">{o.product.title}</Link>
                <span className={`shrink-0 font-semibold ${o.stock === 0 ? 'text-red-600' : 'text-amber-600'}`}>{o.stock === 0 ? 'Out of stock' : `${o.stock} left`}</span>
              </li>
            ))}
          </ul>
          <Link href="/seller/listings" className="mt-3 inline-block text-sm font-semibold text-navy-700 hover:underline">Update stock</Link>
        </section>
      )}

      {listings === 0 && (
        <section className="card p-6 text-center">
          <h2 className="text-lg font-bold">List your first part</h2>
          <p className="mt-1 text-sm text-slate-600">Find it in our catalogue and add your price and stock, or add a new part with photos.</p>
          <Link href="/seller/listings/new" className="btn-primary mt-4">Add a part</Link>
        </section>
      )}
    </div>
  );
}
