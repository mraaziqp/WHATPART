import Link from 'next/link';
import { Heart } from 'lucide-react';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { getSelectedVehicle } from '@/lib/vehicle';
import { productsIndex } from '@/lib/search';
import { ProductCard } from '@/components/product/ProductCard';

export const metadata = { title: 'Wishlist', robots: { index: false } };

export default async function WishlistPage() {
  const user = await requireUser('/account/wishlist');
  const [items, vehicle] = await Promise.all([
    db.wishlistItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, select: { productId: true } }),
    getSelectedVehicle(),
  ]);
  // Live prices and stock come from the search index, which stays in sync with every offer change.
  const docs = items.length
    ? (await productsIndex().getDocuments({ filter: `id IN [${items.map((i) => `"${i.productId}"`).join(', ')}]`, limit: 200 })).results
    : [];
  const ordered = items.map((i) => docs.find((d) => d.id === i.productId)).filter((d) => d !== undefined);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Wishlist <span className="font-normal text-slate-500">({items.length})</span></h2>
      {items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <Heart className="size-10 text-slate-400" />
          <p className="font-semibold">Nothing saved yet</p>
          <p className="text-sm text-slate-600">Tap the heart on any part to save it for later and keep an eye on its price.</p>
          <Link href="/" className="btn-primary">Browse parts</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {ordered.map((d) => <ProductCard key={d.id} doc={d} vehicle={vehicle} />)}
          </div>
          {ordered.length < items.length && <p className="text-xs text-slate-500">{items.length - ordered.length} saved part(s) are currently unavailable.</p>}
        </>
      )}
    </div>
  );
}
