import Link from 'next/link';
import { db } from '@/lib/db';
import { requireSellerPage } from '@/lib/guards';
import { CONDITION_LABEL, formatRand } from '@/lib/format';
import { SHIPPING_METHODS, type ShippingMethod } from '@/lib/shipping';
import { ItemActions } from './ItemActions';

type Props = { searchParams: Promise<{ view?: string }> };

const ITEM_STATUS: Record<string, [string, string]> = {
  PENDING: ['New: confirm stock', 'bg-amber-100 text-amber-800'],
  ACCEPTED: ['Stock confirmed', 'bg-blue-100 text-blue-800'],
  SHIPPED: ['Shipped', 'bg-emerald-100 text-emerald-800'],
  DELIVERED: ['Delivered', 'bg-emerald-100 text-emerald-800'],
  CANCELLED: ['Cancelled', 'bg-slate-100 text-slate-600'],
  RETURNED: ['Returned', 'bg-slate-100 text-slate-600'],
};

type Address = { name: string; street: string; suburb: string; city: string; province: string; postalCode: string };

export default async function SellerOrdersPage({ searchParams }: Props) {
  const { seller } = await requireSellerPage('/seller/orders');
  if (seller.status !== 'ACTIVE') return null;
  const view = (await searchParams).view === 'done' ? 'done' : 'open';

  const orders = await db.order.findMany({
    where: {
      items: { some: { sellerId: seller.id, ...(view === 'open' ? { status: { in: ['PENDING', 'ACCEPTED'] } } : { status: { notIn: ['PENDING', 'ACCEPTED'] } }) } },
      ...(view === 'open' ? { status: { not: 'CANCELLED' } } : {}),
    },
    include: { items: { where: { sellerId: seller.id } } },
    orderBy: { createdAt: view === 'open' ? 'asc' : 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Link href="/seller/orders" className={`rounded-full px-4 py-1.5 text-sm font-medium ${view === 'open' ? 'bg-navy-900 text-white' : 'bg-white text-slate-700'}`}>To do</Link>
        <Link href="/seller/orders?view=done" className={`rounded-full px-4 py-1.5 text-sm font-medium ${view === 'done' ? 'bg-navy-900 text-white' : 'bg-white text-slate-700'}`}>Completed</Link>
      </div>

      {orders.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-600">{view === 'open' ? 'Nothing to do right now.' : 'No completed orders yet.'}</div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const paid = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.status);
            const addr = o.shippingAddr as Address;
            return (
              <li key={o.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-mono font-semibold">{o.number}</p>
                    <p className="text-xs text-slate-500">{o.createdAt.toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${paid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {paid ? 'Paid' : o.status === 'CANCELLED' ? 'Cancelled' : 'Awaiting payment'}
                  </span>
                </div>
                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm">
                  {paid ? (
                    <>
                      <p className="font-medium">Ship to: {addr.name}</p>
                      <p className="text-slate-600">{addr.street}, {addr.suburb}, {addr.city}, {addr.province}, {addr.postalCode}</p>
                      <p className="text-slate-600">{SHIPPING_METHODS[o.shippingMethod as ShippingMethod]?.label ?? o.shippingMethod} · {o.phone}</p>
                    </>
                  ) : (
                    <p className="text-slate-600">Buyer in {addr.city}, {addr.province}. Please confirm you have stock; the full address appears once payment is received.</p>
                  )}
                  {o.vehicleNote && <p className="mt-1 text-slate-600">Fitment check: <strong>{o.vehicleNote}</strong></p>}
                </div>
                <ul className="mt-3 space-y-3">
                  {o.items.map((i) => {
                    const [label, cls] = ITEM_STATUS[i.status];
                    return (
                      <li key={i.id} className="border-t border-slate-100 pt-3">
                        <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
                          <div>
                            <p className="font-medium">{i.quantity} × {i.productTitle}</p>
                            <p className="text-xs text-slate-500">{i.partNumber} · {CONDITION_LABEL[i.condition]} · {formatRand(i.unitCents * i.quantity)}</p>
                            {i.trackingRef && <p className="text-xs text-slate-500">Tracking {i.trackingRef}</p>}
                            {i.cancelReason && <p className="text-xs text-slate-500">Cancelled: {i.cancelReason}</p>}
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
                        </div>
                        <ItemActions itemId={i.id} status={i.status} canShip={paid} />
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
