import type { Prisma } from '@/generated/prisma/client';

// Demo (seeded) sellers are visible until real sellers are onboarded; set SHOW_DEMO_SELLERS=false to hide them.
export const showDemoSellers = () => process.env.SHOW_DEMO_SELLERS !== 'false';

export const offerVisibility = (): Prisma.OfferWhereInput => ({
  active: true,
  seller: { status: 'ACTIVE', ...(showDemoSellers() ? {} : { isDemo: false }) },
});

export const activeDeal = (): Prisma.DealWhereInput => {
  const now = new Date();
  return { startsAt: { lte: now }, endsAt: { gte: now } };
};
