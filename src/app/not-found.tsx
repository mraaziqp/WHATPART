import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-page py-20">
      <div className="card mx-auto max-w-lg space-y-4 p-10 text-center">
        <SearchX className="mx-auto size-12 text-slate-400" />
        <h1 className="text-2xl font-bold">We couldn’t find that page</h1>
        <p className="text-sm text-slate-600">The part or page may have moved. Try searching, or ask our sellers to find it for you.</p>
        <div className="flex justify-center gap-2">
          <Link href="/search" className="btn-primary">Search parts</Link>
          <Link href="/quote" className="btn-outline">Request a part</Link>
        </div>
      </div>
    </div>
  );
}
