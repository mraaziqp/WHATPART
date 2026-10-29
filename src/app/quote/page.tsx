import type { Metadata } from 'next';
import { Clock, ShieldCheck, Store } from 'lucide-react';
import { getSelectedVehicle } from '@/lib/vehicle';
import { QuoteForm } from './QuoteForm';

export const metadata: Metadata = {
  title: 'Request a part',
  description: 'Can’t find a part? Tell us your vehicle and spares shops, importers and salvage yards across South Africa will quote you.',
};

export default async function QuotePage() {
  const vehicle = await getSelectedVehicle();
  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_420px]">
      <div className="lg:order-2"><QuoteForm defaultVehicle={vehicle ? `${vehicle.year} ${vehicle.label}` : ''} /></div>
      <div className="space-y-5">
        <h1 className="text-3xl font-black">Can’t find your part? We’ll find it.</h1>
        <p className="text-slate-600">
          Rare, discontinued or just not listed yet: send one request and sellers across South Africa check their shelves for you.
          You choose the best quote and pay securely on WHATPART.
        </p>
        <ul className="space-y-4">
          {[
            [Store, 'One request, many sellers', 'Spares shops, importers and salvage yards all see your request.'],
            [Clock, 'Fast answers', 'Most requests get their first quote the same business day.'],
            [ShieldCheck, 'Same buyer protection', 'Quoted parts are covered by our returns policy and fitment guarantee.'],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Store;
            return (
              <li key={title as string} className="flex gap-3">
                <I className="size-6 shrink-0 text-brand-600" />
                <div><p className="font-semibold">{title as string}</p><p className="text-sm text-slate-600">{text as string}</p></div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
