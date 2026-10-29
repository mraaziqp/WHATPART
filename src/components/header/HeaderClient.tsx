'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Car, ChevronDown, ShoppingCart, X } from 'lucide-react';
import { useCartCount } from '@/lib/cart-store';
import { VehiclePicker } from '@/components/vehicle/VehiclePicker';
import type { VehicleTree } from '@/lib/vehicle';

export function VehicleButton({ tree, label }: { tree: VehicleTree; label: string | null }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-white hover:bg-white/10"
      >
        <Car className={`size-6 shrink-0 ${label ? 'text-brand-400' : 'text-white/80'}`} />
        <span className="min-w-0 leading-tight">
          <span className="block text-[11px] text-white/70">{label ? 'Shopping for' : 'Add your vehicle'}</span>
          <span className="flex items-center gap-1 truncate text-sm font-semibold">
            <span className="truncate">{label ?? 'Select vehicle'}</span> <ChevronDown className="size-3.5 shrink-0" />
          </span>
        </span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-navy-950/60 p-4 pt-20" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-md p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Your vehicle</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-slate-100"><X className="size-5" /></button>
            </div>
            <p className="mb-4 text-sm text-slate-600">We’ll only show parts that fit, and flag anything that doesn’t.</p>
            <VehiclePicker tree={tree} selectedLabel={label} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function CartButton() {
  const count = useCartCount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <Link href="/cart" className="relative flex items-center gap-2 rounded-lg px-2 py-1.5 text-white hover:bg-white/10" aria-label="Cart">
      <ShoppingCart className="size-6" />
      {mounted && count > 0 && (
        <span className="absolute -top-0.5 left-6 min-w-5 rounded-full bg-brand-500 px-1 text-center text-xs font-bold leading-5 text-navy-950">{count}</span>
      )}
      <span className="hidden text-sm font-semibold lg:inline">Cart</span>
    </Link>
  );
}
