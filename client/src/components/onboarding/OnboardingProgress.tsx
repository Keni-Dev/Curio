/**
 * Onboarding Progress Component
 *
 * Dot-based progress indicator for onboarding slides.
 * Active dot is elongated, supports click navigation.
 *
 * @see DESIGN_SYSTEM.md for design tokens
 */

interface OnboardingProgressProps {
  /** Total number of slides */
  total: number;
  /** Current active slide index (0-based) */
  current: number;
  /** Callback when a dot is clicked */
  onDotClick?: (index: number) => void;
}

export function OnboardingProgress({
  total,
  current,
  onDotClick,
}: OnboardingProgressProps) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="tablist"
      aria-label="Onboarding progress"
    >
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === current;

        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => onDotClick?.(index)}
            style={{
              width: isActive ? '24px' : '8px',
              minWidth: isActive ? '24px' : '8px',
              maxWidth: isActive ? '24px' : '8px',
              height: '8px',
              minHeight: '8px',
              maxHeight: '8px',
              borderRadius: '9999px',
              backgroundColor: isActive ? '#FF7F50' : '#D1D5DB',
              transition: 'all 0.3s ease-out',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#9CA3AF';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#D1D5DB';
              }
            }}
          />
        );
      })}
    </div>
  );
}

export default OnboardingProgress;
