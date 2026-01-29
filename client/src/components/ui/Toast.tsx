/**
 * Toast Component
 *
 * Animated notification toast for real-time updates.
 * Auto-dismisses after a configurable duration.
 */

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: (id: string) => void;
  icon?: string;
}

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
  position?: 'top' | 'bottom';
  className?: string;
}

// =============================================================================
// VARIANT CONFIG
// =============================================================================

const variantConfig: Record<
  ToastVariant,
  { bg: string; icon: string; iconColor: string }
> = {
  success: {
    bg: 'bg-emerald-600',
    icon: 'check_circle',
    iconColor: 'text-emerald-100',
  },
  warning: {
    bg: 'bg-amber-500',
    icon: 'warning',
    iconColor: 'text-amber-100',
  },
  error: {
    bg: 'bg-rose-500',
    icon: 'error',
    iconColor: 'text-rose-100',
  },
  info: {
    bg: 'bg-sky-500',
    icon: 'info',
    iconColor: 'text-sky-100',
  },
};

// =============================================================================
// SINGLE TOAST
// =============================================================================

export function Toast({
  id,
  message,
  variant = 'info',
  duration = 3000,
  onClose,
  icon,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const config = variantConfig[variant];

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(id);
    }, 200); // Match animation duration
  }, [id, onClose]);

  // Enter animation
  useEffect(() => {
    // Small delay for enter animation
    const enterTimeout = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(enterTimeout);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (duration <= 0) return;

    const dismissTimeout = setTimeout(handleClose, duration);
    return () => clearTimeout(dismissTimeout);
  }, [duration, handleClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg',
        'max-w-[90vw] min-w-[280px]',
        'transition-all duration-200 ease-out',
        config.bg,
        // Enter/exit animations
        isVisible && !isExiting
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      )}
    >
      {/* Icon */}
      <span className={cn('material-symbols-outlined text-xl', config.iconColor)}>
        {icon || config.icon}
      </span>

      {/* Message */}
      <p className="flex-1 text-sm font-medium text-white">{message}</p>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Isara"
      >
        <span className="material-symbols-outlined text-white/80 text-lg">close</span>
      </button>
    </div>
  );
}

// =============================================================================
// TOAST CONTAINER
// =============================================================================

export function ToastContainer({
  toasts,
  onClose,
  position = 'bottom',
  className,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 p-4',
        'pointer-events-none',
        position === 'top' ? 'top-0 left-0 right-0' : 'bottom-20 left-0 right-0',
        'items-center',
        className
      )}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

export default Toast;
