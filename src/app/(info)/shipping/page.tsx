import type { Metadata } from 'next';
import { InfoPageView } from '../InfoContent';

export const metadata: Metadata = { title: 'Delivery Policy', alternates: { canonical: '/shipping' } };

export default function Page() {
  return <InfoPageView page="shipping" />;
}
