import { db } from '@/lib/db';
import { requireAdminPage } from '@/lib/guards';
import { ActionButton } from '../ActionButton';
import { approveSeller, suspendSeller } from '../actions';

const TYPE: Record<string, string> = { SPARES_SHOP: 'Spares shop', IMPORTER: 'Importer', SALVAGE_YARD: 'Salvage yard', DEALER: 'Dealer', WHATPART: 'WHATPART' };

export default async function AdminSellersPage() {
  await requireAdminPage();
  const sellers = await db.seller.findMany({
    where: { isDemo: false },
    include: { owner: { select: { email: true } }, _count: { select: { offers: true } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });
  const demoCount = await db.seller.count({ where: { isDemo: true } });

  return (
    <div className="space-y-4">
      {sellers.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-600">No seller applications yet. Sellers apply at /sell/apply.</div>
      ) : (
        <ul className="space-y-3">
          {sellers.map((s) => (
            <li key={s.id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
              <div className="text-sm">
                <p className="font-semibold">{s.name} <span className="font-normal text-slate-500">· {TYPE[s.type]} · {s.city}, {s.province}</span></p>
                <p className="text-slate-600">{s.contactName} · {s.phone} · {s.email} {s.owner && s.owner.email !== s.email && <span className="text-slate-500">(login: {s.owner.email})</span>}</p>
                {s.about && <p className="mt-1 max-w-2xl text-slate-600">{s.about}</p>}
                <p className="mt-1 text-xs text-slate-500">Applied {s.createdAt.toLocaleDateString('en-ZA')} · {s._count.offers} listings</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : s.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{s.status.toLowerCase()}</span>
                {s.status !== 'ACTIVE' && <ActionButton action={approveSeller.bind(null, s.id)} label="Approve" variant="primary" confirm={`Approve ${s.name}? Their listings go live immediately.`} />}
                {s.status === 'ACTIVE' && <ActionButton action={suspendSeller.bind(null, s.id)} label="Suspend" variant="danger" confirm={`Suspend ${s.name}? All their listings are hidden.`} />}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-500">{demoCount} demo sellers from the seed catalogue are not shown here.</p>
    </div>
  );
}
