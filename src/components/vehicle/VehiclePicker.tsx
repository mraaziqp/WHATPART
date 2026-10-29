'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Check, Hash, X } from 'lucide-react';
import type { VehicleTree } from '@/lib/vehicle';
import { setVehicleCookie } from '@/lib/vehicle-cookie';
import { decodeVin } from '@/lib/vin';
import { rememberVehicle } from '@/app/account/actions';

type Props = {
  tree: VehicleTree;
  selectedLabel?: string | null;
  variant?: 'panel' | 'hero';
  onDone?: () => void;
};

export function VehiclePicker({ tree, selectedLabel, variant = 'panel', onDone }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<'vehicle' | 'vin'>('vehicle');
  const [makeId, setMakeId] = useState('');
  const [modelId, setModelId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [year, setYear] = useState('');
  const [vinInput, setVinInput] = useState('');
  const [vinInfo, setVinInfo] = useState<{ vin: string; text: string; yearHint: number | null } | null>(null);
  const [vinError, setVinError] = useState('');

  const make = tree.find((m) => m.id === makeId);
  const model = make?.models.find((m) => m.id === modelId);
  const vehicle = model?.vehicles.find((v) => v.id === vehicleId);
  const lastYear = vehicle?.yearTo ?? new Date().getFullYear();
  const years = vehicle ? Array.from({ length: lastYear - vehicle.yearFrom + 1 }, (_, i) => lastYear - i) : [];

  const lookUpVin = () => {
    const res = decodeVin(vinInput);
    if ('error' in res) {
      setVinError(res.error);
      setVinInfo(null);
      return;
    }
    setVinError('');
    const match = res.make ? tree.find((m) => m.name === res.make) : undefined;
    if (!match) {
      setVinInfo({ vin: res.vin, yearHint: res.likelyYear, text: res.make ? `${res.make} isn’t in our vehicle list yet. Choose the closest match below or request the part.` : 'We couldn’t identify the manufacturer from this VIN. Choose your vehicle below; we’ll keep the VIN for fitment checks.' });
      setMakeId('');
    } else {
      setMakeId(match.id);
      setVinInfo({ vin: res.vin, yearHint: res.likelyYear, text: `${res.make}${res.origin ? `, built in ${res.origin}` : ''}${res.likelyYear ? `, probably ${res.likelyYear}` : ''}. Now choose the model and engine.` });
    }
    setModelId('');
    setVehicleId('');
    setYear('');
  };

  const pickVehicle = (id: string) => {
    setVehicleId(id);
    const v = model?.vehicles.find((x) => x.id === id);
    const hint = vinInfo?.yearHint;
    setYear(v && hint && hint >= v.yearFrom && hint <= (v.yearTo ?? new Date().getFullYear()) ? String(hint) : '');
  };

  const save = () => {
    if (!vehicle) return;
    const y = Number(year) || years[0];
    setVehicleCookie(`${vehicle.id}:${y}`);
    startTransition(async () => {
      await rememberVehicle(vehicle.id, y, vinInfo?.vin); // no-op for guests
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
  const tab = (m: typeof mode, label: string, Icon: typeof Car) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${mode === m ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      <Icon className="size-4" /> {label}
    </button>
  );

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
      <div className="flex gap-1">
        {tab('vehicle', 'Choose vehicle', Car)}
        {tab('vin', 'Use my VIN', Hash)}
      </div>
      {mode === 'vin' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={vinInput}
              onChange={(e) => setVinInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), lookUpVin())}
              maxLength={20}
              placeholder="17-character VIN from your licence disc"
              aria-label="VIN"
              className={`${select} font-mono uppercase`}
            />
            <button type="button" onClick={lookUpVin} className="btn-dark shrink-0">Look up</button>
          </div>
          {vinError && <p className="text-xs text-red-600">{vinError}</p>}
          {vinInfo && <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{vinInfo.text}</p>}
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
        <select aria-label="Engine" className={select} value={vehicleId} disabled={!model} onChange={(e) => pickVehicle(e.target.value)}>
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
