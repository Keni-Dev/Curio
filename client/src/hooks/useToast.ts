/**
 * useToast Hook
 *
 * Hook for managing toast notifications.
 * Separated from Toast component for Fast Refresh compatibility.
 */

import { useState, useCallback } from 'react';
import type { ToastProps } from '@/components/ui/Toast';

// =============================================================================
// TYPES
// =============================================================================

export interface UseToastReturn {
  toasts: ToastProps[];
  showToast: (
    message: string,
    options?: Partial<Omit<ToastProps, 'id' | 'message'>>
  ) => string;
  hideToast: (id: string) => void;
  clearAll: () => void;
}

// =============================================================================
// HOOK
// =============================================================================

let toastIdCounter = 0;

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = useCallback(
    (
      message: string,
      options?: Partial<Omit<ToastProps, 'id' | 'message'>>
    ): string => {
      const id = `toast-${++toastIdCounter}`;
      const newToast: ToastProps = {
        id,
        message,
        variant: options?.variant ?? 'info',
        duration: options?.duration ?? 3000,
        icon: options?.icon,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return { toasts, showToast, hideToast, clearAll };
}

export default useToast;
