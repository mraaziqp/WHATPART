// Grant admin rights to a registered user: npx tsx scripts/make-admin.ts someone@example.com
// On the VPS: cd /opt/whatpart && docker compose run --rm tools npx tsx scripts/make-admin.ts someone@example.com
import 'dotenv/config';
import { db } from '../src/lib/db.ts';

const email = process.argv[2]?.toLowerCase().trim();
if (!email) {
  console.error('Usage: make-admin.ts <email>');
  process.exit(1);
}
const user = await db.user.findUnique({ where: { email } });
if (!user) {
  console.error(`No account for ${email}. Register at /register first.`);
  process.exit(1);
}
await db.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
console.log(`${email} is now an admin. Open /admin.`);
await db.$disconnect();
