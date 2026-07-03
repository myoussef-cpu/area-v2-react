import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-right text-sm backdrop-blur-md transition-all',
      'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
      'dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';
