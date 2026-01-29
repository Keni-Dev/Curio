/**
 * BottomSheet Component
 *
 * Mobile-friendly bottom sheet/drawer with:
 * - Snap points (peek, half, full)
 * - Drag handle for mobile
 * - Backdrop with click-to-close
 * - Keyboard escape to close
 * - Body scroll lock when open
 * - Smooth slide-up animation
 *
 * @see DESIGN_SYSTEM.md - Bottom Sheet Header section
 */

import {
  useEffect,
  useRef,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type SnapPoint = 'peek' | 'half' | 'full';

interface BottomSheetProps {
  /** Whether the sheet is visible */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional title shown at top */
  title?: string;
  /** Sheet content */
  children: ReactNode;
  /** Available snap points */
  snapPoints?: SnapPoint[];
  /** Initial snap point */
  defaultSnap?: SnapPoint;
  /** Additional CSS classes for the sheet container */
  className?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  peek: '30vh',
  half: '55vh',
  full: '92vh',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  snapPoints: _snapPoints,
  defaultSnap = 'peek',
  className,
  showCloseButton = false,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Lock body scroll when open and manage focus
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Lock body scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      // Focus the sheet for accessibility
      setTimeout(() => {
        sheetRef.current?.focus();
      }, 100);
    } else {
      // Restore body scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);

      // Restore focus to previous element
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = () => {
    onClose();
  };

  // Prevent clicks inside sheet from closing
  const handleSheetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle keyboard interaction on sheet
  const handleSheetKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    // Trap focus within the sheet
    if (e.key === 'Tab') {
      const focusableElements = sheetRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40',
          'bg-black/30 backdrop-blur-[2px]',
          'animate-fade-in'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        tabIndex={-1}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-white dark:bg-surface-dark',
          'rounded-t-[24px]',
          'shadow-float',
          'animate-slide-up',
          'pb-safe',
          'focus:outline-none',
          className
        )}
        style={{ maxHeight: SNAP_HEIGHTS[defaultSnap] }}
        onClick={handleSheetClick}
        onKeyDown={handleSheetKeyDown}
      >
        {/* Drag handle - visible on mobile */}
        <div className="flex justify-center pt-3 pb-2 md:pt-4 md:pb-3">
          <div className="w-10 h-1 md:w-12 md:h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        {/* Header with title and optional close button */}
        {(title || showCloseButton) && (
          <div className="px-4 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            {title && (
              <h2
                id="bottom-sheet-title"
                className="text-lg font-bold text-text-primary dark:text-white"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="size-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                aria-label="Close"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="overflow-y-auto overscroll-contain"
          style={{
            maxHeight: `calc(${SNAP_HEIGHTS[defaultSnap]} - ${title ? '80px' : '40px'})`,
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
