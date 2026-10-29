import 'server-only';
import { cache } from 'react';
import { db } from './db';

export const getCategoryTree = cache(() =>
  db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: 'asc' },
    include: { children: { orderBy: { sortOrder: 'asc' } } },
  }),
);

export const getCategoryBySlug = cache((slug: string) =>
  db.category.findUnique({ where: { slug }, include: { parent: true, children: { orderBy: { sortOrder: 'asc' } } } }),
);
