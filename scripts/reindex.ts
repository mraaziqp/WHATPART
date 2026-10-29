// Rebuild the Meilisearch products index from PostgreSQL. Run after seeding or bulk imports.
import 'dotenv/config';
import { db } from '../src/lib/db.ts';
import { INDEX_SETTINGS, meili, productForIndex, toDoc, type ProductDoc } from '../src/lib/search.ts';

async function main() {
  const tmp = 'products_rebuild';
  await meili.deleteIndexIfExists(tmp);
  await meili.createIndex(tmp, { primaryKey: 'id' }).waitTask();
  const index = meili.index<ProductDoc>(tmp);
  await index.updateSettings(INDEX_SETTINGS).waitTask();

  let cursor: string | undefined;
  let total = 0;
  for (;;) {
    const batch = await db.product.findMany({
      where: { active: true },
      take: 250,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      ...productForIndex,
    });
    if (batch.length === 0) break;
    const docs = batch.map(toDoc).filter((d): d is ProductDoc => d !== null);
    await index.addDocuments(docs).waitTask({ timeout: 120_000 });
    total += docs.length;
    cursor = batch[batch.length - 1].id;
  }

  // Atomically swap the fresh index in so search never goes empty during a rebuild.
  const exists = await meili.getIndex('products').then(() => true, () => false);
  if (!exists) await meili.createIndex('products', { primaryKey: 'id' }).waitTask();
  await meili.swapIndexes([{ indexes: ['products', tmp], rename: false }]).waitTask();
  await meili.deleteIndex(tmp).waitTask();
  console.log(`Indexed ${total} products`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
