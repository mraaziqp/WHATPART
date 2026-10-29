import type { Metadata } from 'next';
import { InfoPageView } from '../InfoContent';

export const metadata: Metadata = { title: 'About WHATPART', alternates: { canonical: '/about' } };

export default function Page() {
  return <InfoPageView page="about" />;
}
