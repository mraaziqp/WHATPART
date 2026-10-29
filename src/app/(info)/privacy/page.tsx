import type { Metadata } from 'next';
import { InfoPageView } from '../InfoContent';

export const metadata: Metadata = { title: 'Privacy Policy', alternates: { canonical: '/privacy' } };

export default function Page() {
  return <InfoPageView page="privacy" />;
}
