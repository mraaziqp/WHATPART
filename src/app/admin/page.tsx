import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdminPage } from '@/lib/guards';
import { daysAgo, formatRand } from '@/lib/format';
import { showDemoSellers } from '@/lib/catalog';
import { getThemeConfig } from '@/lib/theme';

export default async function AdminOverview() {
  await requireAdminPage();
  const since = daysAgo(30);
  const [awaitingPayment, toShip, pendingSellers, openRequests, paid30, customers, liveOffers, theme] = await Promise.all([
    db.order.count({ where: { status: 'PENDING_PAYMENT' } }),
    db.order.count({ where: { status: { in: ['PAID', 'PROCESSING'] } } }),
    db.seller.count({ where: { status: 'PENDING' } }),
    db.quoteRequest.count({ where: { status: { in: ['OPEN', 'QUOTED'] } } }),
    db.order.aggregate({ where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: since } }, _sum: { totalCents: true }, _count: true }),
    db.user.count(),
    db.offer.count({ where: { active: true, stock: { gt: 0 }, seller: { status: 'ACTIVE', isDemo: false } } }),
    getThemeConfig(),
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

      <div className="card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🇿🇦</span>
              <h2 className="text-base font-bold text-slate-900">South African Storefront Appearance & Looks</h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                Active
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Active Theme: <span className="font-semibold text-slate-900">{theme.name}</span>
              {' '}• Background: <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{theme.pageBgColor}</span>
              {' '}• Primary: <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{theme.primaryColor}</span>
              {' '}• Accent: <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{theme.accentColor}</span>
            </p>
          </div>
          <Link href="/admin/appearance" className="btn-primary shrink-0">
            Customize Colors & Looks →
          </Link>
        </div>
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
