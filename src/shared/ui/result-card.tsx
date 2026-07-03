import { Copy, Download, Save, Share2 } from 'lucide-react';
import { cn } from '../lib/cn';
import { Card } from './card';

interface ResultCardProps {
  title: string;
  result: string;
  details?: string;
  icon?: React.ReactNode;
  onSave?: () => void;
  onExport?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  className?: string;
}

export function ResultCard({ title, result, details, icon, onSave, onExport, onCopy, onShare, className }: ResultCardProps) {
  const showActions = onSave || onExport || onCopy || onShare;

  return (
    <Card className={cn('border-r-4 border-r-primary', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#8e8e93]">{title}</h3>
          <p className="mt-1 text-2xl font-bold text-[#1c1c1e] dark:text-white">{result}</p>
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
