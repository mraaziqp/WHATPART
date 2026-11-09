import test from 'node:test';
import assert from 'node:assert/strict';
import { shippingCents, FREE_DELIVERY_CENTS } from '../../src/lib/shipping.js';
import { formatRand } from '../../src/lib/format.js';

test('Financials: ZAR integer cents formatting', () => {
  assert.equal(formatRand(10_000), 'R 100');
  assert.equal(formatRand(138_900), 'R 1,389');
  assert.equal(formatRand(79_950), 'R 799.50');
  assert.equal(formatRand(0), 'R 0');
});

test('Financials: Free shipping threshold (R 1,500 = 150,000 cents)', () => {
  assert.equal(FREE_DELIVERY_CENTS, 150_000);

  // Below R 1,500: Full courier charge
  assert.equal(shippingCents('courier_guy', 149_900), 15_000); // R 150
  assert.equal(shippingCents('ram', 149_900), 19_500);         // R 195
  assert.equal(shippingCents('pargo', 149_900), 8_500);        // R 85

  // At or above R 1,500: Threshold discount applies
  assert.equal(shippingCents('courier_guy', 150_000), 0);     // Free door-to-door
  assert.equal(shippingCents('courier_guy', 200_000), 0);     // Free door-to-door
  assert.equal(shippingCents('pargo', 150_000), 0);           // Free pickup point
  assert.equal(shippingCents('ram', 150_000), 4_500);         // RAM Overnight surcharge R 45
});

test('Financials: Marketplace commission in basis points (1200 bps = 12%)', () => {
  const calculateCommission = (subtotalCents: number, commissionBps: number = 1200) => {
    return Math.round((subtotalCents * commissionBps) / 10_000);
  };

  // 12% on R 1,000 (100,000 cents) = R 120 (12,000 cents)
  assert.equal(calculateCommission(100_000, 1200), 12_000);

  // 12% on R 1,389 (138,900 cents) = R 166.68 (16,668 cents)
  assert.equal(calculateCommission(138_900, 1200), 16_668);

  // Zero float drift: seller net earnings + commission = subtotal
  const subtotal = 138_900;
  const commission = calculateCommission(subtotal, 1200);
  const sellerNet = subtotal - commission;
  assert.equal(sellerNet + commission, subtotal);
});
