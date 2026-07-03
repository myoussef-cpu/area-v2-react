import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function Select({ label, error, icon, options, value, onChange, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (btnRef.current?.contains(e.target as Node)) return;
    if (menuRef.current?.contains(e.target as Node)) return;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  const toggleMenu = () => {
    if (open) { setOpen(false); return; }
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 4, left: r.left, width: r.width });
    setOpen(true);
  };

  const selected = options.find((o) => o.value === value);

  return (
    <div className="mb-4 text-right">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-[#1c1c1e] dark:text-white">
          {icon && <span className="ml-2 text-primary">{icon}</span>}
          {label}
        </label>
      )}
      <button
        ref={btnRef}
        type="button"
        onClick={toggleMenu}
        className={cn(
          'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all',
          'border-black/5 bg-white/70 backdrop-blur-md',
          'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10',
          'dark:border-white/10 dark:bg-white/5 dark:text-white',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
        )}
      >
        <span className={cn(selected ? '' : 'text-[#8e8e93]')}>
          {selected ? selected.label : placeholder || 'اختر...'}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-[#8e8e93] transition-transform', open && 'rotate-180')} />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: menuPos.width, zIndex: 9999 }}
          className="overflow-hidden rounded-2xl border py-1 shadow-xl backdrop-blur-2xl border-black/5 bg-white/95 dark:border-white/10 dark:bg-[rgba(28,28,30,0.98)]"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange?.(opt.value); setOpen(false); }}
              className={cn(
                'flex w-full px-4 py-2.5 text-right text-sm transition-colors',
                opt.value === value
                  ? 'bg-primary/10 font-bold text-primary'
                  : 'text-[#1c1c1e] hover:bg-black/5 dark:text-white dark:hover:bg-white/10',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
