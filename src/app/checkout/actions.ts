'use server';

import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { db } from '@/lib/db';
import { resolveCart } from '@/lib/cart';
import { buildPaymentForm } from '@/lib/payfast';
import { getSessionUser } from '@/lib/session';
import { SHIPPING_METHODS, shippingCents, type ShippingMethod } from '@/lib/shipping';

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'] as const;

const CheckoutInput = z.object({
  fullName: z.string().trim().min(3, 'Enter your full name').max(100).refine((v) => v.includes(' '), 'Enter your first and last name'),
  email: z.email('Enter a valid email address').max(160),
  phone: z.string().trim().regex(/^(\+27|0)[6-8]\d{8}$/, 'Enter a valid SA mobile number, e.g. 0821234567'),
  street: z.string().trim().min(5, 'Enter your street address').max(160),
  suburb: z.string().trim().min(2, 'Enter your suburb').max(80),
  city: z.string().trim().min(2, 'Enter your city or town').max(80),
  province: z.enum(PROVINCES, 'Choose a province'),
  postalCode: z.string().trim().regex(/^\d{4}$/, 'Postal code must be 4 digits'),
  shipping: z.enum(Object.keys(SHIPPING_METHODS) as [ShippingMethod, ...ShippingMethod[]]),
  vehicleNote: z.string().trim().max(120).optional(),
  lines: z.array(z.object({ offerId: z.string().max(40), quantity: z.number().int().min(1).max(99) })).min(1).max(50),
});

export type CheckoutInput = z.infer<typeof CheckoutInput>;
export type CheckoutResult =
  | { ok: true; orderNumber: string; payment: { action: string; fields: [string, string][] } }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const orderNumber = () => `WP-${Array.from({ length: 7 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')}`;

export async function placeOrder(raw: CheckoutInput): Promise<CheckoutResult> {
  const parsed = CheckoutInput.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: 'Please check the highlighted fields.', fieldErrors };
  }
  const input = parsed.data;

  const items = await resolveCart(input.lines);
  if (items.length !== input.lines.length) return { ok: false, error: 'Some items in your cart are no longer available. Please review your cart.' };
  const short = items.find((i) => i.available < i.quantity);
  if (short) return { ok: false, error: `Only ${short.available} of “${short.title}” left in stock. Please update your cart.` };

  const subtotal = items.reduce((n, i) => n + i.unitCents * i.quantity, 0);
  const shipping = shippingCents(input.shipping, subtotal);
  const total = subtotal + shipping;
  const user = await getSessionUser();

  let number = orderNumber();
  while (await db.order.findUnique({ where: { number }, select: { id: true } })) number = orderNumber();

  await db.order.create({
    data: {
      number,
      userId: user?.id,
      email: input.email.toLowerCase(),
      phone: input.phone,
      subtotalCents: subtotal,
      shippingCents: shipping,
      totalCents: total,
      shippingMethod: input.shipping,
      shippingAddr: { name: input.fullName, street: input.street, suburb: input.suburb, city: input.city, province: input.province, postalCode: input.postalCode },
      vehicleNote: input.vehicleNote || null,
      items: {
        create: items.map((i) => ({
          offerId: i.offerId, sellerId: i.sellerId, productTitle: i.title, partNumber: i.partNumber,
          condition: i.condition, unitCents: i.unitCents, quantity: i.quantity,
        })),
      },
      payments: { create: { provider: 'PAYFAST', amountCents: total } },
    },
  });

  const [firstName, ...rest] = input.fullName.split(/\s+/);
  const payment = buildPaymentForm({
    orderNumber: number,
    amountCents: total,
    firstName,
    lastName: rest.join(' '),
    email: input.email,
    phone: input.phone,
    itemName: `WHATPART order ${number}`,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whatpart.africa',
  });
  return { ok: true, orderNumber: number, payment };
}
