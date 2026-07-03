import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-md',
      'dark:border-white/10 dark:bg-[rgba(28,28,30,0.6)]',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';
