import Link from 'next/link';
import { CircleX } from 'lucide-react';

export const metadata = { title: 'Payment cancelled', robots: { index: false } };

export default function CancelledPage() {
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-lg space-y-4 p-8 text-center">
        <CircleX className="mx-auto size-12 text-slate-400" />
        <h1 className="text-xl font-bold">Payment cancelled</h1>
        <p className="text-sm text-slate-600">No money was taken. Your cart is still saved, so you can try again whenever you’re ready.</p>
        <div className="flex justify-center gap-2">
          <Link href="/cart" className="btn-primary">Back to cart</Link>
          <Link href="/contact" className="btn-outline">Need help?</Link>
        </div>
      </div>
    </div>
  );
}
