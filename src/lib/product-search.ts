import 'server-only';
import { liveDoc, productsIndex, type ProductDoc } from './search';
import type { SelectedVehicle } from './vehicle';

export const PAGE_SIZE = 24;

export const SORTS = {
  relevance: { label: 'Best match', sort: undefined },
  'price-asc': { label: 'Price: low to high', sort: ['priceCents:asc'] },
  'price-desc': { label: 'Price: high to low', sort: ['priceCents:desc'] },
  rating: { label: 'Top rated', sort: ['ratingAvg:desc'] },
  fastest: { label: 'Fastest delivery', sort: ['dispatchDays:asc'] },
  newest: { label: 'Newest', sort: ['createdAt:desc'] },
} as const;
export type SortKey = keyof typeof SORTS;

export type Filters = {
  q: string;
  cat?: string; // category or parent category slug
  brands: string[];
  conds: string[];
  min?: number; // rands
  max?: number;
  inStock: boolean;
  deals: boolean;
  fit: boolean; // restrict to selected vehicle
  sort: SortKey;
  page: number;
};

type Raw = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) => (one(v) ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function parseFilters(sp: Raw, overrides: Partial<Filters> = {}): Filters {
  const sort = one(sp.sort) as SortKey;
  return {
    q: (one(sp.q) ?? '').slice(0, 120),
    cat: one(sp.cat),
    brands: list(sp.brand),
    conds: list(sp.cond),
    min: num(sp.min),
    max: num(sp.max),
    inStock: one(sp.instock) === '1',
    deals: one(sp.deals) === '1',
    fit: one(sp.fit) !== '0',
    sort: sort in SORTS ? sort : 'relevance',
    page: Math.max(1, Math.min(200, num(sp.page) ?? 1)),
    ...overrides,
  };
}

// Filter values come from the URL: escape backslashes before quotes so a value can't
// close the string early and inject its own filter expression.
/** Deals whose end time hasn't passed (index entries can lag a deal's expiry). */
export const activeDealFilter = () => `hasDeal = true AND dealEndsAt > ${Date.now()}`;

const quote = (s: string) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

export function fitFilter(vehicle: SelectedVehicle | null) {
  return vehicle ? `(vehicleIds = ${quote(vehicle.id)} OR universal = true)` : undefined;
}

export async function searchProducts(f: Filters, vehicle: SelectedVehicle | null) {
  const filter: string[] = [];
  if (f.cat) filter.push(`(categorySlug = ${quote(f.cat)} OR parentSlug = ${quote(f.cat)})`);
  if (f.brands.length) filter.push(`brand IN [${f.brands.map(quote).join(', ')}]`);
  if (f.conds.length) filter.push(`conditions IN [${f.conds.map(quote).join(', ')}]`);
  if (f.min) filter.push(`priceCents >= ${Math.round(f.min * 100)}`);
  if (f.max) filter.push(`priceCents <= ${Math.round(f.max * 100)}`);
  if (f.inStock) filter.push('inStock = true');
  if (f.deals) filter.push(activeDealFilter());
  const fit = f.fit ? fitFilter(vehicle) : undefined;
  if (fit) filter.push(fit);

  const sort = SORTS[f.sort].sort;
  const res = await productsIndex().search(f.q, {
    filter,
    facets: ['brand', 'conditions', 'categorySlug', 'parentSlug'],
    hitsPerPage: PAGE_SIZE,
    page: f.page,
    sort: sort ? [...sort] : undefined,
  });
  return {
    hits: res.hits.map((h) => liveDoc(h)),
    total: res.totalHits ?? 0,
    totalPages: res.totalPages ?? 1,
    facets: res.facetDistribution ?? {},
  };
}

/** Small curated rails for the home page (deals, category picks). */
export async function railProducts(opts: { filter?: string[]; sort?: string[]; limit?: number }, vehicle: SelectedVehicle | null) {
  const fit = fitFilter(vehicle);
  const res = await productsIndex().search<ProductDoc>('', {
    filter: [...(opts.filter ?? []), 'inStock = true', ...(fit ? [fit] : [])],
    sort: opts.sort,
    limit: opts.limit ?? 10,
  });
  return res.hits.map((h) => liveDoc(h));
}
