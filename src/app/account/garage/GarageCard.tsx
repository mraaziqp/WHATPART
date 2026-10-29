'use client';

import { useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Check, Loader2, Trash2 } from 'lucide-react';
import { setVehicleCookie } from '@/lib/vehicle-cookie';
import { removeGarageVehicle, updateGarageVehicle } from '../actions';

type Props = { id: string; vehicleId: string; year: number; label: string; nickname: string | null; vin: string | null; active: boolean };

export function GarageCard(p: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, action, saving] = useActionState(updateGarageVehicle, {});

  const shop = () => {
    setVehicleCookie(`${p.vehicleId}:${p.year}`);
    start(() => router.push('/search'));
  };

  return (
    <li className={`card p-4 ${p.active ? 'border-emerald-400' : ''}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <Car className={`size-8 shrink-0 ${p.active ? 'text-emerald-600' : 'text-slate-400'}`} />
          <div>
            <p className="font-semibold">{p.nickname || `${p.year} ${p.label}`}</p>
            {p.nickname && <p className="text-sm text-slate-600">{p.year} {p.label}</p>}
            {p.active && <p className="text-xs font-semibold text-emerald-700">Shopping for this vehicle now</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={shop} disabled={pending} className="btn-primary py-1.5">{pending && <Loader2 className="size-4 animate-spin" />} Shop parts</button>
          <button onClick={() => start(() => removeGarageVehicle(p.id))} disabled={pending} className="btn-outline py-1.5" aria-label="Remove from garage"><Trash2 className="size-4" /></button>
        </div>
      </div>
      <form action={action} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="id" value={p.id} />
        <input name="nickname" defaultValue={p.nickname ?? ''} maxLength={40} placeholder="Nickname, e.g. Work bakkie" className="input py-1.5" aria-label="Nickname" />
        <input name="vin" defaultValue={p.vin ?? ''} maxLength={17} placeholder="VIN (optional)" className="input py-1.5 font-mono uppercase" aria-label="VIN" />
        <button type="submit" disabled={saving} className="btn-outline py-1.5">{saving ? <Loader2 className="size-4 animate-spin" /> : state.ok ? <><Check className="size-4 text-emerald-600" /> Saved</> : 'Save'}</button>
        {state.error && <p className="text-xs text-red-600 sm:col-span-3">{state.error}</p>}
      </form>
    </li>
  );
}
