import { NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveCart } from '@/lib/cart';

const Body = z.object({ lines: z.array(z.object({ offerId: z.string().max(40), quantity: z.number().int().min(1).max(99) })).max(50) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid cart' }, { status: 400 });
  return NextResponse.json({ items: await resolveCart(parsed.data.lines) });
}
