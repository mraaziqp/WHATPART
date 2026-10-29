'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { applyToSell, type ApplyState } from './actions';

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];

export function ApplyForm({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const [state, action, pending] = useActionState<ApplyState, FormData>(applyToSell, {});
  const err = state.fieldErrors ?? {};
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className={`input ${err[name] ? 'border-red-500' : ''}`} {...props} />
      {err[name] && <p className="mt-1 text-xs text-red-600">{err[name]}</p>}
    </div>
  );

  return (
    <form action={action} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">{field('name', 'Business name')}</div>
        <div>
          <label htmlFor="type" className="label">Business type</label>
          <select id="type" name="type" className="input" defaultValue="SPARES_SHOP">
            <option value="SPARES_SHOP">Spares shop</option>
            <option value="IMPORTER">Importer / distributor</option>
            <option value="SALVAGE_YARD">Salvage yard (used parts)</option>
            <option value="DEALER">Dealership parts department</option>
          </select>
        </div>
        {field('contactName', 'Contact person', { defaultValue: defaultName, autoComplete: 'name' })}
        {field('phone', 'Business phone', { inputMode: 'tel', autoComplete: 'tel' })}
        {field('email', 'Orders email', { type: 'email', defaultValue: defaultEmail })}
        {field('city', 'City or town')}
        <div>
          <label htmlFor="province" className="label">Province</label>
          <select id="province" name="province" className={`input ${err.province ? 'border-red-500' : ''}`} defaultValue="">
            <option value="" disabled>Choose…</option>
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
          {err.province && <p className="mt-1 text-xs text-red-600">{err.province}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="about" className="label">About your business (optional)</label>
          <textarea id="about" name="about" rows={3} maxLength={600} className="input" placeholder="What you specialise in, makes you stock, years in business…" />
        </div>
      </div>
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        {pending && <Loader2 className="size-4 animate-spin" />} Submit application
      </button>
    </form>
  );
}
