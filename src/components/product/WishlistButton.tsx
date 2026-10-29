'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toggleWishlist } from '@/app/account/actions';

export function WishlistButton({ productId, slug, initialSaved }: { productId: string; slug: string; initialSaved: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() =>
        start(async () => {
          const res = await toggleWishlist(productId);
          if (res.error === 'signin') router.push(`/login?next=${encodeURIComponent(`/p/${slug}`)}`);
          else if (res.saved !== undefined) setSaved(res.saved);
        })
      }
      disabled={pending}
      aria-pressed={saved}
      className="btn-outline w-full"
    >
      <Heart className={`size-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} /> {saved ? 'Saved to wishlist' : 'Save to wishlist'}
    </button>
  );
}
