import type { Metadata } from 'next';
import { InfoPageView } from '../InfoContent';

export const metadata: Metadata = { title: 'Contact us', alternates: { canonical: '/contact' } };

export default function Page() {
  return <InfoPageView page="contact" />;
}
