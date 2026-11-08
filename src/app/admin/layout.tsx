import Link from 'next/link';
import { requireAdminPage } from '@/lib/guards';
import { Logo } from '@/components/Logo';
import { ExternalLink } from 'lucide-react';

export const metadata = { title: 'Admin', robots: { index: false } };

const NAV = [
  ['/admin', 'Overview'],
  ['/admin/orders', 'Orders'],
  ['/admin/sellers', 'Sellers'],
  ['/admin/deals', 'Deals'],
  ['/admin/requests', 'Part requests'],
  ['/admin/appearance', '🎨 Live Customizer'],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <div className="container-page py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Logo dark height={38} />
          <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-bold text-white tracking-wider uppercase">
            Admin
          </span>
          <nav className="flex gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Admin">
            {NAV.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-white hover:text-slate-900 transition"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <Link
          href="/"
          target="_blank"
          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <ExternalLink className="size-3.5" /> View Live Site
        </Link>
      </div>
      {children}
    </div>
  );
}
