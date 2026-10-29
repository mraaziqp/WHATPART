'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import { formatRand } from '@/lib/format';

type Suggestion = { id: string; slug: string; title: string; image: string | null; priceCents: number; fits: boolean };

export function SearchBox() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (res.ok) setResults((await res.json()).hits);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 140);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    if (active >= 0 && results[active]) return router.push(`/p/${results[active].slug}`);
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search');
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)); }
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <form ref={boxRef} onSubmit={submit} role="search" className="relative w-full">
      <div className="flex overflow-hidden rounded-lg bg-white ring-brand-500 focus-within:ring-2">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder="Search parts, brands or part numbers"
          aria-label="Search parts"
          className="min-w-0 flex-1 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button type="submit" aria-label="Search" className="bg-brand-500 px-4 text-navy-950 hover:bg-brand-400">
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
        </button>
      </div>

      {open && q.trim().length >= 2 && results.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          {results.map((r, i) => (
            <Link
              key={r.id}
              href={`/p/${r.slug}`}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50 ${i === active ? 'bg-slate-100' : ''}`}
            >
              {r.image && <img src={r.image} alt="" className="size-10 shrink-0 rounded bg-slate-50 object-contain p-1" />}
              <span className="line-clamp-2 flex-1">{r.title}</span>
              <span className="shrink-0 text-right">
                <span className="block font-semibold">{formatRand(r.priceCents)}</span>
                {r.fits && <span className="text-xs font-medium text-emerald-700">Fits your vehicle</span>}
              </span>
            </Link>
          ))}
          <button type="submit" className="block w-full border-t border-slate-100 px-3 py-2.5 text-left text-sm font-semibold text-navy-800 hover:bg-slate-50">
            See all results for “{q.trim()}”
          </button>
        </div>
      )}
    </form>
  );
}
