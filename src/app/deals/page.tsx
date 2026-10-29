import type { Metadata } from 'next';
import { Zap } from 'lucide-react';
import { SearchResults } from '@/components/search/SearchResults';
import { getCategoryTree } from '@/lib/categories';
import { parseFilters } from '@/lib/product-search';
import { getSelectedVehicle } from '@/lib/vehicle';

export const metadata: Metadata = { title: 'Daily deals on car parts' };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DealsPage({ searchParams }: Props) {
  const [sp, vehicle, tree] = await Promise.all([searchParams, getSelectedVehicle(), getCategoryTree()]);
  const names = Object.fromEntries(tree.map((c) => [c.slug, c.name]));
  return (
    <div className="container-page py-6">
      <div className="mb-6 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 text-white">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Zap className="size-6" /> Daily Deals</h1>
        <p className="mt-1 text-sm text-white/90">Limited-time prices from our sellers. When they’re gone, they’re gone.</p>
      </div>
      <SearchResults
        basePath="/deals"
        filters={parseFilters(sp, { deals: true })}
        vehicle={vehicle}
        categoryNames={names}
        categoryFacet="parentSlug"
        lockedParams={['deals']}
      />
    </div>
  );
}
