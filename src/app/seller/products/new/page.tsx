import { db } from '@/lib/db';
import { requireSellerPage } from '@/lib/guards';
import { getCategoryTree } from '@/lib/categories';
import { yearRange } from '@/lib/format';
import { ProductForm } from './ProductForm';

export default async function NewProductPage() {
  const { seller } = await requireSellerPage('/seller/products/new');
  if (seller.status !== 'ACTIVE') return null;
  const [categories, brands, vehicles] = await Promise.all([
    getCategoryTree(),
    db.brand.findMany({ orderBy: { name: 'asc' }, select: { name: true } }),
    db.vehicle.findMany({ include: { model: { include: { make: true } } }, orderBy: [{ model: { make: { name: 'asc' } } }, { model: { name: 'asc' } }, { yearFrom: 'desc' }] }),
  ]);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Add a new part to the catalogue</h2>
        <p className="text-sm text-slate-600">Other sellers will be able to offer the same part, so describe it accurately.</p>
      </div>
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name, children: c.children.map((ch) => ({ id: ch.id, name: ch.name })) }))}
        brands={brands.map((b) => b.name)}
        vehicles={vehicles.map((v) => ({
          id: v.id,
          make: v.model.make.name,
          label: `${v.model.name} ${v.engine}${v.generation ? ` (${v.generation})` : ''} ${yearRange(v.yearFrom, v.yearTo)}`,
        }))}
      />
    </div>
  );
}
