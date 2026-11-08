import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdminPage } from '@/lib/guards';
import { daysAgo, formatRand } from '@/lib/format';
import { showDemoSellers } from '@/lib/catalog';
import { getThemeConfig } from '@/lib/theme';
import { Logo } from '@/components/Logo';
import { Sliders, RefreshCw, Eye, EyeOff, Sparkles, Store, Package } from 'lucide-react';
import { ActionButton } from './ActionButton';
import { triggerReindexAction, toggleDemoSellersAction } from './actions';

export default async function AdminOverview() {
  await requireAdminPage();
  const since = daysAgo(30);
  const [awaitingPayment, toShip, pendingSellers, openRequests, paid30, customers, liveOffers, totalProducts, theme] =
    await Promise.all([
      db.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      db.order.count({ where: { status: { in: ['PAID', 'PROCESSING'] } } }),
      db.seller.count({ where: { status: 'PENDING' } }),
      db.quoteRequest.count({ where: { status: { in: ['OPEN', 'QUOTED'] } } }),
      db.order.aggregate({
        where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }, createdAt: { gte: since } },
        _sum: { totalCents: true },
        _count: true,
      }),
      db.user.count(),
      db.offer.count({ where: { active: true, stock: { gt: 0 }, seller: { status: 'ACTIVE', isDemo: false } } }),
      db.product.count({ where: { active: true } }),
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

  const demoActive = showDemoSellers();

  return (
    <div className="space-y-6">
      {/* ─── Metric Tiles ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map(([label, value, href, attention]) => (
          <Link key={label} href={href} className="card p-4 hover:border-slate-300 transition">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${attention ? 'text-red-600' : ''}`}>{value}</p>
          </Link>
        ))}
      </div>

      {/* ─── Appearance & Looks Live Studio Banner ────────────────────────── */}
      <div className="card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex size-14 items-center justify-center rounded-xl bg-slate-900 p-2 shadow-inner">
              <Logo
                variant={theme.logoVariant === 'dark' ? 'gold' : theme.logoVariant}
                height={32}
                compact={theme.logoCompact}
                customUrl={theme.customLogoUrl}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🇿🇦</span>
                <h2 className="text-base font-bold text-slate-900">Storefront Appearance & Live Studio</h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  Live & Connected
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Active Theme: <span className="font-semibold text-slate-900">{theme.name}</span>
                {' '}• Logo: <span className="capitalize font-semibold text-slate-900">{theme.logoVariant} ({theme.logoHeight}px)</span>
                {' '}• Header: <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{theme.headerBgColor}</span>
                {' '}• Accent: <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">{theme.accentColor}</span>
              </p>
            </div>
          </div>
          <Link href="/admin/appearance" className="btn-primary shrink-0 flex items-center gap-2">
            <Sliders className="size-4" /> Open Live Customizer Studio →
          </Link>
        </div>
      </div>

      {/* ─── Catalogue & Search Controls ──────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Catalogue & Demo Mode */}
        <div className={`card p-5 ${demoActive ? 'border-amber-300 bg-amber-50/50' : ''}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Store className="size-4 text-brand-600" /> Catalogue & Sellers Mode
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                demoActive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {demoActive ? 'Demo Stock Visible' : 'Real Sellers Only'}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-600">
            {liveOffers} in-stock listings from real sellers. Total {totalProducts} active catalogue parts.
            {demoActive
              ? ' Demo sellers are currently shown so the store looks stocked while real merchants onboard.'
              : ' Only real verified sellers are visible to customers.'}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Quick Toggle:</span>
            <ActionButton
              action={async () => toggleDemoSellersAction(!demoActive)}
              label={demoActive ? 'Hide Demo Sellers' : 'Show Demo Sellers'}
              variant={demoActive ? 'outline' : 'primary'}
            />
          </div>
        </div>

        {/* Search Engine & Reindexing */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Package className="size-4 text-indigo-600" /> Search Index (Meilisearch)
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {totalProducts} Indexed Parts
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-600">
            Meilisearch powers the instant search box, part suggestions, and vehicle fitment queries.
            Rebuilding the index performs an atomic swap with zero customer downtime.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Atomic Swap:</span>
            <ActionButton
              action={async () => triggerReindexAction()}
              label="Reindex Catalogue Now"
              confirm="Rebuild the entire search index now? This runs in the background and swaps atomically."
              variant="outline"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
