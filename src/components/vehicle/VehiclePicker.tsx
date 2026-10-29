'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Check, X } from 'lucide-react';
import type { VehicleTree } from '@/lib/vehicle';

const COOKIE = 'wp_vehicle';
const setVehicleCookie = (value: string | null) => {
  document.cookie = value
    ? `${COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    : `${COOKIE}=; path=/; max-age=0`;
};

type Props = {
  tree: VehicleTree;
  selectedLabel?: string | null;
  variant?: 'panel' | 'hero';
  onDone?: () => void;
};

export function VehiclePicker({ tree, selectedLabel, variant = 'panel', onDone }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [makeId, setMakeId] = useState('');
  const [modelId, setModelId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [year, setYear] = useState('');

  const make = tree.find((m) => m.id === makeId);
  const model = make?.models.find((m) => m.id === modelId);
  const vehicle = model?.vehicles.find((v) => v.id === vehicleId);
  const years = useMemo(() => {
    if (!vehicle) return [];
    const to = vehicle.yearTo ?? new Date().getFullYear();
    return Array.from({ length: to - vehicle.yearFrom + 1 }, (_, i) => to - i);
  }, [vehicle]);

  const save = () => {
    if (!vehicle) return;
    setVehicleCookie(`${vehicle.id}:${year || years[0]}`);
    startTransition(() => {
      router.refresh();
      onDone?.();
    });
  };

  const clear = () => {
    setVehicleCookie(null);
    startTransition(() => {
      router.refresh();
      onDone?.();
    });
  };

  const hero = variant === 'hero';
  const select = hero ? 'input py-3 text-base' : 'input';

  return (
    <div className="space-y-3">
      {selectedLabel && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <span className="flex items-center gap-2"><Check className="size-4" /> Shopping for <strong>{selectedLabel}</strong></span>
          <button onClick={clear} className="flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline">
            <X className="size-3.5" /> Clear
          </button>
        </div>
      )}
      <div className={hero ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-5' : 'grid gap-2'}>
        <select aria-label="Make" className={select} value={makeId} onChange={(e) => { setMakeId(e.target.value); setModelId(''); setVehicleId(''); setYear(''); }}>
          <option value="">1. Make</option>
          {tree.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select aria-label="Model" className={select} value={modelId} disabled={!make} onChange={(e) => { setModelId(e.target.value); setVehicleId(''); setYear(''); }}>
          <option value="">2. Model</option>
          {make?.models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <select aria-label="Engine" className={select} value={vehicleId} disabled={!model} onChange={(e) => { setVehicleId(e.target.value); setYear(''); }}>
          <option value="">3. Engine</option>
          {model?.vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
        <select aria-label="Year" className={select} value={year} disabled={!vehicle} onChange={(e) => setYear(e.target.value)}>
          <option value="">4. Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={save} disabled={!vehicle || pending} className={`btn-primary ${hero ? 'py-3 text-base' : 'w-full'}`}>
          <Car className="size-4" /> {pending ? 'Saving…' : 'Shop for this vehicle'}
        </button>
      </div>
    </div>
  );
}
