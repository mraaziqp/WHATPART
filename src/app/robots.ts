import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whatpart.africa';
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/account', '/checkout', '/cart', '/search', '/seller', '/admin', '/sell/apply'] },
    sitemap: `${site}/sitemap.xml`,
  };
}
