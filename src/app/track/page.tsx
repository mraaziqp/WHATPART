import type { Metadata } from 'next';
import { PackageSearch, Truck } from 'lucide-react';
import { db } from '@/lib/db';
import { CONDITION_LABEL, formatRand } from '@/lib/format';

export const metadata: Metadata = { title: 'Track your order', robots: { index: false } };

type Props = { searchParams: Promise<{ order?: string; email?: string }> };

const ORDER_STATUS: Record<string, string> = {
  PENDING_PAYMENT: 'Awaiting payment', PAID: 'Paid, being prepared', PROCESSING: 'Being prepared', SHIPPED: 'Shipped',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled', REFUNDED: 'Refunded',
};
const ITEM_STATUS: Record<string, string> = {
  PENDING: 'Confirming stock', ACCEPTED: 'Stock confirmed', SHIPPED: 'Shipped', DELIVERED: 'Delivered', CANCELLED: 'Cancelled', RETURNED: 'Returned',
};

export default async function TrackPage({ searchParams }: Props) {
  const { order: rawNumber = '', email: rawEmail = '' } = await searchParams;
  const number = rawNumber.trim().toUpperCase().slice(0, 20);
  const email = rawEmail.trim().toLowerCase().slice(0, 160);
  // Both must match, so order numbers alone can't be used to look up other people's orders.
  const order = number && email ? await db.order.findFirst({ where: { number, email }, include: { items: true } }) : null;

  return (
    <div className="container-page max-w-2xl space-y-6 py-10">
      <h1 className="flex items-center gap-2 text-2xl font-bold"><PackageSearch className="size-6 text-brand-600" /> Track your order</h1>
      <form className="card grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]">
        <input name="order" defaultValue={number} placeholder="Order number, e.g. WP-AB12CD3" aria-label="Order number" className="input font-mono uppercase" required />
        <input name="email" type="email" defaultValue={rawEmail} placeholder="Email used at checkout" aria-label="Email" className="input" required />
        <button className="btn-primary">Track</button>
      </form>

      {number && email && !order && (
        <p className="card p-5 text-sm text-slate-600">We couldn’t find an order with that number and email. Check both, or contact us for help.</p>
      )}

      {order && (
        <div className="card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-lg font-bold">{order.number}</p>
            <span className="rounded-full bg-navy-900 px-3 py-1 text-sm font-semibold text-white">{ORDER_STATUS[order.status]}</span>
          </div>
          <p className="text-sm text-slate-600">Placed {order.createdAt.toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg', dateStyle: 'long' })} · Total {formatRand(order.totalCents)}</p>
          <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-start justify-between gap-2 p-3">
                <div>
                  <p className="font-medium">{i.quantity} × {i.productTitle}</p>
                  <p className="text-xs text-slate-500">{CONDITION_LABEL[i.condition]}</p>
                  {i.trackingRef && <p className="mt-1 flex items-center gap-1 text-xs"><Truck className="size-3.5" /> Courier tracking: <strong className="font-mono">{i.trackingRef}</strong></p>}
                </div>
                <span className="text-xs font-semibold text-slate-700">{ITEM_STATUS[i.status]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
