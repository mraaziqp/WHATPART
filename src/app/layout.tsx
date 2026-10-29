import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/header/Header';
import { Footer } from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whatpart.africa';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'WHATPART – Car parts that fit, delivered across South Africa', template: '%s | WHATPART' },
  description:
    'Shop brake pads, filters, batteries, suspension and more for your exact vehicle. Compare sellers, check fitment, and get parts delivered anywhere in South Africa.',
  openGraph: { type: 'website', siteName: 'WHATPART', locale: 'en_ZA' },
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = { themeColor: '#0b2545' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
