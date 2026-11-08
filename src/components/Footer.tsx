import Link from 'next/link';
import { Lock, RotateCcw, ShieldCheck, Truck, Phone, MessageSquare, Mail } from 'lucide-react';
import { Logo } from './Logo';
import { COMPANY } from '@/data/company';
import { getThemeConfig } from '@/lib/theme';

const PROMISES = [
  { icon: ShieldCheck, title: 'Fitment guarantee', text: 'Wrong part for the vehicle you gave us? Free return and full refund.' },
  { icon: Truck, title: 'Nationwide delivery', text: 'Door-to-door or Pargo pickup. Free over R1,500.' },
  { icon: RotateCcw, title: '7-day returns', text: 'Change your mind on unused parts within 7 days.' },
  { icon: Lock, title: 'Secure payment', text: 'Pay safely online. We never see or store your card details.' },
];

const LINKS: { title: string; links: [string, string][] }[] = [
  { title: 'Shop', links: [['Daily deals', '/deals'], ['All parts', '/search'], ['Request a part', '/quote']] },
  { title: 'Help', links: [['Track your order', '/track'], ['Contact us', '/contact'], ['Delivery', '/shipping'], ['Returns & refunds', '/returns']] },
  { title: 'Company', links: [['About WHATPART', '/about'], ['Sell on WHATPART', '/sell'], ['Terms & conditions', '/terms'], ['Privacy policy', '/privacy']] },
];

export async function Footer() {
  const theme = await getThemeConfig();
  const email = theme.supportEmail || COMPANY.email;
  const phone = theme.supportPhone || COMPANY.phone;
  const whatsapp = theme.supportWhatsapp || COMPANY.whatsapp;

  return (
    <footer className="mt-16 bg-navy-950 text-white/80 transition-colors duration-300">
      <div className="border-b border-white/10">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon className="size-6 shrink-0 text-brand-400" />
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-sm text-white/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo
            variant={theme.logoVariant === 'dark' ? 'dark' : 'white'}
            height={Math.min(theme.logoHeight, 52)}
            compact={theme.logoCompact}
            customUrl={theme.customLogoUrl}
          />
          <p className="mt-3 max-w-sm text-sm text-white/70">
            {theme.siteTagline || 'Quality Auto Parts, to keep you in motion.'} South Africa’s marketplace for verified vehicle spares.
          </p>
          <div className="mt-4 flex flex-col gap-1.5 text-xs text-white/80">
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-white">
                <Mail className="size-3.5 text-brand-400" /> {email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 hover:text-white">
                <Phone className="size-3.5 text-brand-400" /> {phone}
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-white text-emerald-400"
              >
                <MessageSquare className="size-3.5" /> WhatsApp Support ({whatsapp})
              </a>
            )}
          </div>
        </div>
        {LINKS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map(([label, href]) => (
                <li key={href}><Link href={href} className="text-white/60 hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.legalName}
            {COMPANY.registrationNumber && <> · Reg. {COMPANY.registrationNumber}</>}
            {COMPANY.vatNumber && <> · VAT {COMPANY.vatNumber}</>}
          </p>
          <p>{COMPANY.physicalAddress}</p>
        </div>
      </div>
    </footer>
  );
}
