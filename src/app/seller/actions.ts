'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireActiveSeller } from '@/lib/guards';
import { syncOrderStatus } from '@/lib/orders';
import { reindexProduct } from '@/lib/search';

export type FormState = { ok?: string; error?: string; fieldErrors?: Record<string, string> };

const rands = (label: string) =>
  z.coerce.number({ error: `Enter ${label}` }).min(1, `${label} must be at least R1`).max(1_000_000).transform((r) => Math.round(r * 100));

const OfferFields = z.object({
  condition: z.enum(['NEW_GENUINE', 'NEW_AFTERMARKET', 'REMANUFACTURED', 'USED']),
  price: rands('a price'),
  compareAt: z.union([z.literal(''), rands('the was-price')]).optional(),
  stock: z.coerce.number().int('Stock must be a whole number').min(0).max(100_000),
  warrantyMonths: z.coerce.number().int().min(0).max(120),
  dispatchDays: z.coerce.number().int().min(0).max(30),
  sku: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(500).optional(),
});

const errorsOf = (e: z.ZodError) => {
  const fieldErrors: Record<string, string> = {};
  for (const i of e.issues) fieldErrors[String(i.path[0])] ??= i.message;
  return { error: 'Please check the highlighted fields.', fieldErrors };
};

const offerData = (o: z.infer<typeof OfferFields>) => ({
  condition: o.condition,
  priceCents: o.price,
  compareAtCents: typeof o.compareAt === 'number' && o.compareAt > o.price ? o.compareAt : null,
  stock: o.stock,
  warrantyMonths: o.warrantyMonths,
  dispatchDays: o.dispatchDays,
  sku: o.sku || null,
  notes: o.notes || null,
});

// ─── Listings ───────────────────────────────────────────────────────────────

export async function createOffer(_prev: FormState, form: FormData): Promise<FormState> {
  const { seller } = await requireActiveSeller();
  const productId = String(form.get('productId') ?? '');
  const parsed = OfferFields.safeParse(Object.fromEntries(form));
  if (!parsed.success) return errorsOf(parsed.error);
  const product = await db.product.findUnique({ where: { id: productId }, select: { id: true, active: true } });
  if (!product?.active) return { error: 'That part is no longer in the catalogue.' };
  const exists = await db.offer.findUnique({ where: { productId_sellerId_condition: { productId, sellerId: seller.id, condition: parsed.data.condition } } });
  if (exists) return { error: 'You already list this part in that condition. Edit the existing listing instead.' };

  await db.offer.create({ data: { productId, sellerId: seller.id, ...offerData(parsed.data) } });
  await reindexProduct(productId);
  revalidatePath('/seller/listings');
  redirect('/seller/listings?added=1');
}

const QuickEdit = z.object({
  offerId: z.string().min(1),
  price: rands('a price'),
  stock: z.coerce.number().int().min(0).max(100_000),
  active: z.enum(['on']).optional(),
});

export async function updateOffer(_prev: FormState, form: FormData): Promise<FormState> {
  const { seller } = await requireActiveSeller();
  const parsed = QuickEdit.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { offerId, price, stock, active } = parsed.data;
  const offer = await db.offer.findFirst({ where: { id: offerId, sellerId: seller.id }, select: { productId: true, compareAtCents: true } });
  if (!offer) return { error: 'Listing not found.' };
  await db.offer.update({
    where: { id: offerId },
    data: {
      priceCents: price,
      stock,
      active: active === 'on',
      // A was-price that is no longer higher than the price would be misleading.
      compareAtCents: offer.compareAtCents && offer.compareAtCents > price ? offer.compareAtCents : null,
    },
  });
  await reindexProduct(offer.productId);
  revalidatePath('/seller/listings');
  return { ok: 'Saved' };
}

// ─── New catalogue part ─────────────────────────────────────────────────────

const ProductFields = z.object({
  title: z.string().trim().min(10, 'Give the part a descriptive title (at least 10 characters)').max(160),
  brand: z.string().trim().min(2, 'Enter the brand').max(60),
  categoryId: z.string().min(1, 'Choose a category'),
  partNumber: z.string().trim().min(2, 'Enter the manufacturer part number').max(60),
  oemNumbers: z.string().trim().max(300).optional(),
  description: z.string().trim().min(30, 'Describe the part (at least 30 characters)').max(4000),
  specs: z.string().trim().max(2000).optional(),
  universal: z.enum(['on']).optional(),
});

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

