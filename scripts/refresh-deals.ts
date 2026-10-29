// Search documents carry deal prices, so a deal starting or ending changes what search should
// show. Reindex every product whose deal crossed a boundary in the last window (cron: every 15 min).
import 'dotenv/config';
import { db } from '../src/lib/db.ts';
import { reindexProduct } from '../src/lib/search.ts';

const WINDOW_MINUTES = Number(process.argv[2] ?? 20);
const since = new Date(Date.now() - WINDOW_MINUTES * 60_000);
const now = new Date();

const deals = await db.deal.findMany({
  where: { OR: [{ startsAt: { gte: since, lte: now } }, { endsAt: { gte: since, lte: now } }] },
  select: { offer: { select: { productId: true } } },
});
const productIds = [...new Set(deals.map((d) => d.offer.productId))];
for (const id of productIds) await reindexProduct(id);
console.log(`${now.toISOString()} refresh-deals: ${productIds.length} product(s) reindexed`);
await db.$disconnect();
