import 'server-only';
import { db } from './db';
import { activeDeal, offerVisibility } from './catalog';
import { CONDITION_LABEL, dispatchLabel } from './format';

export type ResolvedLine = {
  offerId: string;
  quantity: number;
  available: number;
  slug: string;
  title: string;
  partNumber: string;
  image: string | null;
  sellerId: string;
  sellerName: string;
  condition: keyof typeof CONDITION_LABEL;
  conditionLabel: string;
  unitCents: number;
  wasCents: number | null;
  dispatchText: string;
};

/** Re-reads every cart line from the database: current price (incl. live deals), stock and seller. */
export async function resolveCart(lines: { offerId: string; quantity: number }[]): Promise<ResolvedLine[]> {
  const clean = lines.filter((l) => typeof l.offerId === 'string' && Number.isInteger(l.quantity) && l.quantity > 0).slice(0, 50);
  if (clean.length === 0) return [];
  const offers = await db.offer.findMany({
    where: { id: { in: clean.map((l) => l.offerId) }, ...offerVisibility(), product: { active: true } },
    include: {
      seller: true,
      deals: { where: activeDeal() },
      product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } },
    },
  });
  return clean.flatMap((l) => {
    const o = offers.find((x) => x.id === l.offerId);
    if (!o) return [];
    const deal = o.deals.sort((a, b) => a.priceCents - b.priceCents)[0];
    return [{
      offerId: o.id,
      quantity: Math.min(l.quantity, 99),
      available: o.stock,
      slug: o.product.slug,
      title: o.product.title,
      partNumber: o.product.partNumber,
      image: o.product.images[0]?.url ?? null,
      sellerId: o.sellerId,
      sellerName: o.seller.name,
      condition: o.condition,
      conditionLabel: CONDITION_LABEL[o.condition],
      unitCents: deal ? deal.priceCents : o.priceCents,
      wasCents: deal ? o.priceCents : o.compareAtCents,
      dispatchText: dispatchLabel(o.dispatchDays),
    }];
  });
}
