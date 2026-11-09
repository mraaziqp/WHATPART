'use client';

import { useActionState, useState } from 'react';
import { Loader2, ArrowUpRight, Building2, CheckCircle2 } from 'lucide-react';
import { updateBankingDetails, requestPayoutAction, type FormState } from '../actions';

export function BankingForm({
  initialBank = '',
  initialAccount = '',
  initialType = 'Current',
  initialBranch = '',
}: {
  initialBank?: string | null;
  initialAccount?: string | null;
  initialType?: string | null;
  initialBranch?: string | null;
}) {
  const [state, action, isPending] = useActionState(updateBankingDetails, {} as FormState);

  return (
    <form action={action} className="space-y-4">
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">{state.error}</p>}
      {state.ok && (
        <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="size-4" /> {state.ok}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="bankName" className="label text-xs">Bank Name</label>
          <input
            id="bankName"
            name="bankName"
            defaultValue={initialBank ?? ''}
            placeholder="e.g. Standard Bank, FNB, ABSA"
            required
            className="input text-xs"
          />
        </div>
        <div>
          <label htmlFor="accountType" className="label text-xs">Account Type</label>
          <select id="accountType" name="accountType" defaultValue={initialType ?? 'Current'} className="select text-xs">
            <option value="Current">Current / Cheque Account</option>
            <option value="Savings">Savings Account</option>
            <option value="Transmission">Transmission Account</option>
          </select>
        </div>
        <div>
          <label htmlFor="accountNumber" className="label text-xs">Account Number</label>
          <input
            id="accountNumber"
            name="accountNumber"
            defaultValue={initialAccount ?? ''}
            placeholder="Account number"
            required
            className="input text-xs font-mono"
          />
        </div>
        <div>
          <label htmlFor="branchCode" className="label text-xs">Branch Code</label>
          <input
            id="branchCode"
            name="branchCode"
            defaultValue={initialBranch ?? ''}
            placeholder="e.g. 250655"
            required
            className="input text-xs font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button disabled={isPending} className="btn-dark text-xs flex items-center gap-1.5">
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          <Building2 className="size-3.5" /> Save Banking Details
        </button>
      </div>
    </form>
  );
}

export function PayoutRequestForm({ maxAvailableRands = 0 }: { maxAvailableRands: number }) {
  const [state, action, isPending] = useActionState(requestPayoutAction, {} as FormState);
  const [amount, setAmount] = useState(maxAvailableRands.toFixed(0));

  return (
    <form action={action} className="space-y-4">
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">{state.error}</p>}
      {state.ok && (
        <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="size-4" /> {state.ok}
        </p>
      )}

      <div>
        <label htmlFor="payoutAmount" className="label text-xs">Payout Amount (ZAR)</label>
        <div className="relative mt-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-slate-500 font-semibold">
            R
          </span>
          <input
            id="payoutAmount"
            name="amount"
            type="number"
            min="100"
            max={maxAvailableRands}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="input pl-8 text-base font-bold text-slate-900"
          />
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Minimum R 100. Available for withdrawal: R {maxAvailableRands.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <button
        disabled={isPending || maxAvailableRands < 100}
        className="btn-primary w-full text-xs flex items-center justify-center gap-1.5"
      >
        {isPending && <Loader2 className="size-3.5 animate-spin" />}
        <ArrowUpRight className="size-3.5" /> Request Bank Payout
      </button>
    </form>
  );
}
