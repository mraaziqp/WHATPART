import type { Metadata } from 'next';
import { requireActiveSeller } from '@/lib/guards';
import { getSellerLedgerSummary } from '@/lib/ledger';
import { db } from '@/lib/db';
import { formatRand } from '@/lib/format';
import { BankingForm, PayoutRequestForm } from './FinanceForms';
import {
  Wallet,
  Clock,
  CheckCircle,
  Building2,
  TrendingUp,
  Receipt,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Seller Wallet & Payouts | WHATPART',
  robots: { index: false },
};

export default async function SellerFinancePage() {
  const { seller } = await requireActiveSeller();
  const [summary, fullSeller] = await Promise.all([
    getSellerLedgerSummary(seller.id),
    db.seller.findUnique({
      where: { id: seller.id },
      select: { bankName: true, bankAccount: true, bankAccountType: true, bankBranch: true },
    }),
  ]);

  const availableRands = summary.availableCents / 100;

  return (
    <div className="space-y-6">
      {/* ─── Header ───────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="size-5 text-brand-600" /> Wallet & Settlement Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Auditable record of order earnings, marketplace commission deductions, and South African EFT payouts.
        </p>
      </div>

      {/* ─── Balance Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card p-4 border-l-4 border-l-emerald-500">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <CheckCircle className="size-3.5 text-emerald-600" /> Available for Payout
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{formatRand(summary.availableCents)}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Cleared funds ready to withdraw</p>
        </div>

        <div className="card p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Clock className="size-3.5 text-amber-600" /> Pending Clearance
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{formatRand(summary.pendingClearanceCents)}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">7-day buyer returns reserve</p>
        </div>

        <div className="card p-4 border-l-4 border-l-navy-800">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <TrendingUp className="size-3.5 text-navy-700" /> Total Sales to Date
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatRand(summary.totalGrossCents)}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Gross order revenue</p>
        </div>

        <div className="card p-4 border-l-4 border-l-slate-400">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <Receipt className="size-3.5 text-slate-600" /> Settled to Bank
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatRand(summary.totalPaidOutCents)}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">Transferred via EFT</p>
        </div>
      </div>

      {/* ─── Payout & Banking Configuration ───────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-5">
        <div className="card p-5 md:col-span-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Building2 className="size-4 text-slate-700" /> South African Banking Details
          </h2>
          <BankingForm
            initialBank={fullSeller?.bankName}
            initialAccount={fullSeller?.bankAccount}
            initialType={fullSeller?.bankAccountType}
            initialBranch={fullSeller?.bankBranch}
          />
        </div>

        <div className="card p-5 md:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <ArrowUpRight className="size-4 text-brand-600" /> Request Payout
          </h2>
          {fullSeller?.bankName && fullSeller?.bankAccount ? (
            <PayoutRequestForm maxAvailableRands={availableRands} />
          ) : (
            <div className="rounded-lg bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
              <span>Please save your bank details first before requesting an EFT payout.</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Payout Requests Table ────────────────────────────────────────── */}
      {summary.payouts.length > 0 && (
        <section className="card p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Payout Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2">Reference</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Bank</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.payouts.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-mono font-medium">{po.reference}</td>
                    <td className="py-2.5 text-slate-600">
                      {po.requestedAt.toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
                    </td>
                    <td className="py-2.5 text-slate-700">
                      {po.bankName} (···{po.accountNumber.slice(-4)})
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{formatRand(po.amountCents)}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          po.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : po.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── Transaction Ledger History ────────────────────────────────────── */}
      <section className="card p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Transaction Ledger History</h2>
        {summary.transactions.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No financial transactions recorded yet. Once your parts are purchased and paid for, your credits will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2">Reference</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-mono font-medium">{tx.reference}</td>
                    <td className="py-2.5 text-slate-600">
                      {tx.createdAt.toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' })}
                    </td>
                    <td className="py-2.5 text-slate-700 max-w-xs truncate">{tx.description}</td>
                    <td
                      className={`py-2.5 text-right font-bold ${
                        tx.type === 'ORDER_CREDIT'
                          ? 'text-emerald-700'
                          : tx.type === 'COMMISSION_DEBIT'
                          ? 'text-slate-500'
                          : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'ORDER_CREDIT' ? `+${formatRand(tx.amountCents)}` : `-${formatRand(tx.amountCents)}`}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          tx.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'PENDING_CLEARANCE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tx.status === 'PENDING_CLEARANCE' ? 'Pending (7d)' : tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
