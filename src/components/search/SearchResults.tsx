import Link from 'next/link';
import { CheckSquare, ChevronLeft, ChevronRight, SearchX, Square, CircleCheck } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { SortSelect } from './SortSelect';
import { SORTS, searchProducts, type Filters } from '@/lib/product-search';
import { CONDITION_LABEL } from '@/lib/format';
import type { SelectedVehicle } from '@/lib/vehicle';
import type { Condition } from '@/generated/prisma/enums';

type Props = {
  basePath: string;
  filters: Filters;
  vehicle: SelectedVehicle | null;
  categoryNames: Record<string, string>;
  categoryFacet: 'parentSlug' | 'categorySlug' | null; // which level to offer as a category filter
  lockedParams?: string[]; // params baked into basePath (e.g. category page)
};

const PRICE_RANGES: [string, number | undefined, number | undefined][] = [
  ['Under R500', undefined, 500], ['R500 – R1,000', 500, 1000], ['R1,000 – R2,500', 1000, 2500], ['Over R2,500', 2500, undefined],
];

const Check = ({ on }: { on: boolean }) =>
  on ? <CheckSquare className="size-4 shrink-0 text-navy-800" /> : <Square className="size-4 shrink-0 text-slate-400" />;

function toParams(f: Filters, lockedParams: string[]) {
  const p: Record<string, string> = {};
  if (f.q) p.q = f.q;
  if (f.cat && !lockedParams.includes('cat')) p.cat = f.cat;
  if (f.brands.length) p.brand = f.brands.join(',');
  if (f.conds.length) p.cond = f.conds.join(',');
  if (f.min) p.min = String(f.min);
  if (f.max) p.max = String(f.max);
  if (f.inStock) p.instock = '1';
  if (f.deals && !lockedParams.includes('deals')) p.deals = '1';
  if (!f.fit) p.fit = '0';
  if (f.sort !== 'relevance') p.sort = f.sort;
  if (f.page > 1) p.page = String(f.page);
  return p;
}

