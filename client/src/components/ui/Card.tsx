import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, hoverable = false, padding = 'md', children, ...props },
    ref
  ) => {
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white/80 dark:bg-surface-dark/80 rounded-2xl shadow-card',
          paddings[padding],
          hoverable &&
            'transition-all hover:bg-white dark:hover:bg-surface-dark hover:shadow-md cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
