/**
 * Onboarding Slide Component
 *
 * Individual slide for the onboarding carousel.
 * Displays a badge, title, description, and optional illustration.
 *
 * @see DESIGN_SYSTEM.md for design tokens
 */

import type { ReactNode } from 'react';
import { cn } from '~lib/utils';

interface OnboardingSlideProps {
  /** Badge text shown above the title */
  badge: string;
  /** Badge icon (Material Symbols name) */
  badgeIcon: string;
  /** Main headline */
  title: string;
  /** Description text */
  description: string;
  /** Optional highlight text in description (will be styled differently) */
  highlightText?: string;
  /** Optional illustration component */
  illustration?: ReactNode;
  /** Whether this slide is currently active */
  isActive?: boolean;
}

export function OnboardingSlide({
  badge,
  badgeIcon,
  title,
  description,
  highlightText,
  illustration,
  isActive = true,
}: OnboardingSlideProps) {
  // Split description to highlight specific text
  const renderDescription = () => {
    if (!highlightText) {
      return description;
    }

    const parts = description.split(highlightText);
    if (parts.length === 1) {
      return description;
    }

    return (
      <>
        {parts[0]}
        <span className="font-semibold text-accent">{highlightText}</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center lg:items-start text-center lg:text-left',
        'transition-opacity duration-300',
        isActive ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Badge */}
      <div
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2',
          'bg-primary/10 rounded-full',
          'mb-6'
        )}
      >
        <span className="material-symbols-outlined text-[18px] text-primary">
          {badgeIcon}
        </span>
        <span className="text-sm font-semibold text-primary uppercase tracking-wide">
          {badge}
        </span>
      </div>

      {/* Title */}
      <h1
        className={cn(
          'font-display text-display-lg lg:text-display-xl',
          'text-text-primary dark:text-white',
          'mb-4 leading-tight'
        )}
      >
        {title}
      </h1>

      {/* Description */}
      <p
        className={cn(
          'font-body text-body-lg',
          'text-text-secondary dark:text-text-secondary-dark',
          'max-w-md',
          'leading-relaxed'
        )}
      >
        {renderDescription()}
      </p>

      {/* Optional Illustration (for mobile - shown below text) */}
      {illustration && (
        <div className="mt-8 lg:hidden w-full max-w-sm">
          {illustration}
        </div>
      )}
    </div>
  );
}

export default OnboardingSlide;
