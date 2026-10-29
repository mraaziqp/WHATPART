import 'server-only';
import { db } from './db';

/** Derive the order status from its items after a seller or admin changes one. */
export async function syncOrderStatus(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: { select: { status: true } } } });
  if (!order || order.status === 'REFUNDED') return;
  const live = order.items.filter((i) => i.status !== 'CANCELLED' && i.status !== 'RETURNED');
  let status = order.status;
  if (live.length === 0) status = 'CANCELLED';
  else if (order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED') {
    if (live.every((i) => i.status === 'DELIVERED')) status = 'DELIVERED';
    else if (live.every((i) => i.status === 'SHIPPED' || i.status === 'DELIVERED')) status = 'SHIPPED';
    else if (live.some((i) => i.status !== 'PENDING')) status = 'PROCESSING';
  }
  if (status !== order.status) await db.order.update({ where: { id: orderId }, data: { status } });
}
