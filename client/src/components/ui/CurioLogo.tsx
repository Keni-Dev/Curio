/**
 * CurioLogo Component
 * 
 * The official Curio brand logo - a geometric cross/plus shape
 * representing health and community connection.
 * 
 * Used in headers, PWA icons, and branding.
 */

import { cn } from '~lib/utils';

interface CurioLogoProps {
  /** Size in pixels or Tailwind size class */
  size?: number | string;
  /** Additional CSS classes */
  className?: string;
  /** Color variant */
  variant?: 'primary' | 'white' | 'dark';
}

export function CurioLogo({ 
  size = 32, 
  className,
  variant = 'primary' 
}: CurioLogoProps) {
  const colorClass = {
    primary: 'text-primary',
    white: 'text-white',
    dark: 'text-slate-900',
  }[variant];

  const sizeStyle = typeof size === 'number' 
    ? { width: size, height: size } 
    : undefined;

  const sizeClass = typeof size === 'string' ? size : undefined;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(colorClass, sizeClass, className)}
      style={sizeStyle}
      aria-label="Curio Logo"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Full Curio branding with logo + wordmark
 */
interface CurioBrandProps {
  /** Logo size in pixels */
  logoSize?: number;
  /** Show the wordmark text */
  showWordmark?: boolean;
  /** Additional CSS classes for container */
  className?: string;
  /** Color variant */
  variant?: 'primary' | 'white' | 'dark';
}

export function CurioBrand({
  logoSize = 32,
  showWordmark = true,
  className,
  variant = 'primary',
}: CurioBrandProps) {
  const textColorClass = {
    primary: 'text-primary',
    white: 'text-white',
    dark: 'text-slate-900',
  }[variant];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <CurioLogo size={logoSize} variant={variant} />
      {showWordmark && (
        <span className={cn('text-xl font-bold tracking-tight', textColorClass)}>
          Curio
        </span>
      )}
    </div>
  );
}

export default CurioLogo;
