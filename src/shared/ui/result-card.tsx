import { Copy, Download, Save, Share2, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/cn';
import { Card } from './card';
import { useUnits } from '../hooks/use-units';
import { AREA_UNITS, VOLUME_UNITS } from '../lib/units';

interface ResultCardProps {
  title: string;
  result: string;
  details?: string;
  rawValue?: number;
  unitType?: 'area' | 'volume';
  icon?: React.ReactNode;
  onSave?: () => void;
  onExport?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  className?: string;
}

const UNIT_GROUPS = {
  area: [
    { id: 'm2', label: 'م²' },
    { id: 'feddan', label: 'فدان' },
    { id: 'ft2', label: 'قدم²' },
    { id: 'acre', label: 'Acre' },
    { id: 'ha', label: 'هكتار' },
  ],
  volume: [
    { id: 'm3', label: 'م³' },
    { id: 'liter', label: 'لتر' },
    { id: 'ft3', label: 'قدم³' },
    { id: 'ml', label: 'mL' },
  ],
};

export function ResultCard({ title, result, details, rawValue, unitType, icon, onSave, onExport, onCopy, onShare, className }: ResultCardProps) {
  const showActions = onSave || onExport || onCopy || onShare;
  const { formatArea, formatVolume, areaUnit, volumeUnit, setAreaUnit, setVolumeUnit } = useUnits();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentUnit = unitType === 'volume' ? volumeUnit : areaUnit;
  const setUnit = unitType === 'volume' ? setVolumeUnit : setAreaUnit;
  const formatFn = unitType === 'volume' ? formatVolume : formatArea;
  const options = UNIT_GROUPS[unitType || 'area'] || [];

  const displayValue = rawValue !== undefined && unitType ? formatFn(rawValue) : result;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <Card className={cn('border-r-4 border-r-primary', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#8e8e93]">{title}</h3>
          <p className="mt-1 text-2xl font-bold text-[#1c1c1e] dark:text-white">{displayValue}</p>
          {unitType && rawValue !== undefined && (
            <div ref={ref} className="relative mt-1.5">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 rounded-lg bg-black/5 px-2.5 py-1 text-[11px] font-medium text-[#8e8e93] transition-colors hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
              >
                {options.find((o) => o.id === currentUnit)?.label || currentUnit}
                <ChevronDown className="h-3 w-3" />
              </button>
              {open && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[90px] overflow-hidden rounded-xl border border-black/10 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#1c1c1e]">
                  {options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setUnit(opt.id); setOpen(false); }}
                      className={cn(
                        'flex w-full items-center px-3 py-1.5 text-xs transition-colors hover:bg-black/5 dark:hover:bg-white/10',
                        currentUnit === opt.id ? 'font-bold text-primary dark:text-[#5ac8fa]' : 'text-[#8e8e93]'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {details && <p className="mt-1 text-sm text-[#8e8e93]">{details}</p>}
        </div>
        {icon && <div className="mr-3 mt-1 text-primary">{icon}</div>}
      </div>
      {showActions && (
        <div className="mt-4 flex gap-2 border-t border-black/5 pt-3 dark:border-white/10">
          {onSave && (
            <button onClick={onSave} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#8e8e93] transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/10">
              <Save className="h-3.5 w-3.5" />
              حفظ
            </button>
          )}
          {onCopy && (
            <button onClick={onCopy} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#8e8e93] transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/10">
              <Copy className="h-3.5 w-3.5" />
              نسخ
            </button>
          )}
          {onExport && (
            <button onClick={onExport} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#8e8e93] transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/10">
              <Download className="h-3.5 w-3.5" />
              تصدير
            </button>
          )}
          {onShare && (
            <button onClick={onShare} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#8e8e93] transition-colors hover:bg-black/5 hover:text-primary dark:hover:bg-white/10">
              <Share2 className="h-3.5 w-3.5" />
              مشاركة
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
