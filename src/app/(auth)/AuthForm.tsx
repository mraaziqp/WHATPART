'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next')?.startsWith('/') ? params.get('next')! : '/account';
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email'));
    const password = String(f.get('password'));
    setPending(true);
    setError('');
    const res =
      mode === 'login'
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: String(f.get('name')) });
    setPending(false);
    if (res.error) {
      setError(res.error.message ?? 'Something went wrong. Please try again.');
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div className="container-page py-12">
      <form onSubmit={submit} className="card mx-auto max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-bold">{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
        {mode === 'register' && (
          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" name="name" required minLength={2} autoComplete="name" className="input" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="input" />
          {mode === 'register' && <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>}
        </div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full py-3">
          {pending && <Loader2 className="size-4 animate-spin" />} {mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
        <p className="text-center text-sm text-slate-600">
          {mode === 'login' ? (
            <>New to WHATPART? <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-navy-700 hover:underline">Create an account</Link></>
          ) : (
            <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-navy-700 hover:underline">Sign in</Link></>
          )}
        </p>
      </form>
    </div>
  );
}
