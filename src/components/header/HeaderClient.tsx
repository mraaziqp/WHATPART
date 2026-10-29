'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Check, ChevronDown, ShoppingCart, X } from 'lucide-react';
import { setVehicleCookie } from '@/lib/vehicle-cookie';
import { useCartCount, useCartHydrated } from '@/lib/cart-store';
import { VehiclePicker } from '@/components/vehicle/VehiclePicker';
import type { VehicleTree } from '@/lib/vehicle';

type GarageItem = { value: string; label: string; active: boolean };

export function VehicleButton({ tree, label, garage }: { tree: VehicleTree; label: string | null; garage: GarageItem[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [switching, startSwitch] = useTransition();
  const pick = (value: string) => {
    setVehicleCookie(value);
    startSwitch(() => {
      router.refresh();
      setOpen(false);
    });
  };
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
            {garage.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">My Garage</p>
                <ul className="space-y-1.5">
                  {garage.map((g) => (
                    <li key={g.value}>
                      <button
                        onClick={() => pick(g.value)}
                        disabled={switching || g.active}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm ${g.active ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <span className="flex items-center gap-2"><Car className="size-4 text-slate-500" /> {g.label}</span>
                        {g.active && <Check className="size-4 text-emerald-600" />}
                      </button>
                    </li>
                  ))}
                </ul>
                <Link href="/account/garage" onClick={() => setOpen(false)} className="mt-2 inline-block text-xs font-semibold text-navy-700 hover:underline">Manage garage</Link>
                <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Or choose another vehicle</p>
              </div>
            )}
            <VehiclePicker tree={tree} selectedLabel={label} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function CartButton() {
  const count = useCartCount();
  const mounted = useCartHydrated();
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
