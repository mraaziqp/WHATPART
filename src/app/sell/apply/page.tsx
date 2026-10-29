import { redirect } from 'next/navigation';
import { getSellerForUser } from '@/lib/guards';
import { requireUser } from '@/lib/session';
import { ApplyForm } from './ApplyForm';

export const metadata = { title: 'Apply to sell', robots: { index: false } };

export default async function ApplyPage() {
  const user = await requireUser('/sell/apply');
  if (await getSellerForUser(user.id)) redirect('/seller');
  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_520px]">
      <div className="space-y-4">
        <h1 className="text-3xl font-black">Apply to sell on WHATPART</h1>
        <p className="text-slate-600">Tell us about your business. We review every seller before they go live, usually within one business day.</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Submit this form.</li>
          <li>We verify your business and contact you.</li>
          <li>Once approved, list parts from our catalogue or add your own, and start receiving orders.</li>
        </ol>
      </div>
      <ApplyForm defaultName={user.name} defaultEmail={user.email} />
    </div>
  );
}
