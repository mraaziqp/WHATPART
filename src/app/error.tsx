'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page py-20">
      <div className="card mx-auto max-w-lg space-y-4 p-10 text-center">
        <TriangleAlert className="mx-auto size-12 text-brand-600" />
        <h1 className="text-2xl font-bold">Something went wrong on our side</h1>
        <p className="text-sm text-slate-600">
          Please try again. If it keeps happening, let us know{error.digest ? <> and quote reference <span className="font-mono">{error.digest}</span></> : null}.
        </p>
        <div className="flex justify-center gap-2">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-outline">Go to home page</Link>
        </div>
      </div>
    </div>
  );
}
