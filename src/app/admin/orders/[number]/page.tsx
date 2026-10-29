import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { requireAdminPage } from '@/lib/guards';
import { CONDITION_LABEL, formatRand } from '@/lib/format';
import { SHIPPING_METHODS, type ShippingMethod } from '@/lib/shipping';
import { ActionButton } from '../../ActionButton';
import { cancelOrder, markItemDelivered, markOrderPaid } from '../../actions';

type Address = { name: string; street: string; suburb: string; city: string; province: string; postalCode: string };

export default async function AdminOrderPage({ params }: { params: Promise<{ number: string }> }) {
  await requireAdminPage();
  const order = await db.order.findUnique({
    where: { number: (await params).number },
    include: { items: { include: { seller: true } }, payments: { orderBy: { createdAt: 'desc' } }, user: { select: { name: true } } },
  });
  if (!order) notFound();
  const addr = order.shippingAddr as Address;

  return (
    <div className="space-y-4">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-navy-700 hover:underline"><ArrowLeft className="size-4" /> All orders</Link>
      <div className="card flex flex-wrap items-start justify-between gap-4 p-5">
        <div>
          <p className="font-mono text-xl font-bold">{order.number}</p>
          <p className="text-sm text-slate-600">{order.createdAt.toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short' })} · {order.status.replace('_', ' ').toLowerCase()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {order.status === 'PENDING_PAYMENT' && (
            <ActionButton action={markOrderPaid.bind(null, order.id)} label="Mark paid" variant="primary" input={{ placeholder: 'Payment reference' }} />
          )}
          {!['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
            <ActionButton action={cancelOrder.bind(null, order.id)} label="Cancel order" variant="danger" confirm={`Cancel order ${order.number}?`} />
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5 text-sm">
          <h2 className="mb-2 font-bold">Customer</h2>
          <p>{addr.name}{order.user && <span className="text-slate-500"> (account: {order.user.name})</span>}</p>
          <p><a href={`mailto:${order.email}`} className="text-navy-700 hover:underline">{order.email}</a> · <a href={`tel:${order.phone}`} className="text-navy-700 hover:underline">{order.phone}</a></p>
          <p className="mt-2 text-slate-600">{addr.street}, {addr.suburb}, {addr.city}, {addr.province}, {addr.postalCode}</p>
          <p className="text-slate-600">{SHIPPING_METHODS[order.shippingMethod as ShippingMethod]?.label ?? order.shippingMethod}</p>
          {order.vehicleNote && <p className="mt-2">Fitment check: <strong>{order.vehicleNote}</strong></p>}
        </section>
        <section className="card p-5 text-sm">
          <h2 className="mb-2 font-bold">Payment</h2>
          <dl className="space-y-1">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatRand(order.subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{formatRand(order.shippingCents)}</dd></div>
            <div className="flex justify-between font-bold"><dt>Total</dt><dd>{formatRand(order.totalCents)}</dd></div>
          </dl>
          {order.payments.length > 0 ? (
            <ul className="mt-3 space-y-1 text-slate-600">
              {order.payments.map((p) => <li key={p.id}>{p.provider} · {p.status.toLowerCase()} · {formatRand(p.amountCents)}{p.providerRef && ` · ref ${p.providerRef}`}</li>)}
            </ul>
          ) : (
            <p className="mt-3 text-slate-600">No payment yet. Send the customer a payment link, then mark the order paid with the reference.</p>
          )}
        </section>
      </div>

      <section className="card divide-y divide-slate-100">
        {order.items.map((i) => (
          <div key={i.id} className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm">
            <div>
              <p className="font-medium">{i.quantity} × {i.productTitle}</p>
              <p className="text-xs text-slate-500">{i.partNumber} · {CONDITION_LABEL[i.condition]} · {formatRand(i.unitCents * i.quantity)}</p>
              <p className="text-xs text-slate-500">Seller: {i.seller.name} ({i.seller.city}){i.seller.phone && ` · ${i.seller.phone}`}</p>
              {i.trackingRef && <p className="text-xs">Tracking: <strong>{i.trackingRef}</strong></p>}
              {i.cancelReason && <p className="text-xs text-red-600">Cancelled: {i.cancelReason}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold">{i.status.toLowerCase()}</span>
              {i.status === 'SHIPPED' && <ActionButton action={markItemDelivered.bind(null, i.id)} label="Mark delivered" />}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
