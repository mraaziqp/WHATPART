import { Suspense } from 'react';
import { AuthForm } from '../AuthForm';

export const metadata = { title: 'Create account', robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
