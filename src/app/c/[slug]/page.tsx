import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { SearchResults } from '@/components/search/SearchResults';
import { getCategoryBySlug } from '@/lib/categories';
import { parseFilters } from '@/lib/product-search';
import { getSelectedVehicle } from '@/lib/vehicle';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategoryBySlug((await params).slug);
  if (!cat) return {};
  return {
    title: `${cat.name} for your car`,
    description: `${cat.description ?? cat.name}. Compare prices from South African sellers, check fitment for your vehicle and get it delivered.`,
    alternates: { canonical: `/c/${cat.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, sp, vehicle] = await Promise.all([params, searchParams, getSelectedVehicle()]);
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();
  const isParent = cat.children.length > 0;
  const filters = parseFilters(sp, { cat: slug });
  const names = Object.fromEntries(cat.children.map((c) => [c.slug, c.name]));

  return (
    <div className="container-page py-6">
      <nav className="mb-3 flex items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        <ChevronRight className="size-3.5" />
        {cat.parent && (
          <>
            <Link href={`/c/${cat.parent.slug}`} className="hover:text-slate-900">{cat.parent.name}</Link>
            <ChevronRight className="size-3.5" />
          </>
        )}
        <span className="text-slate-900">{cat.name}</span>
      </nav>
      <h1 className="text-2xl font-bold">{cat.name}{vehicle ? ` for your ${vehicle.model}` : ''}</h1>
      {cat.description && <p className="mt-1 text-sm text-slate-600">{cat.description}</p>}

      {isParent && (
        <div className="my-5 flex gap-3 overflow-x-auto pb-1">
          {cat.children.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="card flex w-28 shrink-0 flex-col items-center gap-2 p-3 text-center text-xs font-medium hover:border-brand-500">
              {c.image && <img src={c.image} alt="" className="size-14" />}
              {c.name}
            </Link>
          ))}
        </div>
      )}
      <div className={isParent ? '' : 'mt-5'}>
        <SearchResults
          basePath={`/c/${slug}`}
          filters={filters}
          vehicle={vehicle}
          categoryNames={names}
          categoryFacet={null}
          lockedParams={['cat']}
        />
      </div>
    </div>
  );
}
