import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { db } from './db';

// The category tree is read on every page (header nav) but almost never changes.
export const getCategoryTree = cache(
  unstable_cache(
    () =>
      db.category.findMany({
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' },
        include: { children: { orderBy: { sortOrder: 'asc' } } },
      }),
    ['category-tree'],
    { revalidate: 3600, tags: ['categories'] },
  ),
);

export const getCategoryBySlug = cache((slug: string) =>
  db.category.findUnique({ where: { slug }, include: { parent: true, children: { orderBy: { sortOrder: 'asc' } } } }),
);
