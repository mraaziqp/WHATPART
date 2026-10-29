import { db } from '@/lib/db';
import { requireAdminPage } from '@/lib/guards';
import { CONDITION_LABEL, formatRand } from '@/lib/format';
import { ActionButton } from '../ActionButton';
import { closeRequest } from '../actions';

export default async function AdminRequestsPage() {
  await requireAdminPage();
  const requests = await db.quoteRequest.findMany({
    where: { status: { not: 'CLOSED' } },
    include: { responses: { include: { seller: { select: { name: true, city: true, phone: true } } }, orderBy: { priceCents: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Forward the best quotes to the buyer on WhatsApp or email. Close requests once they’re handled.</p>
      {requests.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-600">No open part requests.</div>
      ) : (
        requests.map((r) => (
          <div key={r.id} className="card p-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{r.number} · {r.part}</p>
                <p className="text-slate-600">{r.vehicle}{r.vin && <span className="font-mono"> · {r.vin}</span>} · {r.condition} · {r.city}</p>
                <p className="text-slate-600">
                  {r.name} · <a className="text-navy-700 hover:underline" href={`https://wa.me/${r.phone.replace(/\D/g, '').replace(/^0/, '27')}`}>{r.phone} (WhatsApp)</a> ·{' '}
                  <a className="text-navy-700 hover:underline" href={`mailto:${r.email}`}>{r.email}</a>
                </p>
                <p className="text-xs text-slate-500">{r.createdAt.toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              </div>
              <ActionButton action={closeRequest.bind(null, r.id)} label="Close" confirm="Close this request?" />
            </div>
            {r.responses.length > 0 ? (
              <ul className="mt-3 space-y-1 rounded-lg bg-slate-50 p-3">
                {r.responses.map((q) => (
                  <li key={q.id}>
                    <strong>{formatRand(q.priceCents)}</strong> · {CONDITION_LABEL[q.condition]} · {q.seller.name} ({q.seller.city}{q.seller.phone && `, ${q.seller.phone}`}){q.notes && <span className="text-slate-600"> · {q.notes}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-slate-500">No quotes yet.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
