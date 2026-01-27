import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-body-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-3 rounded-lg border border-slate-200',
              'text-body placeholder:text-text-muted',
              'bg-white dark:bg-surface-dark',
              'focus:border-primary focus:ring-2 focus:ring-primary-light focus:outline-none',
              'transition-colors',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error &&
                'border-danger focus:border-danger focus:ring-danger/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-caption text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
