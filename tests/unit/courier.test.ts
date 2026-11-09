import test from 'node:test';
import assert from 'node:assert/strict';
import { getCourierTrackingUrl, normalizeShipmentStatus } from '../../src/lib/courier/index.js';

test('Courier: Formats tracking URLs for South African couriers', () => {
  // The Courier Guy
  assert.equal(
    getCourierTrackingUrl('The Courier Guy', 'TCG-12345678'),
    'https://thecourierguy.co.za/tracking?tracking_number=TCG-12345678'
  );
  assert.equal(
    getCourierTrackingUrl('the_courier_guy', 'WAYBILL99'),
    'https://thecourierguy.co.za/tracking?tracking_number=WAYBILL99'
  );

  // RAM
  assert.equal(
    getCourierTrackingUrl('RAM Overnight', 'RAM-JHB-9988'),
    'https://ram.co.za/track?tracking_number=RAM-JHB-9988'
  );

  // Pargo
  assert.equal(
    getCourierTrackingUrl('Pargo', 'PRG-445566'),
    'https://pargo.co.za/track-trace/?tracking_number=PRG-445566'
  );

  // Fallback
  assert.equal(
    getCourierTrackingUrl(null, 'ANY123'),
    'https://whatpart.africa/track?ref=ANY123'
  );
  assert.equal(getCourierTrackingUrl('The Courier Guy', ''), null);
});

test('Courier: Normalizes carrier statuses accurately', () => {
  assert.equal(normalizeShipmentStatus('Delivered to recipient'), 'DELIVERED');
  assert.equal(normalizeShipmentStatus('Out on delivery vehicle'), 'OUT_FOR_DELIVERY');
  assert.equal(normalizeShipmentStatus('In-Transit to Cape Town Hub'), 'IN_TRANSIT');
  assert.equal(normalizeShipmentStatus('Parcel collected from merchant'), 'COLLECTED');
  assert.equal(normalizeShipmentStatus('Delivery failed - receiver not available'), 'FAILED');
  assert.equal(normalizeShipmentStatus('Manifested'), 'COLLECTION_PENDING');
});
