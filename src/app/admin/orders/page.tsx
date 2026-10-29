import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdminPage } from '@/lib/guards';
import { formatRand } from '@/lib/format';
import type { OrderStatus } from '@/generated/prisma/enums';

const FILTERS: [OrderStatus | 'ALL', string][] = [
  ['ALL', 'All'], ['PENDING_PAYMENT', 'Awaiting payment'], ['PAID', 'Paid'], ['PROCESSING', 'Processing'],
  ['SHIPPED', 'Shipped'], ['DELIVERED', 'Delivered'], ['CANCELLED', 'Cancelled'],
];

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdminPage();
  const { status = 'ALL', q = '' } = await searchParams;
  const filter = FILTERS.some(([s]) => s === status) ? status : 'ALL';
  const orders = await db.order.findMany({
    where: {
      ...(filter === 'ALL' ? {} : { status: filter as OrderStatus }),
      ...(q.trim() ? { OR: [{ number: { contains: q.trim().toUpperCase() } }, { email: { contains: q.trim().toLowerCase() } }, { phone: { contains: q.trim() } }] } : {}),
    },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map(([s, label]) => (
            <Link key={s} href={`/admin/orders?status=${s}`} className={`rounded-full px-3 py-1 text-sm font-medium ${filter === s ? 'bg-navy-900 text-white' : 'bg-white text-slate-700'}`}>{label}</Link>
          ))}
        </div>
        <form><input name="q" defaultValue={q} placeholder="Order no., email or phone" className="input w-64 py-2" /><input type="hidden" name="status" value={filter} /></form>
      </div>
      {orders.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-600">No orders.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr><th className="p-3">Order</th><th className="p-3">Placed</th><th className="p-3">Customer</th><th className="p-3">Items</th><th className="p-3 text-right">Total</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-3"><Link href={`/admin/orders/${o.number}`} className="font-mono font-semibold text-navy-700 hover:underline">{o.number}</Link></td>
                  <td className="p-3 text-slate-600">{o.createdAt.toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="p-3">{(o.shippingAddr as { name: string }).name}<span className="block text-xs text-slate-500">{o.email}</span></td>
                  <td className="p-3">{o._count.items}</td>
                  <td className="p-3 text-right font-semibold">{formatRand(o.totalCents)}</td>
                  <td className="p-3">{FILTERS.find(([s]) => s === o.status)?.[1] ?? o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
