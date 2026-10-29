'use client';

import { useEffect, useState } from 'react';
import { useCart, useCartHydrated } from '@/lib/cart-store';
import type { ResolvedLine } from '@/lib/cart';

export function useResolvedCart() {
  const lines = useCart((s) => s.lines);
  const hydrated = useCartHydrated();
  const [fetched, setFetched] = useState<ResolvedLine[] | null>(null);

  useEffect(() => {
    if (!hydrated || lines.length === 0) return;
    const ctrl = new AbortController();
    fetch('/api/cart', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lines }), signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setFetched(d.items ?? []))
      .catch(() => {});
    return () => ctrl.abort();
  }, [lines, hydrated]);

  const items = !hydrated ? null : lines.length === 0 ? [] : fetched;
  const subtotalCents = (items ?? []).reduce((n, i) => n + i.unitCents * Math.min(i.quantity, i.available), 0);
  return { items, subtotalCents, loading: items === null };
}
