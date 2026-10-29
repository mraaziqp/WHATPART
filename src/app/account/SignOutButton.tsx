'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
      }}
      className="btn-outline"
    >
      <LogOut className="size-4" /> Sign out
    </button>
  );
}
