'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { reindexProduct } from '@/lib/search';
import { normaliseVin, VIN_PATTERN } from '@/lib/vin';

export type FormResult = { ok?: string; error?: string };

// ─── Wishlist ───────────────────────────────────────────────────────────────

export async function toggleWishlist(productId: string): Promise<{ saved?: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { error: 'signin' };
  const key = { userId_productId: { userId: user.id, productId } };
  const existing = await db.wishlistItem.findUnique({ where: key });
  if (existing) {
    await db.wishlistItem.delete({ where: key });
  } else {
    const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) return { error: 'Part not found' };
    await db.wishlistItem.create({ data: { userId: user.id, productId } });
  }
  revalidatePath('/account/wishlist');
  return { saved: !existing };
}

// ─── Garage ─────────────────────────────────────────────────────────────────

/** Called whenever a signed-in shopper picks a vehicle, so it's waiting in their garage next time. */
export async function rememberVehicle(vehicleId: string, year: number, vin?: string) {
  const user = await getSessionUser();
  if (!user) return;
  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId }, select: { yearFrom: true, yearTo: true } });
  if (!vehicle || year < vehicle.yearFrom || year > (vehicle.yearTo ?? new Date().getFullYear() + 1)) return;
  const cleanVin = vin && VIN_PATTERN.test(normaliseVin(vin)) ? normaliseVin(vin) : null;
  const existing = await db.garageVehicle.findFirst({ where: { userId: user.id, vehicleId, year } });
  if (existing) {
    if (cleanVin && existing.vin !== cleanVin) await db.garageVehicle.update({ where: { id: existing.id }, data: { vin: cleanVin } });
  } else {
    const count = await db.garageVehicle.count({ where: { userId: user.id } });
    if (count < 20) await db.garageVehicle.create({ data: { userId: user.id, vehicleId, year, vin: cleanVin, isPrimary: count === 0 } });
  }
  revalidatePath('/account/garage');
}

const GarageEdit = z.object({
  id: z.string().min(1),
  nickname: z.string().trim().max(40).optional(),
  vin: z.string().transform(normaliseVin).refine((v) => v === '' || VIN_PATTERN.test(v), 'A VIN is 17 letters and numbers (no I, O or Q)').optional(),
});

export async function updateGarageVehicle(_prev: FormResult, form: FormData): Promise<FormResult> {
  const user = await getSessionUser();
  if (!user) return { error: 'Please sign in.' };
  const parsed = GarageEdit.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, nickname, vin } = parsed.data;
  const updated = await db.garageVehicle.updateMany({ where: { id, userId: user.id }, data: { nickname: nickname || null, vin: vin || null } });
  if (updated.count === 0) return { error: 'Vehicle not found.' };
  revalidatePath('/account/garage');
  return { ok: 'Saved' };
}

export async function removeGarageVehicle(id: string) {
  const user = await getSessionUser();
  if (!user) return;
  await db.garageVehicle.deleteMany({ where: { id, userId: user.id } });
  revalidatePath('/account/garage');
}

// ─── Reviews ────────────────────────────────────────────────────────────────

const PAID_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

/** Only customers with a paid order for this part may review it. */
export async function canReview(userId: string, productId: string) {
  const item = await db.orderItem.findFirst({
    where: { offer: { productId }, status: { notIn: ['CANCELLED'] }, order: { userId, status: { in: [...PAID_STATUSES] } } },
    select: { id: true },
  });
  return !!item;
}

const ReviewInput = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1, 'Choose a star rating').max(5),
  title: z.string().trim().min(3, 'Add a short headline').max(100),
  body: z.string().trim().min(20, 'Tell other buyers a bit more (at least 20 characters)').max(2000),
  vehicleId: z.string().optional(),
});

export async function submitReview(_prev: FormResult, form: FormData): Promise<FormResult> {
  const user = await getSessionUser();
  if (!user) return { error: 'Please sign in to review.' };
  const parsed = ReviewInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { productId, rating, title, body, vehicleId } = parsed.data;
  if (!(await canReview(user.id, productId))) return { error: 'Only customers who bought this part on WHATPART can review it.' };
  const vehicle = vehicleId ? await db.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } }) : null;

  await db.review.upsert({
    where: { productId_userId: { productId, userId: user.id } },
    create: { productId, userId: user.id, rating, title, body, vehicleId: vehicle?.id, verifiedPurchase: true },
    update: { rating, title, body, vehicleId: vehicle?.id ?? null },
  });
  const agg = await db.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true });
  const product = await db.product.update({
    where: { id: productId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
    select: { slug: true },
  });
  await reindexProduct(productId);
  revalidatePath(`/p/${product.slug}`);
  return { ok: 'Thanks, your review is live.' };
}
