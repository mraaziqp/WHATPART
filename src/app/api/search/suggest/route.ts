import { NextResponse, type NextRequest } from 'next/server';
import { productsIndex } from '@/lib/search';
import { getSelectedVehicle } from '@/lib/vehicle';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').slice(0, 120).trim();
  if (q.length < 2) return NextResponse.json({ hits: [] });
  const vehicle = await getSelectedVehicle();
  const res = await productsIndex().search(q, {
    limit: 6,
    attributesToRetrieve: ['id', 'slug', 'title', 'image', 'priceCents', 'vehicleIds', 'universal'],
  });
  // Prefer parts that fit, but never hide results entirely while typing.
  const hits = res.hits.map((h) => ({
    id: h.id,
    slug: h.slug,
    title: h.title,
    image: h.image,
    priceCents: h.priceCents,
    fits: !!vehicle && (h.universal || h.vehicleIds.includes(vehicle.id)),
  }));
  if (vehicle) hits.sort((a, b) => Number(b.fits) - Number(a.fits));
  return NextResponse.json({ hits });
}
