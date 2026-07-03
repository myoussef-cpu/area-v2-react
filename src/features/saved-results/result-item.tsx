import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Camera, Clock } from 'lucide-react';
import type { CalculationResult } from '../../shared/types';
import { Button } from '../../shared/ui/button';
import { cn } from '../../shared/lib/cn';

interface ResultItemProps {
  result: CalculationResult;
  deleting?: boolean;
  onDelete: (id: string) => void;
  onExport?: (id: string) => void;
}



export function ResultItem({ result, deleting, onDelete, onExport }: ResultItemProps) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(result.timestamp);
  const dateStr = date.toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm backdrop-blur-md transition-all',
        'dark:border-white/10 dark:bg-[rgba(28,28,30,0.6)]',
        deleting && 'animate-result-exit'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">{result.toolName}</h3>
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] text-[#8e8e93] dark:bg-white/10">
              {result.unit}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-[#8e8e93]">
            <Clock className="h-3 w-3" />
            {dateStr}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onExport && (
            <Button variant="ghost" size="icon" onClick={() => onExport(result.id)}>
              <Camera className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onDelete(result.id)} disabled={deleting}>
            <Trash2 className={cn('h-4 w-4', deleting ? 'text-[#8e8e93]' : 'text-red-500')} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="mt-2 text-left text-xl font-bold dark:text-white" dir="ltr">
        {result.result}
      </div>

      {expanded && (
        <div className="mt-3 space-y-1.5 border-t border-black/5 pt-3 dark:border-white/10">
          {Object.entries(result.inputs).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-[#8e8e93]">{key}</span>
              <span className="font-semibold">{String(val)}</span>
            </div>
          ))}
          {result.details && (
            <div className="pt-1 text-xs text-[#8e8e93]">{result.details}</div>
          )}
        </div>
      )}
    </div>
  );
}
