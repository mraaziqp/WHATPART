import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeVin, normaliseVin } from '../../src/lib/vin.js';

test('VIN: normalization removes spaces and hyphens and uppercases', () => {
  assert.equal(normaliseVin(' aht-12345 6789-01234 '), 'AHT12345678901234');
});

test('VIN: validation rejects illegal characters (I, O, Q)', () => {
  const resI = decodeVin('AHT1234567890123I');
  assert.ok('error' in resI);
  assert.match(resI.error, /VINs never contain the letters I, O or Q/);

  const resO = decodeVin('AHT1234567890123O');
  assert.ok('error' in resO);

  const resQ = decodeVin('AHT1234567890123Q');
  assert.ok('error' in resQ);
});

test('VIN: validation enforces exactly 17 characters', () => {
  const tooShort = decodeVin('AHT12345');
  assert.ok('error' in tooShort);
  assert.match(tooShort.error, /17 characters/);

  const tooLong = decodeVin('AHT123456789012345678');
  assert.ok('error' in tooLong);
});

test('VIN: resolves South African manufacturer WMIs', () => {
  // Toyota South Africa Prospecton (AHT...)
  const toyota = decodeVin('AHT123456K1234567');
  assert.ok(!('error' in toyota));
  assert.equal(toyota.make, 'Toyota');
  assert.equal(toyota.origin, 'South Africa (Prospecton)');
  assert.equal(toyota.likelyYear, 2019); // 'K' = 2019

  // Volkswagen South Africa Kariega (AAV...)
  const vw = decodeVin('AAVZZZ6RZHY123456');
  assert.ok(!('error' in vw));
  assert.equal(vw.make, 'Volkswagen');
  assert.equal(vw.origin, 'South Africa (Kariega)');

  // Ford South Africa Silverton (AFA...)
  const ford = decodeVin('AFAXXMJ2AHK123456');
  assert.ok(!('error' in ford));
  assert.equal(ford.make, 'Ford');
  assert.equal(ford.origin, 'South Africa (Silverton)');
});
