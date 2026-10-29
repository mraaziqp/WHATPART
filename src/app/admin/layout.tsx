import Link from 'next/link';
import { requireAdminPage } from '@/lib/guards';

export const metadata = { title: 'Admin', robots: { index: false } };

const NAV = [
  ['/admin', 'Overview'],
  ['/admin/orders', 'Orders'],
  ['/admin/sellers', 'Sellers'],
  ['/admin/deals', 'Deals'],
  ['/admin/requests', 'Part requests'],
  ['/admin/appearance', '🎨 Appearance & Looks'],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <div className="container-page py-6">
      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <h1 className="text-2xl font-bold">Admin</h1>
        <nav className="flex gap-1 overflow-x-auto" aria-label="Admin">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white">{label}</Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
