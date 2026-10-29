import Link from 'next/link';
import { Car, Heart, KeyRound, Package } from 'lucide-react';
import { requireUser } from '@/lib/session';
import { getSellerForUser, isAdmin } from '@/lib/guards';
import { SignOutButton } from './SignOutButton';

const NAV = [
  ['/account', 'Orders', Package],
  ['/account/garage', 'My Garage', Car],
  ['/account/wishlist', 'Wishlist', Heart],
  ['/account/security', 'Password', KeyRound],
] as const;

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser('/account');
  const [seller, admin] = await Promise.all([getSellerForUser(user.id), isAdmin(user.id)]);
  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Hi, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {admin && <Link href="/admin" className="btn-dark">Admin</Link>}
          <Link href={seller ? '/seller' : '/sell'} className="btn-outline">{seller ? 'Seller portal' : 'Sell on WHATPART'}</Link>
          <SignOutButton />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0" aria-label="Account">
          {NAV.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white hover:text-slate-950">
              <Icon className="size-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
