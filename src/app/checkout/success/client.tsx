'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-store';

export function ClearCart() {
  const clear = useCart((s) => s.clear);
  useEffect(() => clear(), [clear]);
  return null;
}

export function RefreshWhilePending() {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => (++n > 20 ? clearInterval(t) : router.refresh()), 3000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
