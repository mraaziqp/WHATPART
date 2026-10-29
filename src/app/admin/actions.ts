'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/guards';
import { syncOrderStatus } from '@/lib/orders';
import { reindexProduct } from '@/lib/search';

export type ActionResult = { ok?: string; error?: string };

async function reindexOffers(offerIds: string[]) {
  const offers = await db.offer.findMany({ where: { id: { in: offerIds } }, select: { productId: true } });
  for (const productId of new Set(offers.map((o) => o.productId))) {
    await reindexProduct(productId).catch((e) => console.error('[admin] reindex failed', productId, e));
  }
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function markOrderPaid(orderId: string, reference: string): Promise<ActionResult> {
  await requireAdmin();
  const ref = reference.trim().slice(0, 80);
  if (ref.length < 3) return { error: 'Enter the payment reference (gateway or bank reference).' };
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return { error: 'Order not found.' };
  if (order.status !== 'PENDING_PAYMENT') return { error: 'Only orders awaiting payment can be marked paid.' };
  const live = order.items.filter((i) => i.offerId && i.status !== 'CANCELLED');
  const total = order.items.filter((i) => i.status !== 'CANCELLED').reduce((n, i) => n + i.unitCents * i.quantity, 0) + order.shippingCents;

  await db.$transaction([
    db.payment.create({ data: { orderId, provider: 'MANUAL', providerRef: ref, amountCents: total, status: 'COMPLETE' } }),
    db.order.update({ where: { id: orderId }, data: { status: 'PAID' } }),
    ...live.map((i) => db.offer.update({ where: { id: i.offerId! }, data: { stock: { decrement: i.quantity } } })),
  ]);
  // Never leave negative stock behind if two orders raced for the last unit.
  await db.offer.updateMany({ where: { id: { in: live.map((i) => i.offerId!) }, stock: { lt: 0 } }, data: { stock: 0 } });
  await syncOrderStatus(orderId);
  await reindexOffers(live.map((i) => i.offerId!));
  revalidatePath('/admin/orders');
  return { ok: 'Marked as paid' };
}

export async function cancelOrder(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  const order = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order) return { error: 'Order not found.' };
  if (['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)) return { error: 'This order can no longer be cancelled.' };
  await db.$transaction([
    db.orderItem.updateMany({ where: { orderId, status: { in: ['PENDING', 'ACCEPTED'] } }, data: { status: 'CANCELLED', cancelReason: 'Cancelled by WHATPART' } }),
    db.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } }),
  ]);
  revalidatePath('/admin/orders');
  return { ok: order.status === 'PENDING_PAYMENT' ? 'Order cancelled' : 'Order cancelled. Remember to refund the customer.' };
}

export async function markItemDelivered(itemId: string): Promise<ActionResult> {
  await requireAdmin();
  const item = await db.orderItem.findUnique({ where: { id: itemId }, select: { status: true, orderId: true } });
  if (!item || item.status !== 'SHIPPED') return { error: 'Only shipped items can be marked delivered.' };
  await db.orderItem.update({ where: { id: itemId }, data: { status: 'DELIVERED' } });
  await syncOrderStatus(item.orderId);
  revalidatePath('/admin/orders');
  return { ok: 'Marked delivered' };
}

// ─── Sellers ────────────────────────────────────────────────────────────────

async function reindexSeller(sellerId: string) {
  const offers = await db.offer.findMany({ where: { sellerId }, select: { id: true } });
  await reindexOffers(offers.map((o) => o.id));
}

export async function approveSeller(sellerId: string): Promise<ActionResult> {
  await requireAdmin();
  const seller = await db.seller.update({ where: { id: sellerId }, data: { status: 'ACTIVE', verified: true } });
  if (seller.ownerId) await db.user.updateMany({ where: { id: seller.ownerId, role: 'CUSTOMER' }, data: { role: 'SELLER' } });
  await reindexSeller(sellerId);
  revalidatePath('/admin/sellers');
  return { ok: `${seller.name} approved` };
}

export async function suspendSeller(sellerId: string): Promise<ActionResult> {
  await requireAdmin();
  const seller = await db.seller.update({ where: { id: sellerId }, data: { status: 'SUSPENDED' } });
  await reindexSeller(sellerId);
  revalidatePath('/admin/sellers');
  return { ok: `${seller.name} suspended; listings hidden` };
}

// ─── Part requests ──────────────────────────────────────────────────────────

export async function closeRequest(requestId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.quoteRequest.update({ where: { id: requestId }, data: { status: 'CLOSED' } });
  revalidatePath('/admin/requests');
  return { ok: 'Request closed' };
}
