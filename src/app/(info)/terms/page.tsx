import type { Metadata } from 'next';
import { InfoPageView } from '../InfoContent';

export const metadata: Metadata = { title: 'Terms and Conditions', alternates: { canonical: '/terms' } };

export default function Page() {
  return <InfoPageView page="terms" />;
}
