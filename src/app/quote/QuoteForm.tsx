'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { CircleCheck, Loader2, Send } from 'lucide-react';
import { submitQuote, type QuoteState } from './actions';

export function QuoteForm({ defaultVehicle }: { defaultVehicle: string }) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuote, {});
  const err = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div className="card space-y-3 p-8 text-center">
        <CircleCheck className="mx-auto size-12 text-emerald-600" />
        <h2 className="text-xl font-bold">Request {state.ok} sent</h2>
        <p className="text-sm text-slate-600">Sellers are checking their stock. We’ll contact you on WhatsApp or email with quotes, usually the same business day.</p>
        <Link href="/" className="btn-primary">Back to shop</Link>
      </div>
    );
  }

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className={`input ${err[name] ? 'border-red-500' : ''}`} {...props} />
      {err[name] && <p className="mt-1 text-xs text-red-600">{err[name]}</p>}
    </div>
  );

  return (
    <form action={action} className="card space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">{field('vehicle', 'Vehicle (make, model, engine, year)', { defaultValue: defaultVehicle, placeholder: 'e.g. 2017 Ford Ranger 3.2 TDCi' })}</div>
        <div className="sm:col-span-2">{field('vin', 'VIN (optional, helps sellers match the exact part)', { maxLength: 17, className: 'input font-mono uppercase' })}</div>
        <div className="sm:col-span-2">
          <label htmlFor="part" className="label">What part do you need?</label>
          <textarea id="part" name="part" rows={4} className={`input ${err.part ? 'border-red-500' : ''}`} placeholder="e.g. Transfer case actuator motor, or part number 4L3Z-7G360-A" />
          {err.part && <p className="mt-1 text-xs text-red-600">{err.part}</p>}
        </div>
        <div>
          <label htmlFor="condition" className="label">Condition</label>
          <select id="condition" name="condition" className="input" defaultValue="any">
            <option value="any">New or used, show me everything</option>
            <option value="new">New only</option>
            <option value="used">Used only (cheapest)</option>
          </select>
        </div>
        {field('city', 'Your city or town', { autoComplete: 'address-level2' })}
        {field('name', 'Your name', { autoComplete: 'name' })}
        {field('phone', 'WhatsApp number', { autoComplete: 'tel', inputMode: 'tel', placeholder: '082 123 4567' })}
        <div className="sm:col-span-2">{field('email', 'Email', { type: 'email', autoComplete: 'email' })}</div>
      </div>
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3 text-base">
        {pending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />} Send request to sellers
      </button>
    </form>
  );
}
