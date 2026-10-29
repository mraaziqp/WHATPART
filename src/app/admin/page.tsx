import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdminPage } from '@/lib/guards';
import { formatRand } from '@/lib/format';
import { showDemoSellers } from '@/lib/catalog';

export default async function AdminOverview() {
  await requireAdminPage();
  const since = new Date(Date.now() - 30 * 86400000);
  const [awaitingPayment, toShip, pendingSellers, openRequests, paid30, customers, liveOffers] = await Promise.all([
    db.order.count({ where: { status: 'PENDING_PAYMENT' } }),
    db.order.count({ where: { status: { in: ['PAID', 'PROCESSING'] } } }),
    db.seller.count({ where: { status: 'PENDING' } }),
    db.quoteRequest.count({ where: { status: { in: ['OPEN', 'QUOTED'] } } }),
    db.order.aggregate({ where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: since } }, _sum: { totalCents: true }, _count: true }),
    db.user.count(),
    db.offer.count({ where: { active: true, stock: { gt: 0 }, seller: { status: 'ACTIVE', isDemo: false } } }),
  ]);

  const tiles: [string, string | number, string, boolean?][] = [
    ['Orders awaiting payment', awaitingPayment, '/admin/orders?status=PENDING_PAYMENT', awaitingPayment > 0],
    ['Paid, not yet shipped', toShip, '/admin/orders?status=PAID', toShip > 0],
    ['Sellers to approve', pendingSellers, '/admin/sellers', pendingSellers > 0],
    ['Open part requests', openRequests, '/admin/requests', openRequests > 0],
    [`Sales, 30 days (${paid30._count} orders)`, formatRand(paid30._sum.totalCents ?? 0), '/admin/orders'],
    ['Registered customers', customers, '/admin'],
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map(([label, value, href, attention]) => (
          <Link key={label} href={href} className="card p-4 hover:border-slate-300">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${attention ? 'text-red-600' : ''}`}>{value}</p>
          </Link>
        ))}
      </div>
      <div className={`card p-4 text-sm ${showDemoSellers() ? 'border-amber-300 bg-amber-50' : ''}`}>
        <p className="font-semibold">Catalogue mode: {showDemoSellers() ? 'demo stock visible' : 'real sellers only'}</p>
        <p className="mt-1 text-slate-600">
          {liveOffers} in-stock listings from real sellers.{' '}
          {showDemoSellers()
            ? 'Demo sellers’ stock is shown so the shop looks full. Set SHOW_DEMO_SELLERS=false in /opt/whatpart/app.env and redeploy once real sellers have listed.'
            : 'Demo stock is hidden.'}
        </p>
      </div>
    </div>
  );
}
