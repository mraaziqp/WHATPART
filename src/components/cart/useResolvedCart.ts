'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart-store';
import type { ResolvedLine } from '@/lib/cart';

export function useResolvedCart() {
  const lines = useCart((s) => s.lines);
  const [items, setItems] = useState<ResolvedLine[] | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // zustand persist rehydrates from localStorage after mount
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (lines.length === 0) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    fetch('/api/cart', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lines }), signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {});
    return () => ctrl.abort();
  }, [lines, hydrated]);

  const subtotalCents = (items ?? []).reduce((n, i) => n + i.unitCents * Math.min(i.quantity, i.available), 0);
  return { items, subtotalCents, loading: items === null };
}