export async function createProduct(_prev: FormState, form: FormData): Promise<FormState> {
  const { seller } = await requireActiveSeller();
  const p = ProductFields.safeParse(Object.fromEntries(form));
  const o = OfferFields.safeParse(Object.fromEntries(form));
  if (!p.success || !o.success) {
    return { error: 'Please check the highlighted fields.', fieldErrors: { ...(o.success ? {} : errorsOf(o.error).fieldErrors), ...(p.success ? {} : errorsOf(p.error).fieldErrors) } };
  }
  const vehicleIds = form.getAll('vehicleIds').map(String).slice(0, 300);
  const images = form.getAll('images').map(String).filter((u) => /^\/uploads\/products\/\d{4}-\d{2}\/[\w-]+\.webp$/.test(u)).slice(0, 8);
  const universal = p.data.universal === 'on';
  if (!universal && vehicleIds.length === 0) return { error: 'Select the vehicles this part fits, or mark it as universal.', fieldErrors: { vehicleIds: 'Select at least one vehicle' } };
  if (images.length === 0) return { error: 'Add at least one photo of the part.', fieldErrors: { images: 'Add at least one photo' } };

  const category = await db.category.findUnique({ where: { id: p.data.categoryId }, select: { parentId: true } });
  if (!category?.parentId) return { error: 'Choose a specific category.', fieldErrors: { categoryId: 'Choose a specific category' } };
  const validVehicles = await db.vehicle.findMany({ where: { id: { in: vehicleIds } }, select: { id: true } });

  const brandName = p.data.brand;
  const brand =
    (await db.brand.findFirst({ where: { name: { equals: brandName, mode: 'insensitive' } } })) ??
    (await db.brand.create({ data: { name: brandName, slug: `${slugify(brandName)}-${Date.now().toString(36)}`, tier: 'VALUE' } }));

  const specs = Object.fromEntries(
    (p.data.specs ?? '').split('\n').map((l) => l.split(':')).filter((kv) => kv.length >= 2 && kv[0].trim() && kv.slice(1).join(':').trim())
      .slice(0, 20).map(([k, ...v]) => [k.trim().slice(0, 40), v.join(':').trim().slice(0, 120)]),
  );

  const base = slugify(p.data.title) || 'part';
  let slug = base;
  for (let n = 2; await db.product.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${base}-${n}`;

  const product = await db.product.create({
    data: {
      slug,
      title: p.data.title,
      description: p.data.description,
      categoryId: p.data.categoryId,
      brandId: brand.id,
      partNumber: p.data.partNumber.toUpperCase(),
      oemNumbers: (p.data.oemNumbers ?? '').split(/[,\n]/).map((s) => s.trim().toUpperCase()).filter(Boolean).slice(0, 20),
      specs: { Brand: brand.name, ...specs },
      universal,
      createdById: seller.id,
      images: { create: images.map((url, i) => ({ url, alt: p.data.title, sortOrder: i })) },
      fitments: universal ? undefined : { create: validVehicles.map((v) => ({ vehicleId: v.id })) },
      offers: { create: { sellerId: seller.id, ...offerData(o.data) } },
    },
  });
  await reindexProduct(product.id);
  revalidatePath('/seller/listings');
  redirect('/seller/listings?added=1');
}

// ─── Orders ─────────────────────────────────────────────────────────────────

async function ownItem(sellerId: string, itemId: string) {
  return db.orderItem.findFirst({ where: { id: itemId, sellerId }, include: { order: { select: { id: true, status: true } } } });
}

export async function acceptItem(itemId: string): Promise<FormState> {
  const { seller } = await requireActiveSeller();
  const item = await ownItem(seller.id, itemId);
  if (!item || item.status !== 'PENDING') return { error: 'This item can no longer be confirmed.' };
  await db.orderItem.update({ where: { id: itemId }, data: { status: 'ACCEPTED' } });
  await syncOrderStatus(item.order.id);
  revalidatePath('/seller/orders');
  return { ok: 'Stock confirmed' };
}

export async function cancelItem(itemId: string, reason: string): Promise<FormState> {
  const { seller } = await requireActiveSeller();
  const item = await ownItem(seller.id, itemId);
  if (!item || !['PENDING', 'ACCEPTED'].includes(item.status)) return { error: 'Shipped items can’t be cancelled.' };
  await db.orderItem.update({ where: { id: itemId }, data: { status: 'CANCELLED', cancelReason: reason.trim().slice(0, 200) || 'Cancelled by seller' } });
  await syncOrderStatus(item.order.id);
  revalidatePath('/seller/orders');
  return { ok: 'Item cancelled' };
}

export async function shipItem(itemId: string, tracking: string): Promise<FormState> {
  const { seller } = await requireActiveSeller();
  const ref = tracking.trim().slice(0, 60);
  if (ref.length < 4) return { error: 'Enter the courier tracking number.' };
  const item = await ownItem(seller.id, itemId);
  if (!item || !['PENDING', 'ACCEPTED'].includes(item.status)) return { error: 'This item can’t be shipped.' };
  if (!['PAID', 'PROCESSING', 'SHIPPED'].includes(item.order.status)) return { error: 'Wait until the order is paid before shipping.' };
  await db.orderItem.update({ where: { id: itemId }, data: { status: 'SHIPPED', trackingRef: ref } });
  await syncOrderStatus(item.order.id);
  revalidatePath('/seller/orders');
  return { ok: 'Marked as shipped' };
}

// ─── Part requests ──────────────────────────────────────────────────────────

const QuoteReply = z.object({
  requestId: z.string().min(1),
  condition: z.enum(['NEW_GENUINE', 'NEW_AFTERMARKET', 'REMANUFACTURED', 'USED']),
  price: rands('a price'),
  notes: z.string().trim().max(500).optional(),
});

export async function respondToRequest(_prev: FormState, form: FormData): Promise<FormState> {
  const { seller } = await requireActiveSeller();
  const parsed = QuoteReply.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { requestId, condition, price, notes } = parsed.data;
  const request = await db.quoteRequest.findUnique({ where: { id: requestId }, select: { status: true } });
  if (!request || request.status === 'CLOSED' || request.status === 'ACCEPTED') return { error: 'This request is closed.' };
  await db.quoteResponse.upsert({
    where: { requestId_sellerId: { requestId, sellerId: seller.id } },
    create: { requestId, sellerId: seller.id, condition, priceCents: price, notes: notes || null },
    update: { condition, priceCents: price, notes: notes || null },
  });
  if (request.status === 'OPEN') await db.quoteRequest.update({ where: { id: requestId }, data: { status: 'QUOTED' } });
  revalidatePath('/seller/requests');
  return { ok: 'Quote sent' };
}
