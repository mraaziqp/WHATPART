'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// The browser only remembers which offers are in the cart. Prices, stock and totals are
// always re-read from the database (cart page and checkout), so they can't be tampered with.
export type CartLine = { offerId: string; quantity: number };

type CartState = {
  lines: CartLine[];
  add: (offerId: string, quantity?: number) => void;
  setQuantity: (offerId: string, quantity: number) => void;
  remove: (offerId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (offerId, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.offerId === offerId);
          return {
            lines: existing
              ? s.lines.map((l) => (l.offerId === offerId ? { ...l, quantity: Math.min(99, l.quantity + quantity) } : l))
              : [...s.lines, { offerId, quantity }],
          };
        }),
      setQuantity: (offerId, quantity) =>
        set((s) => ({
          lines: quantity <= 0 ? s.lines.filter((l) => l.offerId !== offerId) : s.lines.map((l) => (l.offerId === offerId ? { ...l, quantity: Math.min(99, quantity) } : l)),
        })),
      remove: (offerId) => set((s) => ({ lines: s.lines.filter((l) => l.offerId !== offerId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'wp_cart' },
  ),
);

export const useCartCount = () => useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
