export const FREE_DELIVERY_CENTS = 150_000;

export const SHIPPING_METHODS = {
  courier_guy: { label: 'The Courier Guy (door to door)', eta: '1–3 business days', cents: 15_000, overThreshold: 0 },
  ram: { label: 'RAM Overnight', eta: 'Next business day, main centres', cents: 19_500, overThreshold: 4_500 },
  pargo: { label: 'Pargo pickup point', eta: '2–4 business days', cents: 8_500, overThreshold: 0 },
} as const;

export type ShippingMethod = keyof typeof SHIPPING_METHODS;

export const shippingCents = (method: ShippingMethod, subtotalCents: number) => {
  const m = SHIPPING_METHODS[method];
  return subtotalCents >= FREE_DELIVERY_CENTS ? m.overThreshold : m.cents;
};
