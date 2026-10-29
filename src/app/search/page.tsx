import type { Metadata } from 'next';
import { SearchResults } from '@/components/search/SearchResults';
import { getCategoryTree } from '@/lib/categories';
import { parseFilters } from '@/lib/product-search';
import { getSelectedVehicle } from '@/lib/vehicle';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `${q} – parts` : 'All parts', robots: { index: false } };
}

export default async function SearchPage({ searchParams }: Props) {
  const [sp, vehicle, tree] = await Promise.all([searchParams, getSelectedVehicle(), getCategoryTree()]);
  const filters = parseFilters(sp);
  const names = Object.fromEntries(tree.flatMap((c) => [[c.slug, c.name], ...c.children.map((ch) => [ch.slug, ch.name])]));
  return (
    <div className="container-page py-6">
      <h1 className="mb-4 text-2xl font-bold">{filters.q ? `Results for “${filters.q}”` : 'All parts'}</h1>
      <SearchResults basePath="/search" filters={filters} vehicle={vehicle} categoryNames={names} categoryFacet="parentSlug" />
    </div>
  );
}
