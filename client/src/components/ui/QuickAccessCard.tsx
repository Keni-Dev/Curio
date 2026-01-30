/**
 * QuickAccessCard Component
 *
 * Reusable card for quick access features on the home screen.
 * Styled with glass morphism, following design system:
 * - 44px minimum touch target
 * - Rounded-2xl corners
 * - Hover/active states
 * - Icon + title + description layout
 */

import type React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '~lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface QuickAccessCardProps {
  /** Material symbol icon name */
  icon: string;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Navigation path when clicked */
  to?: string;
  /** Click handler (alternative to navigation) */
  onClick?: () => void;
  /** Icon background color class */
  iconBgClass?: string;
  /** Icon color class */
  iconColorClass?: string;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
  icon,
  title,
  description,
  to,
  onClick,
  iconBgClass = 'bg-primary/10',
  iconColorClass = 'text-primary',
  className,
}) => {
  const content = (
    <>
      {/* Icon Container */}
      <div
        className={cn(
          'size-14 rounded-2xl flex items-center justify-center shrink-0',
          iconBgClass
        )}
      >
        <span
          className={cn(
            'material-symbols-outlined text-[28px]',
            iconColorClass
          )}
        >
          {icon}
        </span>
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-base text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Arrow Indicator */}
      <span className="material-symbols-outlined text-slate-400 text-xl shrink-0">
        chevron_right
      </span>
    </>
  );

  const baseClasses = cn(
    'flex items-center gap-4 p-4',
    'bg-white/80 dark:bg-surface-dark/80 rounded-2xl',
    'border border-white/15 dark:border-white/10',
    'shadow-[0_4px_16px_0_rgba(31,38,135,0.06)]',
    'transition-all duration-200',
    'hover:bg-white dark:hover:bg-surface-dark hover:shadow-md',
    'active:scale-[0.98]',
    'min-h-[76px]', // Ensures 44px+ touch target with padding
    className
  );

  // Render as Link if 'to' prop is provided, otherwise as button
  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cn(baseClasses, 'w-full text-left')}>
      {content}
    </button>
  );
};

export default QuickAccessCard;
