import 'server-only';
import { db } from './db';
import {
  SETTLEMENT_CLEARANCE_DAYS,
  generateReference,
  calculateCommissionCents,
} from './ledger-math';

export { SETTLEMENT_CLEARANCE_DAYS, generateReference, calculateCommissionCents };

/**
 * Records auditable ledger credits when an order transitions to PAID.
 * Credits each seller for their order items minus marketplace commission.
 */
export async function recordOrderPaymentToLedger(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          seller: {
            select: { id: true, name: true, commissionBps: true },
          },
        },
      },
    },
  });

  if (!order || order.status !== 'PAID') return;

  const now = new Date();
  const availableAt = new Date(now.getTime() + SETTLEMENT_CLEARANCE_DAYS * 86_400_000);

  for (const item of order.items) {
    // Check if transaction already exists for this order item to guarantee idempotency
    const existing = await db.sellerTransaction.findFirst({
      where: { orderItemId: item.id, type: 'ORDER_CREDIT' },
    });
    if (existing) continue;

    const gross = item.unitCents * item.quantity;
    const commissionBps = item.seller.commissionBps || 1200;
    const commission = calculateCommissionCents(gross, commissionBps);
    const sellerNet = gross - commission;

    await db.$transaction([
      // Seller credit for the net amount
      db.sellerTransaction.create({
        data: {
          reference: generateReference('TX'),
          sellerId: item.sellerId,
          orderItemId: item.id,
          type: 'ORDER_CREDIT',
          status: 'PENDING_CLEARANCE',
          amountCents: sellerNet,
          description: `Order ${order.number}: ${item.quantity}x ${item.productTitle} (Net after ${commissionBps / 100}% commission)`,
          availableAt,
        },
      }),
      // Marketplace commission debit record for audit trail
      db.sellerTransaction.create({
        data: {
          reference: generateReference('TX'),
          sellerId: item.sellerId,
          orderItemId: item.id,
          type: 'COMMISSION_DEBIT',
          status: 'PENDING_CLEARANCE',
          amountCents: commission,
          description: `Marketplace fee (${commissionBps / 100}%) on Order ${order.number} - ${item.productTitle}`,
          availableAt,
        },
      }),
    ]);
  }
}

/**
 * Calculates current seller financial ledger summary in integer cents.
 */
export async function getSellerLedgerSummary(sellerId: string) {
  const transactions = await db.sellerTransaction.findMany({
    where: { sellerId },
    orderBy: { createdAt: 'desc' },
  });

  const payouts = await db.sellerPayout.findMany({
    where: { sellerId },
    orderBy: { requestedAt: 'desc' },
  });

  let totalGrossCents = 0;
  let totalCommissionCents = 0;
  let availableCents = 0;
  let pendingClearanceCents = 0;
  let totalPaidOutCents = 0;

  const now = new Date();

  for (const tx of transactions) {
    if (tx.type === 'ORDER_CREDIT') {
      totalGrossCents += tx.amountCents;
      if (tx.status === 'AVAILABLE' || (tx.status === 'PENDING_CLEARANCE' && tx.availableAt <= now)) {
        availableCents += tx.amountCents;
      } else if (tx.status === 'PENDING_CLEARANCE') {
        pendingClearanceCents += tx.amountCents;
      }
    } else if (tx.type === 'COMMISSION_DEBIT') {
      totalCommissionCents += tx.amountCents;
    } else if (tx.type === 'PAYOUT_DEBIT' && tx.status !== 'CANCELLED') {
      availableCents -= tx.amountCents;
    } else if (tx.type === 'REFUND_DEBIT') {
      availableCents -= tx.amountCents;
    }
  }

  for (const po of payouts) {
    if (po.status === 'COMPLETED') {
      totalPaidOutCents += po.amountCents;
    }
  }

  return {
    totalGrossCents,
    totalCommissionCents,
    availableCents: Math.max(0, availableCents),
    pendingClearanceCents,
    totalPaidOutCents,
    transactions,
    payouts,
  };
}

/**
 * Cron / background routine to promote mature pending transactions to available.
 */
export async function maturePendingClearances() {
  const now = new Date();
  return db.sellerTransaction.updateMany({
    where: {
      status: 'PENDING_CLEARANCE',
      availableAt: { lte: now },
    },
    data: {
      status: 'AVAILABLE',
    },
  });
}
