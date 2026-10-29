import { db } from '@/lib/db';
import { requireSellerPage } from '@/lib/guards';
import { daysAgo } from '@/lib/format';
import { QuoteReplyForm } from './QuoteReplyForm';

const CONDITION_PREF: Record<string, string> = { any: 'New or used', new: 'New only', used: 'Used only' };

export default async function SellerRequestsPage() {
  const { seller } = await requireSellerPage('/seller/requests');
  if (seller.status !== 'ACTIVE') return null;
  const requests = await db.quoteRequest.findMany({
    where: { status: { in: ['OPEN', 'QUOTED'] }, createdAt: { gte: daysAgo(30) } },
    include: { responses: { where: { sellerId: seller.id } }, _count: { select: { responses: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">Part requests</h2>
        <p className="text-sm text-slate-600">Buyers who couldn’t find a part. Send a quote and WHATPART passes it on; if they accept, it becomes an order.</p>
      </div>
      {requests.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-600">No open requests right now.</div>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => {
            const mine = r.responses[0];
            return (
              <li key={r.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{r.part}</p>
                    <p className="text-sm text-slate-600">{r.vehicle}{r.vin && <span className="font-mono"> · VIN {r.vin}</span>}</p>
                    <p className="text-xs text-slate-500">
                      {r.city} · {CONDITION_PREF[r.condition] ?? r.condition} · {r.createdAt.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} · {r._count.responses} quote{r._count.responses === 1 ? '' : 's'} so far
                    </p>
                  </div>
                  {mine && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">You quoted</span>}
                </div>
                <QuoteReplyForm requestId={r.id} existing={mine ? { condition: mine.condition, price: mine.priceCents / 100, notes: mine.notes } : null} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
