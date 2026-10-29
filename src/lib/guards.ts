import 'server-only';
import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { db } from './db';
import { getSessionUser } from './session';

// Role and seller ownership are always read from the database, never trusted from the
// (cached) session cookie, so revoking access takes effect on the next request.

export const getSellerForUser = cache(async (userId: string) =>
  db.seller.findFirst({ where: { ownerId: userId, isDemo: false }, orderBy: { createdAt: 'asc' } }),
);

/** For seller pages: signed in and owns a seller account (any status). */
export async function requireSellerPage(next: string) {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  const seller = await getSellerForUser(user.id);
  if (!seller) redirect('/sell/apply');
  return { user, seller };
}

/** For seller mutations: owns an ACTIVE seller account. Throws otherwise. */
export async function requireActiveSeller() {
  const user = await getSessionUser();
  if (!user) throw new Error('Not signed in');
  const seller = await getSellerForUser(user.id);
  if (!seller || seller.status !== 'ACTIVE') throw new Error('Seller account is not active');
  return { user, seller };
}

export async function isAdmin(userId: string) {
  const u = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return u?.role === 'ADMIN';
}

/** Admin pages 404 for everyone else, so the admin area isn't discoverable. */
export async function requireAdminPage() {
  const user = await getSessionUser();
  if (!user || !(await isAdmin(user.id))) notFound();
  return user;
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !(await isAdmin(user.id))) throw new Error('Not authorised');
  return user;
}
