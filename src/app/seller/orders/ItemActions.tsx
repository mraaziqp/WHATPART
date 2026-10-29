'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { acceptItem, cancelItem, shipItem } from '../actions';

export function ItemActions({ itemId, status, canShip }: { itemId: string; status: string; canShip: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const [tracking, setTracking] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const run = (fn: () => Promise<{ ok?: string; error?: string }>) => start(async () => setMsg(await fn()));

  if (!['PENDING', 'ACCEPTED'].includes(status)) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {status === 'PENDING' && (
          <button disabled={pending} onClick={() => run(() => acceptItem(itemId))} className="btn-primary py-1.5">Confirm stock</button>
        )}
        {canShip && (
          <>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Courier tracking number" className="input w-52 py-1.5" />
            <button disabled={pending} onClick={() => run(() => shipItem(itemId, tracking))} className="btn-dark py-1.5">Mark shipped</button>
          </>
        )}
        {!cancelling && <button onClick={() => setCancelling(true)} className="text-sm text-slate-500 hover:text-red-600">Can’t fulfil</button>}
        {pending && <Loader2 className="size-4 animate-spin text-slate-400" />}
      </div>
      {cancelling && (
        <div className="flex flex-wrap items-center gap-2">
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason, e.g. out of stock" className="input w-64 py-1.5" />
          <button disabled={pending} onClick={() => run(() => cancelItem(itemId, reason))} className="btn py-1.5 bg-red-600 text-white hover:bg-red-700">Cancel item</button>
          <button onClick={() => setCancelling(false)} className="text-sm text-slate-500">Keep</button>
        </div>
      )}
      {msg.error && <p className="text-xs text-red-600">{msg.error}</p>}
      {msg.ok && <p className="text-xs text-emerald-700">{msg.ok}</p>}
    </div>
  );
}
