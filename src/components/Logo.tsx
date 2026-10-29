import Link from 'next/link';

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="WHATPART home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--theme-brand-500, #ffb81c)" />
        <path d="M16 7.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" fill="var(--theme-navy-900, #063826)" />
        <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="var(--theme-navy-900, #063826)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className={`text-xl font-black tracking-tight ${dark ? 'text-navy-900' : 'text-white'}`}>
        WHAT<span className="text-brand-500">PART</span>
      </span>
    </Link>
  );
}
