/** Default return/dispute window settlement reserve period: 7 days */
export const SETTLEMENT_CLEARANCE_DAYS = 7;

/** Generate a unique financial reference */
export function generateReference(prefix: 'TX' | 'PO'): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${Date.now().toString().slice(-4)}${rand}`;
}

/**
 * Calculates marketplace commission in integer cents based on basis points (100 bps = 1%).
 * Default is 1200 bps (12%).
 */
export function calculateCommissionCents(grossCents: number, commissionBps: number = 1200): number {
  if (grossCents <= 0 || commissionBps <= 0) return 0;
  return Math.round((grossCents * commissionBps) / 10_000);
}