export async function SearchResults({ basePath, filters: f, vehicle, categoryNames, categoryFacet, lockedParams = [] }: Props) {
  const res = await searchProducts(f, vehicle);
  const base = toParams(f, lockedParams);
  const href = (changes: Record<string, string | undefined>, keepPage = false) => {
    const p = { ...base, ...changes };
    if (!keepPage) delete p.page;
    for (const k of Object.keys(p)) if (p[k] === undefined || p[k] === '') delete p[k];
    const qs = new URLSearchParams(p as Record<string, string>).toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const toggle = (key: 'brand' | 'cond', current: string[], value: string) => {
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    return href({ [key]: next.join(',') || undefined });
  };

  const brandFacet = Object.entries(res.facets.brand ?? {}).sort((a, b) => b[1] - a[1]);
  const condFacet = Object.entries(res.facets.conditions ?? {});
  const catFacet = categoryFacet ? Object.entries(res.facets[categoryFacet] ?? {}).sort((a, b) => b[1] - a[1]) : [];
  const anyFilter = f.brands.length || f.conds.length || f.min || f.max || f.inStock || (f.cat && !lockedParams.includes('cat'));

  const sidebar = (
    <div className="space-y-6 text-sm">
      {vehicle && (
        <div className="rounded-lg bg-emerald-50 p-3">
          <Link href={href({ fit: f.fit ? '0' : undefined })} className="flex items-start gap-2 font-medium text-emerald-900">
            <Check on={f.fit} />
            <span>Only parts that fit my <strong>{vehicle.year} {vehicle.label}</strong></span>
          </Link>
        </div>
      )}
      {catFacet.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold text-slate-900">Category</h3>
          <ul className="space-y-1.5">
            {catFacet.map(([slug, n]) => (
              <li key={slug}>
                <Link href={href({ cat: f.cat === slug ? undefined : slug })} className="flex items-center gap-2 text-slate-700 hover:text-slate-950">
                  <Check on={f.cat === slug} /> <span className="flex-1">{categoryNames[slug] ?? slug}</span> <span className="text-xs text-slate-400">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3 className="mb-2 font-semibold text-slate-900">Price</h3>
        <ul className="space-y-1.5">
          {PRICE_RANGES.map(([label, min, max]) => {
            const on = f.min === min && f.max === max;
            return (
              <li key={label}>
                <Link href={href(on ? { min: undefined, max: undefined } : { min: min?.toString(), max: max?.toString() })} className="flex items-center gap-2 text-slate-700 hover:text-slate-950">
                  <Check on={on} /> {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      {condFacet.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold text-slate-900">Condition</h3>
          <ul className="space-y-1.5">
            {condFacet.map(([c, n]) => (
              <li key={c}>
                <Link href={toggle('cond', f.conds, c)} className="flex items-center gap-2 text-slate-700 hover:text-slate-950">
                  <Check on={f.conds.includes(c)} /> <span className="flex-1">{CONDITION_LABEL[c as Condition] ?? c}</span> <span className="text-xs text-slate-400">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {brandFacet.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold text-slate-900">Brand</h3>
          <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {brandFacet.map(([b, n]) => (
              <li key={b}>
                <Link href={toggle('brand', f.brands, b)} className="flex items-center gap-2 text-slate-700 hover:text-slate-950">
                  <Check on={f.brands.includes(b)} /> <span className="flex-1">{b}</span> <span className="text-xs text-slate-400">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3 className="mb-2 font-semibold text-slate-900">Availability</h3>
        <Link href={href({ instock: f.inStock ? undefined : '1' })} className="flex items-center gap-2 text-slate-700 hover:text-slate-950">
          <Check on={f.inStock} /> In stock only
        </Link>
      </section>
      {anyFilter ? (
        <Link href={href({ brand: undefined, cond: undefined, min: undefined, max: undefined, instock: undefined, cat: lockedParams.includes('cat') ? base.cat : undefined })} className="block font-semibold text-navy-700 hover:underline">
          Clear all filters
        </Link>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block">{sidebar}</aside>
      <details className="card p-4 lg:hidden">
        <summary className="cursor-pointer font-semibold">Filters</summary>
        <div className="mt-4">{sidebar}</div>
      </details>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            <strong className="text-slate-900">{res.total.toLocaleString('en-US')}</strong> {res.total === 1 ? 'part' : 'parts'}
            {f.q && <> for “<strong className="text-slate-900">{f.q}</strong>”</>}
            {vehicle && f.fit && <> that fit your <strong className="text-slate-900">{vehicle.model}</strong></>}
          </p>
          <SortSelect value={f.sort} options={Object.entries(SORTS).map(([k, v]) => [k, v.label])} />
        </div>

        {res.hits.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
            <SearchX className="size-10 text-slate-400" />
            <h2 className="text-lg font-semibold">No parts found</h2>
            <p className="max-w-md text-sm text-slate-600">
              {vehicle && f.fit ? 'Nothing in this search fits your selected vehicle yet. ' : 'Try a different spelling, a part number or fewer filters. '}
              Our sellers can also source it for you.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {vehicle && f.fit && <Link href={href({ fit: '0' })} className="btn-outline">Show parts for all vehicles</Link>}
              <Link href="/quote" className="btn-primary">Request this part</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {res.hits.map((doc) => <ProductCard key={doc.id} doc={doc} vehicle={vehicle} />)}
            </div>
            {res.totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                {f.page > 1 && <Link href={href({ page: String(f.page - 1) }, true)} className="btn-outline"><ChevronLeft className="size-4" /> Previous</Link>}
                <span className="px-3 text-sm text-slate-600">Page {f.page} of {res.totalPages}</span>
                {f.page < res.totalPages && <Link href={href({ page: String(f.page + 1) }, true)} className="btn-outline">Next <ChevronRight className="size-4" /></Link>}
              </nav>
            )}
          </>
        )}
        {!vehicle && res.hits.length > 0 && (
          <p className="mt-6 flex items-center gap-2 text-sm text-slate-600">
            <CircleCheck className="size-4 text-emerald-600" /> Add your vehicle at the top of the page to see only parts that fit.
          </p>
        )}
      </div>
    </div>
  );
}
