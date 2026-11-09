import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCommissionCents, generateReference, SETTLEMENT_CLEARANCE_DAYS } from '../../src/lib/ledger-math.js';

test('Ledger: Commission computation handles exact basis points and rounding', () => {
  // 12% default (1200 bps)
  assert.equal(calculateCommissionCents(100_000, 1200), 12_000); // R1,000 gross -> R120 comm
  assert.equal(calculateCommissionCents(50_000, 1200), 6_000);    // R500 gross -> R60 comm
  assert.equal(calculateCommissionCents(1_389_00, 1200), 166_68); // R1,389 gross -> R166.68 comm

  // Custom commission rate: 8% (800 bps)
  assert.equal(calculateCommissionCents(100_000, 800), 8_000);

  // Negative or zero handled gracefully
  assert.equal(calculateCommissionCents(0, 1200), 0);
  assert.equal(calculateCommissionCents(-100, 1200), 0);
});

test('Ledger: Unique financial reference generation format', () => {
  const txRef = generateReference('TX');
  assert.match(txRef, /^TX-\d{4}[0-9A-Z]{8}$/);

  const poRef = generateReference('PO');
  assert.match(poRef, /^PO-\d{4}[0-9A-Z]{8}$/);

  // Successive calls generate unique references
  const ref2 = generateReference('TX');
  assert.notEqual(txRef, ref2);
});

test('Ledger: Settlement clearance default period is 7 days', () => {
  assert.equal(SETTLEMENT_CLEARANCE_DAYS, 7);
});
