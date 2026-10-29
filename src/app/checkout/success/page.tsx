import Link from 'next/link';
import { CircleCheck, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { formatRand } from '@/lib/format';
import { ClearCart, RefreshWhilePending } from './client';

export const metadata = { title: 'Order confirmation', robots: { index: false } };

type Props = { searchParams: Promise<{ order?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const { order: number } = await searchParams;
  const order = number
    ? await db.order.findUnique({ where: { number }, include: { items: true, payments: { select: { id: true } } } })
    : null;

  if (!order) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-lg font-semibold">We couldn’t find that order.</p>
        <Link href="/" className="btn-primary mt-4">Back to shop</Link>
      </div>
    );
  }
  const paid = order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED';
  // No gateway payment was started: the team confirms stock and sends a payment link.
  const awaitingLink = !paid && order.payments.length === 0;

  return (
    <div className="container-page py-12">
      <ClearCart />
      {!paid && !awaitingLink && <RefreshWhilePending />}
      <div className="card mx-auto max-w-xl space-y-5 p-8 text-center">
        {paid ? <CircleCheck className="mx-auto size-14 text-emerald-600" /> : <Clock className="mx-auto size-14 text-brand-600" />}
        <div>
          <h1 className="text-2xl font-bold">{paid ? 'Thank you, your order is confirmed' : awaitingLink ? 'Thank you, we’ve received your order' : 'Confirming your payment…'}</h1>
          <p className="mt-1 text-slate-600">Order <strong className="font-mono">{order.number}</strong></p>
        </div>
        <p className="text-sm text-slate-600">
          {awaitingLink
            ? `We’re confirming stock with the seller now. We’ll send a secure payment link to ${order.email} and your phone, and your parts ship as soon as payment is received.`
            : paid
            ? `Keep your order number handy. We’ll contact you at ${order.email} with tracking details as soon as your parts ship.`
            : 'PayFast is confirming your payment. This usually takes a few seconds and this page will update by itself.'}
        </p>
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-left text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 px-4 py-2"><span>{i.quantity} × {i.productTitle}</span><span>{formatRand(i.unitCents * i.quantity)}</span></li>
          ))}
          <li className="flex justify-between px-4 py-2 font-semibold"><span>Total</span><span>{formatRand(order.totalCents)}</span></li>
        </ul>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn-primary">Continue shopping</Link>
          <Link href={`/track?order=${order.number}&email=${encodeURIComponent(order.email)}`} className="btn-outline">Track this order</Link>
        </div>
      </div>
    </div>
  );
}
