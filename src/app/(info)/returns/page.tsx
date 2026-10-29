import type { Metadata } from 'next';
import { InfoPageView } from '../InfoContent';

export const metadata: Metadata = { title: 'Returns and Refunds Policy', alternates: { canonical: '/returns' } };

export default function Page() {
  return <InfoPageView page="returns" />;
}
