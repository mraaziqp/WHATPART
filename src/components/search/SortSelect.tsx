'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function SortSelect({ options, value }: { options: [string, string][]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <select
      aria-label="Sort results"
      className="input w-auto py-2"
      value={value}
      onChange={(e) => {
        const next = new URLSearchParams(params);
        if (e.target.value === 'relevance') next.delete('sort');
        else next.set('sort', e.target.value);
        next.delete('page');
        router.push(`${pathname}?${next}`);
      }}
    >
      {options.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
    </select>
  );
}
