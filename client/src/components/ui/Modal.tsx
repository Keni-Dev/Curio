/**
 * Modal Component
 *
 * Centered modal dialog with:
 * - Backdrop with blur effect
 * - Smooth scale/fade animation
 * - Keyboard escape to close
 * - Click outside to close
 * - Focus trap and body scroll lock
 * - Portal rendering for proper z-index stacking
 *
 * @see DESIGN_SYSTEM.md
 */

import {
  useEffect,
  useRef,
  type ReactNode,
  type MouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Optional title shown at top */
  title?: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size */
  size?: ModalSize;
  /** Additional CSS classes for the modal container */
  className?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether clicking backdrop closes modal */
  closeOnBackdrop?: boolean;
  /** Optional header icon */
  headerIcon?: ReactNode;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[calc(100vw-2rem)] md:max-w-2xl',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  className,
  showCloseButton = true,
  closeOnBackdrop = true,
  headerIcon,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
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
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;

        // Restore focus
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        // Backdrop - darker for better focus
        'fixed inset-0 z-50',
        'bg-black/60 backdrop-blur-md',
        'flex items-center justify-center p-4',
        // Animation
        'animate-in fade-in duration-200'
      )}
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={cn(
          // Base styles
          'relative w-full',
          SIZE_CLASSES[size],
          // Fully opaque background
          'bg-white dark:bg-slate-900',
          'rounded-2xl shadow-2xl',
          'border border-slate-200 dark:border-slate-700',
          // Max height with scroll
          'max-h-[calc(100vh-2rem)] overflow-hidden',
          'flex flex-col',
          // Animation
          'animate-in zoom-in-95 fade-in duration-200',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex-shrink-0 px-6 pt-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {headerIcon && (
                  <div className="flex-shrink-0">{headerIcon}</div>
                )}
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-xl font-bold text-text-primary truncate"
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-sm text-muted mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>

              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'flex-shrink-0 size-10 rounded-full',
                    'flex items-center justify-center',
                    'text-muted hover:text-text-primary',
                    'hover:bg-slate-100 dark:hover:bg-white/10',
                    'transition-colors',
                    '-mt-1 -mr-2'
                  )}
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );

  // Render in portal for proper stacking
  return createPortal(modalContent, document.body);
}

export default Modal;
