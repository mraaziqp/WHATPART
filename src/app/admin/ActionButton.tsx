'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import type { ActionResult } from './actions';

type Props = {
  action: (input: string) => Promise<ActionResult>;
  label: string;
  confirm?: string;
  input?: { placeholder: string }; // ask for a value (e.g. payment reference) before running
  variant?: 'primary' | 'outline' | 'danger';
};

export function ActionButton({ action, label, confirm, input, variant = 'outline' }: Props) {
  const [pending, start] = useTransition();
  const [value, setValue] = useState('');
  const [result, setResult] = useState<ActionResult>({});
  const cls = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn bg-red-600 text-white hover:bg-red-700' : 'btn-outline';

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {input && <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={input.placeholder} className="input w-56 py-1.5" />}
      <button
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => setResult(await action(value)));
        }}
        className={`${cls} py-1.5`}
      >
        {pending && <Loader2 className="size-4 animate-spin" />} {label}
      </button>
      {result.error && <span className="text-xs text-red-600">{result.error}</span>}
      {result.ok && <span className="text-xs text-emerald-700">{result.ok}</span>}
    </span>
  );
}
