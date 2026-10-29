'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSellerForUser } from '@/lib/guards';
import { getSessionUser } from '@/lib/session';

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'] as const;

const Apply = z.object({
  name: z.string().trim().min(2, 'Enter your business name').max(100),
  type: z.enum(['SPARES_SHOP', 'IMPORTER', 'SALVAGE_YARD', 'DEALER']),
  contactName: z.string().trim().min(2, 'Enter a contact person').max(100),
  phone: z.string().trim().regex(/^(\+27|0)\d{9}$/, 'Enter a valid SA phone number'),
  email: z.email('Enter a valid email address'),
  city: z.string().trim().min(2, 'Enter your city or town').max(80),
  province: z.enum(PROVINCES, 'Choose a province'),
  about: z.string().trim().max(600).optional(),
});

export type ApplyState = { error?: string; fieldErrors?: Record<string, string> };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export async function applyToSell(_prev: ApplyState, form: FormData): Promise<ApplyState> {
  const user = await getSessionUser();
  if (!user) return { error: 'Please sign in first.' };
  if (await getSellerForUser(user.id)) redirect('/seller');

  const parsed = Apply.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: 'Please check the highlighted fields.', fieldErrors };
  }
  const base = slugify(parsed.data.name) || 'seller';
  let slug = base;
  for (let n = 2; await db.seller.findUnique({ where: { slug }, select: { id: true } }); n++) slug = `${base}-${n}`;

  await db.seller.create({
    data: { ...parsed.data, email: parsed.data.email.toLowerCase(), slug, ownerId: user.id, status: 'PENDING', isDemo: false },
  });
  redirect('/seller');
}
