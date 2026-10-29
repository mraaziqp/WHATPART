import Link from 'next/link';
import { ArrowRight, BadgeCheck, CircleCheck, Recycle, Scale, Search, Store, Zap } from 'lucide-react';
import { db } from '@/lib/db';
import { getCategoryTree } from '@/lib/categories';
import { getSelectedVehicle, getVehicleTree } from '@/lib/vehicle';
import { activeDealFilter, railProducts } from '@/lib/product-search';
import { VehiclePicker } from '@/components/vehicle/VehiclePicker';
import { ProductCard } from '@/components/product/ProductCard';
import type { ProductDoc } from '@/lib/search';
import type { SelectedVehicle } from '@/lib/vehicle';

function Rail({ title, href, docs, vehicle, accent }: { title: React.ReactNode; href: string; docs: ProductDoc[]; vehicle: SelectedVehicle | null; accent?: boolean }) {
  if (docs.length === 0) return null;
  return (
    <section className="container-page mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className={`flex items-center gap-2 text-xl font-bold ${accent ? 'text-red-600' : ''}`}>{title}</h2>
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-navy-700 hover:underline">See all <ArrowRight className="size-4" /></Link>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5">
        {docs.map((d) => (
          <div key={d.id} className="w-44 shrink-0 snap-start sm:w-auto"><ProductCard doc={d} vehicle={vehicle} /></div>
        ))}
      </div>
    </section>
  );
}

const ADVANTAGES = [
  { icon: CircleCheck, title: 'Fitment checked', text: 'Save your vehicle once. Every page tells you whether a part fits before you buy.' },
  { icon: Scale, title: 'Compare sellers', text: 'One page per part with every seller’s price, stock, warranty and delivery time.' },
  { icon: Recycle, title: 'New, reman or used', text: 'Genuine, quality aftermarket, remanufactured and tested used parts side by side.' },
  { icon: Search, title: 'Can’t find it?', text: 'Send a request and sellers across South Africa quote you, often within the hour.' },
];

export default async function HomePage() {
  const [vehicle, tree, categories, makes] = await Promise.all([
    getSelectedVehicle(),
    getVehicleTree(),
    getCategoryTree(),
    db.make.findMany({ where: { popular: true }, orderBy: { name: 'asc' } }),
  ]);
  const [deals, service, brakes] = await Promise.all([
    railProducts({ filter: [activeDealFilter()], limit: 5 }, vehicle),
    railProducts({ filter: ['parentSlug = "filters-service"'], sort: ['priceCents:asc'], limit: 5 }, vehicle),
    railProducts({ filter: ['parentSlug = "brakes"'], limit: 5 }, vehicle),
  ]);

  return (
    <>
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white">
        <div className="container-page py-10 sm:py-14">
          {vehicle ? (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-brand-400"><BadgeCheck className="size-4" /> Your garage</p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl">Parts for your {vehicle.year} {vehicle.label}</h1>
                <p className="mt-2 max-w-xl text-white/80">Everything below is filtered to parts that fit. Change vehicle any time from the top of the page.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/search" className="btn-primary px-6 py-3 text-base">Shop all parts that fit</Link>
                <Link href="/c/filters-service" className="btn bg-white/10 px-6 py-3 text-base text-white hover:bg-white/20">Service parts</Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">The right part for your car. <span className="text-brand-400">Delivered.</span></h1>
              <p className="mt-3 max-w-2xl text-lg text-white/80">Tell us what you drive and we’ll only show parts that fit, from sellers across South Africa.</p>
              <div className="mt-6 rounded-2xl bg-white p-4 text-slate-900 shadow-2xl sm:p-5">
                <VehiclePicker tree={tree} variant="hero" />
              </div>
              <p className="mt-3 text-sm text-white/70">Or <Link href="/search" className="font-semibold text-white underline">search all parts</Link> by name or part number.</p>
            </>
          )}
        </div>
      </section>

      <section className="container-page mt-8">
        <h2 className="mb-4 text-xl font-bold">Shop by category</h2>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {categories.map((c) => (
            <div key={c.id} className="card w-72 shrink-0 snap-start p-4 transition hover:shadow-md sm:w-auto">
              <Link href={`/c/${c.slug}`} className="font-semibold hover:text-navy-700">{c.name}</Link>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {c.children.slice(0, 3).map((ch) => (
                  <Link key={ch.id} href={`/c/${ch.slug}`} className="group flex flex-col items-center gap-1 text-center">
                    <span className="flex aspect-square w-full items-center justify-center rounded-lg bg-slate-50 p-2 group-hover:bg-brand-50">
                      {ch.image && <img src={ch.image} alt="" className="size-full object-contain" />}
                    </span>
                    <span className="line-clamp-2 text-[11px] leading-tight text-slate-600 group-hover:text-slate-900">{ch.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Rail title={<><Zap className="size-5" /> Daily Deals</>} href="/deals" docs={deals} vehicle={vehicle} accent />
      <Rail title={vehicle ? `Service parts for your ${vehicle.model}` : 'Service essentials'} href="/c/filters-service" docs={service} vehicle={vehicle} />
      <Rail title={vehicle ? `Brakes for your ${vehicle.model}` : 'Brakes'} href="/c/brakes" docs={brakes} vehicle={vehicle} />

      <section className="container-page mt-12">
        <h2 className="mb-4 text-xl font-bold">Why buy parts on WHATPART</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ADVANTAGES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <Icon className="size-7 text-brand-600" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {makes.length > 0 && (
        <section className="container-page mt-12">
          <h2 className="mb-4 text-xl font-bold">Popular makes</h2>
          <div className="flex flex-wrap gap-2">
            {makes.map((m) => (
              <Link key={m.id} href={`/search?q=${encodeURIComponent(m.name)}&fit=0`} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:border-navy-700 hover:text-navy-700">
                {m.name} parts
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page mt-12 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-brand-500 p-6 text-navy-950 sm:p-8">
          <h2 className="text-2xl font-black">Can’t find your part?</h2>
          <p className="mt-2 max-w-md">Tell us your vehicle and what you need. Spares shops, importers and salvage yards will send you quotes.</p>
          <Link href="/quote" className="btn-dark mt-5">Request a part <ArrowRight className="size-4" /></Link>
        </div>
        <div className="rounded-2xl bg-navy-900 p-6 text-white sm:p-8">
          <h2 className="flex items-center gap-2 text-2xl font-black"><Store className="size-6 text-brand-400" /> Sell on WHATPART</h2>
          <p className="mt-2 max-w-md text-white/80">Reach buyers across South Africa. List your stock, we handle payments and customer service.</p>
          <Link href="/sell" className="btn-primary mt-5">Become a seller <ArrowRight className="size-4" /></Link>
        </div>
      </section>
    </>
  );
}
