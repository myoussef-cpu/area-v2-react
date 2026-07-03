import { cn } from '../lib/cn';
import { forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, icon, options, ...props }, ref) => (
    <div className="mb-4 text-right">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-[#1c1c1e] dark:text-white">
          {icon && <span className="ml-2 text-primary">{icon}</span>}
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full rounded-xl border border-black/5 bg-black/3 px-4 py-3.5 text-base transition-all appearance-none',
            'focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 focus:outline-none',
            'dark:border-white/10 dark:bg-white/5 dark:text-white',
            'dark:focus:border-primary dark:focus:bg-white/10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
            className
          )}
          dir="rtl"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
