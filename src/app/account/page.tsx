import Link from 'next/link';
import { Package } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { formatRand } from '@/lib/format';
import { SignOutButton } from './SignOutButton';

export const metadata = { title: 'My account', robots: { index: false } };

const STATUS: Record<string, [string, string]> = {
  PENDING_PAYMENT: ['Awaiting payment', 'bg-amber-100 text-amber-800'],
  PAID: ['Paid', 'bg-emerald-100 text-emerald-800'],
  PROCESSING: ['Processing', 'bg-blue-100 text-blue-800'],
  SHIPPED: ['Shipped', 'bg-blue-100 text-blue-800'],
  DELIVERED: ['Delivered', 'bg-emerald-100 text-emerald-800'],
  CANCELLED: ['Cancelled', 'bg-slate-100 text-slate-700'],
  REFUNDED: ['Refunded', 'bg-slate-100 text-slate-700'],
};

export default async function AccountPage() {
  const user = await requireUser('/account');
  const orders = await db.order.findMany({
    // Only orders placed while signed in. Guest orders aren't matched by email because
    // email ownership isn't verified yet.
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 50,
  });

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hi, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <h2 className="mb-3 text-lg font-bold">Your orders</h2>
      {orders.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <Package className="size-10 text-slate-400" />
          <p className="font-semibold">No orders yet</p>
          <Link href="/" className="btn-primary">Start shopping</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const [label, cls] = STATUS[o.status];
            return (
              <li key={o.id} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono font-semibold">{o.number}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
                </div>
                <p className="text-xs text-slate-500">{o.createdAt.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <ul className="mt-2 text-sm text-slate-700">
                  {o.items.map((i) => <li key={i.id}>{i.quantity} × {i.productTitle}{i.trackingRef && <span className="text-slate-500"> · Tracking {i.trackingRef}</span>}</li>)}
                </ul>
                <p className="mt-2 text-sm font-semibold">{formatRand(o.totalCents)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
