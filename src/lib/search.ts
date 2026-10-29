import { Meilisearch, type Index } from 'meilisearch';
import type { Prisma } from '@/generated/prisma/client';
import { db } from './db';
import { offerVisibility } from './catalog';
import { vehicleLabel } from './format';

export const meili = new Meilisearch({
  host: process.env.MEILI_HOST ?? 'http://127.0.0.1:7700',
  apiKey: process.env.MEILI_MASTER_KEY,
});

export type ProductDoc = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  brandTier: string;
  category: string;
  categorySlug: string;
  parentCategory: string;
  parentSlug: string;
  partNumber: string;
  oemNumbers: string[];
  specText: string;
  image: string | null;
  universal: boolean;
  vehicleIds: string[];
  vehicles: string[];
  makes: string[];
  priceCents: number;
  compareAtCents: number | null;
  conditions: string[];
  sellerCount: number;
  inStock: boolean;
  dispatchDays: number;
  ratingAvg: number;
  ratingCount: number;
  hasDeal: boolean;
  createdAt: number;
};

export const productsIndex = (): Index<ProductDoc> => meili.index<ProductDoc>('products');

export const INDEX_SETTINGS = {
  searchableAttributes: ['title', 'partNumber', 'oemNumbers', 'brand', 'category', 'parentCategory', 'vehicles', 'specText'],
  filterableAttributes: ['vehicleIds', 'universal', 'categorySlug', 'parentSlug', 'brand', 'conditions', 'inStock', 'priceCents', 'hasDeal', 'makes', 'ratingAvg'],
  sortableAttributes: ['priceCents', 'ratingAvg', 'createdAt', 'dispatchDays'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness', 'inStock:desc'],
  synonyms: {
    globe: ['bulb'], globes: ['bulbs'], bulb: ['globe'],
    shocks: ['shock absorbers'], 'shock absorber': ['shocks'],
    pads: ['brake pads'], rotors: ['brake discs'], rotor: ['brake disc'], discs: ['brake discs'],
    bakkie: ['pickup'], ute: ['bakkie'],
    battery: ['batteries'], wipers: ['wiper blades'],
    vivo: ['polo vivo'], gd6: ['gd-6'], d4d: ['d-4d'], tdci: ['tdi'],
    'cv joint': ['cv'], 'cambelt': ['timing belt'], 'timing belt': ['cambelt'],
  },
  typoTolerance: { minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
  pagination: { maxTotalHits: 5000 },
  faceting: { maxValuesPerFacet: 100 },
};

export const productForIndex = {
  include: {
    brand: true,
    category: { include: { parent: true } },
    images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    fitments: { include: { vehicle: { include: { model: { include: { make: true } } } } } },
    offers: {
      where: offerVisibility(),
      include: { deals: { where: { startsAt: { lte: new Date() }, endsAt: { gte: new Date() } } } },
    },
  },
} satisfies Prisma.ProductDefaultArgs;

type IndexedProduct = Prisma.ProductGetPayload<typeof productForIndex>;

export function toDoc(p: IndexedProduct): ProductDoc | null {
  if (p.offers.length === 0) return null;
  const priced = p.offers.map((o) => ({
    ...o,
    effective: o.deals.length ? Math.min(...o.deals.map((d) => d.priceCents)) : o.priceCents,
  }));
  const inStock = priced.filter((o) => o.stock > 0);
  const pool = inStock.length ? inStock : priced;
  const best = pool.reduce((a, b) => (b.effective < a.effective ? b : a));
  const vehicles = p.fitments.map((f) => f.vehicle);
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    brand: p.brand.name,
    brandTier: p.brand.tier,
    category: p.category.name,
    categorySlug: p.category.slug,
    parentCategory: p.category.parent?.name ?? p.category.name,
    parentSlug: p.category.parent?.slug ?? p.category.slug,
    partNumber: p.partNumber,
    oemNumbers: p.oemNumbers,
    specText: Object.values((p.specs ?? {}) as Record<string, string>).join(' '),
    image: p.images[0]?.url ?? null,
    universal: p.universal,
    vehicleIds: vehicles.map((v) => v.id),
    vehicles: vehicles.map((v) => vehicleLabel(v)),
    makes: [...new Set(vehicles.map((v) => v.model.make.name))],
    priceCents: best.effective,
    compareAtCents: best.deals.length ? best.priceCents : best.compareAtCents,
    conditions: [...new Set(p.offers.map((o) => o.condition))],
    sellerCount: new Set(p.offers.map((o) => o.sellerId)).size,
    inStock: inStock.length > 0,
    dispatchDays: Math.min(...pool.map((o) => o.dispatchDays)),
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    hasDeal: priced.some((o) => o.deals.length > 0),
    createdAt: p.createdAt.getTime(),
  };
}

/** Push one product's current state to the index (call after offer/price/stock changes). */
export async function reindexProduct(productId: string) {
  const p = await db.product.findUnique({ where: { id: productId }, ...productForIndex });
  const doc = p && p.active ? toDoc(p) : null;
  if (doc) await productsIndex().addDocuments([doc]);
  else await productsIndex().deleteDocument(productId);
}
