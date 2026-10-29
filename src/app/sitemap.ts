import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whatpart.africa';
  const [products, categories] = await Promise.all([
    db.product.findMany({ where: { active: true, offers: { some: { active: true } } }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true } }),
  ]);
  const pages = ['', '/deals', '/quote', '/sell', '/about', '/contact', '/terms', '/privacy', '/returns', '/shipping'];
  return [
    ...pages.map((p) => ({ url: `${site}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.5 })),
    ...categories.map((c) => ({ url: `${site}/c/${c.slug}`, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${site}/p/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'daily' as const, priority: 0.7 })),
  ];
}
