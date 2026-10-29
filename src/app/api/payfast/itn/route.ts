import { db } from '@/lib/db';
import { confirmWithPayfast, isPayfastIp, payfastConfig, signature } from '@/lib/payfast';
import { reindexProduct } from '@/lib/search';

// PayFast Instant Transaction Notification. Always answer 200 once handled so PayFast stops retrying;
// any failed check is logged and the order is left untouched.
export async function POST(req: Request) {
  const body = await req.text();
  const fields = [...new URLSearchParams(body).entries()] as [string, string][];
  const data = Object.fromEntries(fields);
  const ok = () => new Response('OK');
  const reject = (reason: string) => {
    console.warn(`[payfast-itn] rejected ${data.m_payment_id ?? '?'}: ${reason}`);
    return ok();
  };

  const cfg = payfastConfig();
  if (data.signature !== signature(fields, cfg.passphrase, 'itn')) return reject('bad signature');

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;
  if (!(await isPayfastIp(ip))) return reject(`unknown source ip ${ip}`);

  const order = await db.order.findUnique({
    where: { number: data.m_payment_id ?? '' },
    include: { payments: { where: { provider: 'PAYFAST' }, orderBy: { createdAt: 'desc' }, take: 1 }, items: { select: { offerId: true, quantity: true } } },
  });
  const payment = order?.payments[0];
  if (!order || !payment) return reject('unknown order');
  if (Math.abs(Number(data.amount_gross) * 100 - order.totalCents) > 1) return reject(`amount mismatch ${data.amount_gross}`);
  if (!(await confirmWithPayfast(fields))) return reject('payfast did not confirm');
  if (payment.status === 'COMPLETE') return ok(); // duplicate notification

  if (data.payment_status === 'COMPLETE') {
    await db.$transaction([
      db.payment.update({ where: { id: payment.id }, data: { status: 'COMPLETE', providerRef: data.pf_payment_id, raw: data } }),
      db.order.update({ where: { id: order.id }, data: { status: 'PAID' } }),
      ...order.items
        .filter((i) => i.offerId)
        .map((i) => db.offer.update({ where: { id: i.offerId! }, data: { stock: { decrement: i.quantity } } })),
    ]);
    // Keep search results' stock/price current; failures here must not fail the payment.
    const offers = await db.offer.findMany({ where: { id: { in: order.items.flatMap((i) => (i.offerId ? [i.offerId] : [])) } }, select: { productId: true, stock: true, id: true } });
    for (const o of offers) {
      if (o.stock < 0) await db.offer.update({ where: { id: o.id }, data: { stock: 0 } });
      await reindexProduct(o.productId).catch((e) => console.error('[payfast-itn] reindex failed', e));
    }
    console.info(`[payfast-itn] ${order.number} paid (${data.pf_payment_id})`);
  } else if (data.payment_status === 'CANCELLED') {
    await db.payment.update({ where: { id: payment.id }, data: { status: 'CANCELLED', raw: data } });
  }
  return ok();
}
