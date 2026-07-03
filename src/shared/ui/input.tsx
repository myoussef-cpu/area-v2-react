import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, suffix, ...props }, ref) => (
    <div className="mb-4">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-[#1c1c1e] dark:text-white">
          {icon && <span className="ml-2 inline-flex text-primary">{icon}</span>}
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={cn(
            'w-full rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-right text-sm backdrop-blur-md transition-all',
            'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
            'dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40',
            suffix && 'pl-10',
            className
          )}
          {...props}
        />
        {suffix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8e8e93] dark:text-white/50">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
);
Input.displayName = 'Input';
