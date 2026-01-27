import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20',
      secondary: 'bg-slate-100 text-text-primary hover:bg-slate-200',
      outline:
        'border-2 border-primary text-primary hover:bg-primary/10',
      ghost: 'text-primary hover:bg-primary/10',
      accent:
        'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
