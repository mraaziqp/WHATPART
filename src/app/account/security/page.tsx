'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function SecurityPage() {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const next = String(f.get('newPassword'));
    if (next !== String(f.get('confirm'))) return setMsg({ error: 'The new passwords don’t match.' });
    setPending(true);
    const res = await authClient.changePassword({ currentPassword: String(f.get('currentPassword')), newPassword: next, revokeOtherSessions: true });
    setPending(false);
    if (res.error) return setMsg({ error: res.error.message ?? 'Could not change password.' });
    form.reset();
    setMsg({ ok: 'Password changed. Other devices have been signed out.' });
  };

  return (
    <form onSubmit={submit} className="card max-w-md space-y-4 p-6">
      <h2 className="text-lg font-bold">Change password</h2>
      <div>
        <label htmlFor="currentPassword" className="label">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" required autoComplete="current-password" className="input" />
      </div>
      <div>
        <label htmlFor="newPassword" className="label">New password</label>
        <input id="newPassword" name="newPassword" type="password" required minLength={8} autoComplete="new-password" className="input" />
        <p className="mt-1 text-xs text-slate-500">At least 8 characters. A short phrase is easier to remember and harder to guess.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="label">Confirm new password</label>
        <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input" />
      </div>
      {msg.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{msg.error}</p>}
      {msg.ok && <p className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"><Check className="size-4" /> {msg.ok}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full">{pending && <Loader2 className="size-4 animate-spin" />} Change password</button>
    </form>
  );
}
