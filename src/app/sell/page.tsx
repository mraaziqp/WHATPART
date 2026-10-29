import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Banknote, Truck, Users } from 'lucide-react';
import { COMPANY } from '@/data/company';

export const metadata: Metadata = {
  title: 'Sell car parts on WHATPART',
  description: 'List your parts stock on South Africa’s parts marketplace. Spares shops, importers and salvage yards welcome.',
};

const POINTS = [
  [Users, 'Buyers who know what they need', 'Customers arrive with their vehicle saved, so they buy parts that fit and return fewer.'],
  [Banknote, 'Get paid without chasing', 'We collect payment up front through PayFast and pay out to your bank account.'],
  [Truck, 'Shipping sorted', 'Courier collection from your premises, or drop off at your nearest Pargo point.'],
  [BadgeCheck, 'Your stock, your prices', 'New, remanufactured or tested used parts. You set the price and warranty.'],
] as const;

export default function SellPage() {
  const subject = encodeURIComponent('Seller application');
  const body = encodeURIComponent('Business name:\nType (spares shop / importer / salvage yard / dealer):\nCity:\nContact person:\nPhone:\nApproximate number of parts in stock:\n');
  return (
    <div className="container-page py-10">
      <div className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
        <h1 className="max-w-2xl text-3xl font-black sm:text-4xl">Sell your parts to buyers across South Africa</h1>
        <p className="mt-3 max-w-xl text-white/80">Spares shops, importers, dealers and salvage yards: list on WHATPART and reach customers far beyond your town.</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/sell/apply" className="btn-primary px-6 py-3 text-base">Apply to sell</Link>
          <Link href="/seller" className="btn bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20">Seller sign in</Link>
        </div>
        <p className="mt-3 text-sm text-white/60">
          Questions first? <a href={`mailto:${COMPANY.email}?subject=${subject}&body=${body}`} className="underline">Email us</a>.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(([Icon, title, text]) => (
          <div key={title} className="card p-5">
            <Icon className="size-7 text-brand-600" />
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
