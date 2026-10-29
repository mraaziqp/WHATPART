import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: 'postgresql' }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  session: { expiresIn: 60 * 60 * 24 * 30, cookieCache: { enabled: true, maxAge: 300 } },
  user: {
    additionalFields: {
      phone: { type: 'string', required: false },
      role: { type: 'string', required: false, defaultValue: 'CUSTOMER', input: false },
    },
  },
  telemetry: { enabled: false },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
