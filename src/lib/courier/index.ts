import type { CourierCode, CourierOption, ShipmentStatus } from './types';

export * from './types';

export const COURIER_OPTIONS: Record<CourierCode, CourierOption> = {
  the_courier_guy: {
    code: 'the_courier_guy',
    name: 'The Courier Guy',
    trackingUrlTemplate: (ref) =>
      `https://thecourierguy.co.za/tracking?tracking_number=${encodeURIComponent(ref.trim())}`,
  },
  ram: {
    code: 'ram',
    name: 'RAM Overnight Hand-to-Hand',
    trackingUrlTemplate: (ref) =>
      `https://ram.co.za/track?tracking_number=${encodeURIComponent(ref.trim())}`,
  },
  pargo: {
    code: 'pargo',
    name: 'Pargo Pickup Point',
    trackingUrlTemplate: (ref) =>
      `https://pargo.co.za/track-trace/?tracking_number=${encodeURIComponent(ref.trim())}`,
  },
  other: {
    code: 'other',
    name: 'Other Courier',
    trackingUrlTemplate: (ref) => `https://whatpart.africa/track?ref=${encodeURIComponent(ref.trim())}`,
  },
};

/**
 * Returns the public direct tracking URL for a given courier and tracking reference.
 */
export function getCourierTrackingUrl(courierNameOrCode?: string | null, trackingRef?: string | null): string | null {
  if (!trackingRef || !trackingRef.trim()) return null;
  const ref = trackingRef.trim();

  const c = (courierNameOrCode ?? '').toLowerCase().trim();
  if (c.includes('courier guy') || c === 'the_courier_guy' || c.startsWith('tcg')) {
    return COURIER_OPTIONS.the_courier_guy.trackingUrlTemplate(ref);
  }
  if (c.includes('ram')) {
    return COURIER_OPTIONS.ram.trackingUrlTemplate(ref);
  }
  if (c.includes('pargo')) {
    return COURIER_OPTIONS.pargo.trackingUrlTemplate(ref);
  }
  return COURIER_OPTIONS.other.trackingUrlTemplate(ref);
}

/**
 * Normalizes South African carrier status strings into a standard ShipmentStatus enum.
 */
export function normalizeShipmentStatus(statusString: string): ShipmentStatus {
  const s = statusString.toLowerCase().trim();
  if (s.includes('delivered') || s.includes('collected by receiver')) return 'DELIVERED';
  if ((s.includes('out') && s.includes('delivery')) || s.includes('with driver') || s.includes('on vehicle')) return 'OUT_FOR_DELIVERY';
  if (s.includes('transit') || s.includes('linehaul') || s.includes('hub')) return 'IN_TRANSIT';
  if (s.includes('collected') || s.includes('picked up') || s.includes('received at branch')) return 'COLLECTED';
  if (s.includes('booked') || s.includes('manifested') || s.includes('pending collection')) return 'COLLECTION_PENDING';
  if (s.includes('fail') || s.includes('carded') || s.includes('delay') || s.includes('exception')) return 'FAILED';
  if (s.includes('return')) return 'RETURNED';
  if (s.includes('cancel')) return 'CANCELLED';
  return 'BOOKED';
}
