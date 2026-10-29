import { Suspense } from 'react';
import Link from 'next/link';
import { Truck, User } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { getCategoryTree } from '@/lib/categories';
import { getSelectedVehicle, getVehicleTree } from '@/lib/vehicle';
import { getSessionUser } from '@/lib/session';
import { SearchBox } from './SearchBox';
import { CartButton, VehicleButton } from './HeaderClient';

export async function Header() {
  const [tree, vehicle, categories, user] = await Promise.all([getVehicleTree(), getSelectedVehicle(), getCategoryTree(), getSessionUser()]);
  const vehicleLabel = vehicle ? `${vehicle.year} ${vehicle.label}` : null;

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <div className="bg-navy-900">
        <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 md:flex-nowrap">
          <Logo />
          <div className="order-last w-full md:order-none md:flex-1">
            <Suspense>
              <SearchBox />
            </Suspense>
          </div>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <div className="hidden max-w-56 sm:block">
              <VehicleButton tree={tree} label={vehicleLabel} />
            </div>
            <Link href={user ? '/account' : '/login'} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-white hover:bg-white/10">
              <User className="size-6" />
              <span className="hidden text-sm leading-tight lg:block">
                <span className="block text-[11px] text-white/70">{user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign in'}</span>
                <span className="font-semibold">Account</span>
              </span>
            </Link>
            <CartButton />
          </div>
        </div>
        <div className="border-t border-white/10 sm:hidden">
          <div className="container-page py-1">
            <VehicleButton tree={tree} label={vehicleLabel} />
          </div>
        </div>
      </div>
      <nav className="border-b border-slate-200 bg-white" aria-label="Categories">
        <div className="container-page flex items-center gap-1 overflow-x-auto py-1.5 text-sm [scrollbar-width:none]">
          <Link href="/deals" className="shrink-0 rounded-md px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50">Daily Deals</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="shrink-0 rounded-md px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900">
              {c.name}
            </Link>
          ))}
          <Link href="/quote" className="shrink-0 rounded-md px-3 py-1.5 font-medium text-navy-800 hover:bg-slate-100">Request a part</Link>
          <span className="ml-auto hidden shrink-0 items-center gap-1.5 pl-4 text-xs text-slate-500 lg:flex">
            <Truck className="size-4 text-emerald-600" /> Free delivery on orders over R1,500
          </span>
        </div>
      </nav>
    </header>
  );
}
