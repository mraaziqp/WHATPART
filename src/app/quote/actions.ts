'use server';

import { randomInt } from 'node:crypto';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

const QuoteInput = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  email: z.email('Enter a valid email address').max(160),
  phone: z.string().trim().regex(/^(\+27|0)[6-8]\d{8}$/, 'Enter a valid SA mobile number'),
  vehicle: z.string().trim().min(4, 'Tell us the make, model and year').max(160),
  vin: z.string().trim().toUpperCase().refine((v) => v === '' || /^[A-HJ-NPR-Z0-9]{17}$/.test(v), 'A VIN is 17 letters and numbers (no I, O or Q)').optional(),
  part: z.string().trim().min(5, 'Describe the part you need').max(1000),
  condition: z.enum(['any', 'new', 'used']),
  city: z.string().trim().min(2, 'Enter your city or town').max(80),
});

export type QuoteState = { ok?: string; error?: string; fieldErrors?: Record<string, string> };

export async function submitQuote(_prev: QuoteState, form: FormData): Promise<QuoteState> {
  const parsed = QuoteInput.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { error: 'Please check the highlighted fields.', fieldErrors };
  }
  const user = await getSessionUser();
  const number = `Q-${randomInt(100000, 999999)}`;
  await db.quoteRequest.create({
    data: { ...parsed.data, vin: parsed.data.vin || null, email: parsed.data.email.toLowerCase(), number, userId: user?.id },
  });
  return { ok: number };
}
