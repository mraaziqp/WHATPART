'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { useResolvedCart } from '@/components/cart/useResolvedCart';
import { SHIPPING_METHODS, shippingCents, type ShippingMethod } from '@/lib/shipping';
import { placeOrder, type CheckoutInput } from './actions';

const rand = (c: number) => `R ${(c / 100).toLocaleString('en-ZA', { minimumFractionDigits: c % 100 ? 2 : 0 })}`;
const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];

type Field = Exclude<keyof CheckoutInput, 'lines' | 'shipping'>;

export default function CheckoutPage() {
  const lines = useCart((s) => s.lines);
  const { items, subtotalCents, loading } = useResolvedCart();
  const [shipping, setShipping] = useState<ShippingMethod>('courier_guy');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const [payment, setPayment] = useState<{ action: string; fields: [string, string][] } | null>(null);
  const payForm = useRef<HTMLFormElement>(null);

  const delivery = shippingCents(shipping, subtotalCents);
  const total = subtotalCents + delivery;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<Field, string>;
    setError('');
    startTransition(async () => {
      const res = await placeOrder({ ...data, shipping, lines } as CheckoutInput);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setError(res.error);
        return;
      }
      setErrors({});
      setPayment(res.payment);
      // Submit the signed form to PayFast's hosted payment page once it has rendered.
      requestAnimationFrame(() => payForm.current?.submit());
    });
  };

  if (!loading && (!items || items.length === 0) && !payment) {
    return (
      <div className="container-page py-16 text-center">
        <p className="mb-4 text-lg font-semibold">Your cart is empty.</p>
        <Link href="/" className="btn-primary">Continue shopping</Link>
      </div>
    );
  }

  const input = (name: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className={`input ${errors[name] ? 'border-red-500' : ''}`} aria-invalid={!!errors[name]} {...props} />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="container-page py-6">
      <h1 className="mb-5 flex items-center gap-2 text-2xl font-bold"><Lock className="size-5 text-emerald-600" /> Secure checkout</h1>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]" noValidate>
        <div className="space-y-6">
          <section className="card space-y-4 p-5">
            <h2 className="font-bold">1. Contact details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {input('fullName', 'Full name', { autoComplete: 'name', required: true })}
              {input('phone', 'Mobile number', { autoComplete: 'tel', inputMode: 'tel', placeholder: '082 123 4567', required: true })}
              <div className="sm:col-span-2">{input('email', 'Email address', { type: 'email', autoComplete: 'email', required: true })}</div>
            </div>
          </section>

          <section className="card space-y-4 p-5">
            <h2 className="font-bold">2. Delivery address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{input('street', 'Street address', { autoComplete: 'address-line1', required: true })}</div>
              {input('suburb', 'Suburb', { autoComplete: 'address-level3', required: true })}
              {input('city', 'City or town', { autoComplete: 'address-level2', required: true })}
              <div>
                <label htmlFor="province" className="label">Province</label>
                <select id="province" name="province" className={`input ${errors.province ? 'border-red-500' : ''}`} defaultValue="">
                  <option value="" disabled>Choose…</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
                {errors.province && <p className="mt-1 text-xs text-red-600">{errors.province}</p>}
              </div>
              {input('postalCode', 'Postal code', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 4, required: true })}
            </div>
          </section>

          <section className="card space-y-3 p-5">
            <h2 className="font-bold">3. Delivery method</h2>
            {(Object.entries(SHIPPING_METHODS) as [ShippingMethod, (typeof SHIPPING_METHODS)[ShippingMethod]][]).map(([key, m]) => {
              const fee = shippingCents(key, subtotalCents);
              return (
                <label key={key} className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 text-sm ${shipping === key ? 'border-brand-500 bg-brand-50' : 'border-slate-200'}`}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="shipping-choice" checked={shipping === key} onChange={() => setShipping(key)} className="accent-brand-600" />
                    <span><span className="block font-medium">{m.label}</span><span className="text-xs text-slate-500">{m.eta}</span></span>
                  </span>
                  <span className="font-semibold">{fee === 0 ? <span className="text-emerald-700">Free</span> : rand(fee)}</span>
                </label>
              );
            })}
          </section>

          <section className="card space-y-3 p-5">
            <h2 className="font-bold">4. Fitment check <span className="font-normal text-slate-500">(optional)</span></h2>
            <p className="text-sm text-slate-600">Add your vehicle or VIN and we’ll double-check every part fits before it ships.</p>
            {input('vehicleNote', 'Vehicle or VIN', { placeholder: 'e.g. 2019 Toyota Hilux 2.8 GD-6, or your 17-character VIN' })}
          </section>
        </div>

        <aside className="card h-fit space-y-4 p-5 lg:sticky lg:top-36">
          <h2 className="font-bold">Order summary</h2>
          {loading ? (
            <Loader2 className="mx-auto size-6 animate-spin text-slate-400" />
          ) : (
            <ul className="space-y-2 text-sm">
              {items?.map((i) => (
                <li key={i.offerId} className="flex justify-between gap-3">
                  <span className="line-clamp-2 text-slate-700">{i.quantity} × {i.title}</span>
                  <span className="shrink-0 font-medium">{rand(i.unitCents * i.quantity)}</span>
                </li>
              ))}
            </ul>
          )}
          <dl className="space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{rand(subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{delivery === 0 ? 'Free' : rand(delivery)}</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold"><dt>Total</dt><dd>{rand(total)}</dd></div>
          </dl>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={pending || loading || !!payment} className="btn-primary w-full py-3 text-base">
            {pending || payment ? <><Loader2 className="size-5 animate-spin" /> Connecting to PayFast…</> : <>Pay {rand(total)}</>}
          </button>
          <p className="flex items-start gap-2 text-xs text-slate-500">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
            You’ll pay on PayFast’s secure page by card, instant EFT, SnapScan and more. We never see your card details.
          </p>
          <p className="text-xs text-slate-500">
            By placing your order you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/returns" className="underline">returns policy</Link>.
          </p>
        </aside>
      </form>

      {payment && (
        <form ref={payForm} action={payment.action} method="POST" className="hidden">
          {payment.fields.map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
        </form>
      )}
    </div>
  );
}
