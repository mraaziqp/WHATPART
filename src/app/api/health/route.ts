import { db } from '@/lib/db';
import { meili } from '@/lib/search';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [database, search] = await Promise.all([
    db.$queryRaw`SELECT 1`.then(() => 'ok', () => 'down'),
    meili.health().then((h) => h.status, () => 'down'),
  ]);
  const ok = database === 'ok' && search === 'available';
  return Response.json({ ok, database, search }, { status: ok ? 200 : 503 });
}
