import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ChevronRight, CircleAlert, CircleCheck, Info, PackageSearch } from 'lucide-react';
import { db } from '@/lib/db';
import { activeDeal, offerVisibility } from '@/lib/catalog';
import { CONDITION_LABEL, dispatchLabel, formatRand, vehicleLabel, yearRange } from '@/lib/format';
import { getSelectedVehicle } from '@/lib/vehicle';
import { railProducts } from '@/lib/product-search';
import { BuyBox, type OfferView } from '@/components/product/BuyBox';
import { ProductCard } from '@/components/product/ProductCard';
import { Stars } from '@/components/product/Stars';
import { ProductGallery } from '@/components/product/ProductGallery';
import { WishlistButton } from '@/components/product/WishlistButton';
import { ReviewForm } from '@/components/product/ReviewForm';
import { getSessionUser } from '@/lib/session';
import { canReview } from '@/app/account/actions';

type Props = { params: Promise<{ slug: string }> };

const getProduct = cache((slug: string) =>
  db.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: { include: { parent: true } },
      images: { orderBy: { sortOrder: 'asc' } },
      fitments: { include: { vehicle: { include: { model: { include: { make: true } } } } } },
      offers: { where: offerVisibility(), include: { seller: true, deals: { where: activeDeal() } } },
      reviews: { orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { name: true } }, vehicle: { include: { model: { include: { make: true } } } } } },
    },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  const min = Math.min(...p.offers.map((o) => o.priceCents));
  return {
    title: p.title,
    description: `${p.title}. ${p.offers.length ? `From ${formatRand(min)}. ` : ''}${p.description.slice(0, 120)}`,
    alternates: { canonical: `/p/${p.slug}` },
    openGraph: { images: p.images[0] ? [p.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const [{ slug }, vehicle, user] = await Promise.all([params, getSelectedVehicle(), getSessionUser()]);
  const p = await getProduct(slug);
  if (!p || !p.active) notFound();
  const [saved, mayReview, myReview] = user
    ? await Promise.all([
        db.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId: p.id } } }).then(Boolean),
        canReview(user.id, p.id),
        db.review.findUnique({ where: { productId_userId: { productId: p.id, userId: user.id } } }),
      ])
    : [false, false, null];

  const offers: (OfferView & { effective: number })[] = p.offers
    .map((o) => {
      const deal = o.deals.sort((a, b) => a.priceCents - b.priceCents)[0];
      return {
        id: o.id,
        sellerName: o.seller.name,
        sellerCity: o.seller.city,
        sellerVerified: o.seller.verified,
        conditionLabel: CONDITION_LABEL[o.condition],
        priceCents: deal ? deal.priceCents : o.priceCents,
        wasCents: deal ? o.priceCents : o.compareAtCents,
        dealLabel: deal?.label ?? null,
        dealEnds: deal ? deal.endsAt.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' }) : null,
        stock: o.stock,
        warrantyMonths: o.warrantyMonths,
        dispatchText: dispatchLabel(o.dispatchDays),
        effective: deal ? deal.priceCents : o.priceCents,
      };
    })
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || a.effective - b.effective);

  const fits = vehicle ? p.universal || p.fitments.some((f) => f.vehicleId === vehicle.id) : null;
  const specs = Object.entries((p.specs ?? {}) as Record<string, string>);
  const byModel = new Map<string, typeof p.fitments>();
  for (const f of p.fitments) {
    const k = `${f.vehicle.model.make.name} ${f.vehicle.model.name}`;
    byModel.set(k, [...(byModel.get(k) ?? []), f]);
  }

  const related = (await railProducts({ filter: [`categorySlug = "${p.category.slug}"`], limit: 9 }, vehicle)).filter((d) => d.id !== p.id).slice(0, 8);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description,
    sku: p.partNumber,
    mpn: p.partNumber,
    brand: { '@type': 'Brand', name: p.brand.name },
    image: p.images.map((i) => i.url),
    category: p.category.name,
    ...(p.ratingCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.ratingAvg.toFixed(1), reviewCount: p.ratingCount } } : {}),
    ...(offers.length
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'ZAR',
            lowPrice: (Math.min(...offers.map((o) => o.effective)) / 100).toFixed(2),
            highPrice: (Math.max(...offers.map((o) => o.effective)) / 100).toFixed(2),
            offerCount: offers.length,
            availability: offers.some((o) => o.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        }
      : {}),
  };

  return (
    <div className="container-page py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-slate-900">Home</Link>
        {p.category.parent && (
          <><ChevronRight className="size-3.5" /><Link href={`/c/${p.category.parent.slug}`} className="hover:text-slate-900">{p.category.parent.name}</Link></>
        )}
        <ChevronRight className="size-3.5" />
        <Link href={`/c/${p.category.slug}`} className="hover:text-slate-900">{p.category.name}</Link>
      </nav>

      {/* DOM order (image, title, buy box, details) gives phones the price straight after the title;
          on desktop the three columns are placed explicitly. */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_330px] lg:grid-rows-[auto_1fr]">
        <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <ProductGallery images={p.images.map((i) => ({ url: i.url, alt: i.alt }))} />
        </div>

        <div className="space-y-4 lg:col-start-2 lg:row-start-1">
          <div>
            <Link href={`/search?brand=${encodeURIComponent(p.brand.name)}`} className="text-sm font-semibold uppercase tracking-wide text-navy-700 hover:underline">{p.brand.name}</Link>
            <h1 className="mt-1 text-2xl font-bold leading-tight">{p.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <Stars value={p.ratingAvg} count={p.ratingCount} size="md" />
              <span>Part no. <span className="font-mono text-slate-900">{p.partNumber}</span></span>
            </div>
          </div>

          {vehicle ? (
            <div className={`flex gap-3 rounded-xl p-4 ${fits ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900'}`}>
              {fits ? <CircleCheck className="size-6 shrink-0" /> : <CircleAlert className="size-6 shrink-0" />}
              <div className="text-sm">
                <p className="font-semibold">{fits ? (p.universal ? 'Universal part' : 'This part fits your vehicle') : 'This part does not fit your vehicle'}</p>
                <p>{vehicle.year} {vehicle.label}</p>
                {!fits && <Link href={`/c/${p.category.slug}`} className="mt-1 inline-block font-semibold underline">See {p.category.name.toLowerCase()} that fit</Link>}
              </div>
            </div>
          ) : (
            <div className="flex gap-3 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
              <Info className="size-5 shrink-0" />
              <p>Select your vehicle at the top of the page to check that this part fits before you buy.</p>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-36 lg:col-start-3 lg:row-span-2 lg:row-start-1">
          {offers.length > 0 ? (
            <div className="space-y-3">
              <BuyBox offers={offers.map(({ effective: _e, ...o }) => o)} initialId={offers[0].id} />
              <WishlistButton productId={p.id} slug={p.slug} initialSaved={saved} />
            </div>
          ) : (
            <div className="card space-y-3 p-5 text-center">
              <PackageSearch className="mx-auto size-8 text-slate-400" />
              <p className="font-semibold">Currently unavailable</p>
              <p className="text-sm text-slate-600">Our sellers can source this part for you.</p>
              <Link href="/quote" className="btn-primary w-full">Request a quote</Link>
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-start-2 lg:row-start-2">
          {specs.length > 0 && (
            <div>
              <h2 className="mb-2 font-semibold">Specifications</h2>
              <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-sm">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[140px_1fr] gap-3 px-4 py-2">
                    <dt className="text-slate-500">{k}</dt><dd className="text-slate-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div>
            <h2 className="mb-2 font-semibold">About this part</h2>
            <p className="text-sm leading-relaxed text-slate-700">{p.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Compatible vehicles</h2>
          {p.universal ? (
            <p className="text-sm text-slate-600">Universal: suitable for any vehicle that uses this specification. Check your owner’s manual.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {[...byModel.entries()].map(([model, list]) => (
                <li key={model}>
                  <p className="font-semibold">{model}</p>
                  <ul className="mt-1 space-y-0.5 text-slate-600">
                    {list.map((f) => (
                      <li key={f.id} className={vehicle?.id === f.vehicleId ? 'font-semibold text-emerald-700' : ''}>
                        {f.vehicle.engine}{f.vehicle.engineCode && ` (${f.vehicle.engineCode})`}{f.vehicle.generation && ` · ${f.vehicle.generation}`} · {yearRange(f.vehicle.yearFrom, f.vehicle.yearTo)}
                        {f.position && ` · ${f.position}`}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Customer reviews</h2>
          {mayReview && (
            <div className="mb-4">
              <ReviewForm
                productId={p.id}
                vehicles={p.fitments.map((f) => ({ id: f.vehicleId, label: vehicleLabel(f.vehicle) }))}
                existing={myReview ? { rating: myReview.rating, title: myReview.title, body: myReview.body, vehicleId: myReview.vehicleId } : null}
              />
            </div>
          )}
          {p.reviews.length === 0 ? (
            <p className="text-sm text-slate-600">No reviews yet. Reviews can only be written by customers who bought this part on WHATPART.</p>
          ) : (
            <ul className="space-y-4">
              {p.reviews.map((r) => (
                <li key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                  <Stars value={r.rating} count={1} />
                  <p className="mt-1 font-semibold">{r.title}</p>
                  <p className="text-xs text-slate-500">
                    {r.user.name.split(' ')[0]} · {r.createdAt.toLocaleDateString('en-ZA')}
                    {r.verifiedPurchase && ' · Verified purchase'}
                    {r.vehicle && ` · Fitted to ${vehicleLabel(r.vehicle)}`}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xl font-bold">More {p.category.name.toLowerCase()}{vehicle ? ` for your ${vehicle.model}` : ''}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.slice(0, 4).map((d) => <ProductCard key={d.id} doc={d} vehicle={vehicle} />)}
          </div>
        </section>
      )}
    </div>
  );
}
