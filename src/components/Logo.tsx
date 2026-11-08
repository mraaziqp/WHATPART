import Link from 'next/link';

export interface LogoProps {
  dark?: boolean;
  variant?: 'white' | 'dark' | 'gold' | 'custom';
  height?: number;
  compact?: boolean;
  markOnly?: boolean;
  customUrl?: string;
  className?: string;
  href?: string;
}

export function Logo({
  dark = false,
  variant,
  height = 44,
  compact = false,
  markOnly = false,
  customUrl,
  className = '',
  href = '/',
}: LogoProps) {
  // Determine effective variant: if dark background (header/footer/dark mode), default to white
  const effectiveVariant = variant ?? (dark ? 'dark' : 'white');

  let src = '/logo-white.png';
  if (customUrl && effectiveVariant === 'custom') {
    src = customUrl;
  } else if (markOnly) {
    src =
      effectiveVariant === 'dark'
        ? '/logo-mark-dark.png'
        : effectiveVariant === 'gold'
        ? '/logo-mark-gold.png'
        : '/logo-mark-white.png';
  } else if (compact) {
    src =
      effectiveVariant === 'dark'
        ? '/logo-compact-dark.png'
        : effectiveVariant === 'gold'
        ? '/logo-compact-gold.png'
        : '/logo-compact-white.png';
  } else {
    src =
      effectiveVariant === 'dark'
        ? '/logo-dark.png'
        : effectiveVariant === 'gold'
        ? '/logo-gold.png'
        : '/logo-white.png';
  }

  // Calculate width based on aspect ratios
  // Full: 825 x 317 (~2.60)
  // Compact: 825 x 290 (~2.84)
  // Mark: 825 x 225 (~3.66)
  const ratio = markOnly ? 3.66 : compact ? 2.84 : 2.60;
  const width = Math.round(height * ratio);

  return (
    <Link
      href={href}
      className={`inline-flex shrink-0 items-center transition-all duration-200 hover:opacity-90 active:scale-[0.99] ${className}`}
      aria-label="WHATPART - Quality Auto Parts, to keep you in motion"
    >
      <img
        src={src}
        alt="WHATPART - Quality Auto Parts, to keep you in motion"
        width={width}
        height={height}
        style={{ height: `${height}px`, width: 'auto' }}
        className="block max-h-16 object-contain"
        loading="eager"
        decoding="async"
      />
    </Link>
  );
}
