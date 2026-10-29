import Link from 'next/link';
import { Clock, LayoutDashboard, MessageSquareQuote, Package, PlusCircle, ShieldOff, Tags } from 'lucide-react';
import { requireSellerPage } from '@/lib/guards';

export const metadata = { title: 'Seller portal', robots: { index: false } };

const NAV = [
  ['/seller', 'Dashboard', LayoutDashboard],
  ['/seller/listings', 'Listings', Tags],
  ['/seller/listings/new', 'Add a part', PlusCircle],
  ['/seller/orders', 'Orders', Package],
  ['/seller/requests', 'Part requests', MessageSquareQuote],
] as const;

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const { seller } = await requireSellerPage('/seller');

  return (
    <div className="container-page py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seller portal</p>
          <h1 className="text-2xl font-bold">{seller.name}</h1>
        </div>
        <Link href={`/search?q=${encodeURIComponent(seller.name)}`} className="text-sm font-medium text-navy-700 hover:underline">View my store</Link>
      </div>

      {seller.status === 'PENDING' ? (
        <div className="card flex gap-4 p-6">
          <Clock className="size-8 shrink-0 text-brand-600" />
          <div>
            <h2 className="text-lg font-bold">Application received</h2>
            <p className="mt-1 text-sm text-slate-600">
              We’re reviewing {seller.name}. We’ll contact {seller.contactName ?? 'you'} on {seller.phone ?? seller.email} shortly,
              usually within one business day. Once approved you can list parts and receive orders here.
            </p>
          </div>
        </div>
      ) : seller.status === 'SUSPENDED' ? (
        <div className="card flex gap-4 p-6">
          <ShieldOff className="size-8 shrink-0 text-red-600" />
          <div>
            <h2 className="text-lg font-bold">Account suspended</h2>
            <p className="mt-1 text-sm text-slate-600">Your listings are hidden. Please contact WHATPART support to resolve this.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Seller portal">
            {NAV.map(([href, label, Icon]) => (
              <Link key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:text-slate-950">
                <Icon className="size-4" /> {label}
              </Link>
            ))}
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      )}
    </div>
  );
}
