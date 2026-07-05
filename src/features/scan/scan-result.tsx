import { ArrowLeft, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import type { ScanResult } from './scan-types';

interface ScanResultCardProps {
  result: ScanResult;
  onReset: () => void;
}

export function ScanResultCard({ result, onReset }: ScanResultCardProps) {
  const navigate = useNavigate();

  const handleOpenTool = () => {
    navigate(`/tool/${result.toolId}`, {
      state: { initialValues: result.inputs },
    });
  };

  const confidenceColor =
    result.confidence >= 0.8 ? 'text-green-600 dark:text-green-400' :
    result.confidence >= 0.5 ? 'text-amber-600 dark:text-amber-400' :
    'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 dark:border-green-900/40 dark:bg-green-950/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            تم التحليل بنجاح
          </span>
          <span className={cn('mr-auto text-xs font-medium', confidenceColor)}>
            دقة {Math.round(result.confidence * 100)}%
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
          {result.toolName}
        </h3>

        {result.summary && (
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
            {result.summary}
          </p>
        )}

        <div className="space-y-2">
          {result.inputSpecs.map((spec) => (
            <div
              key={spec.key}
              className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 dark:bg-zinc-800"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {spec.label}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {spec.value} {spec.unit}
              </span>
            </div>
          ))}
        </div>

        {result.details && (
          <div className="mt-3 rounded-lg bg-gray-100 p-3 dark:bg-zinc-800">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {result.details}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleOpenTool}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium',
            'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800',
            'transition-colors'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          فتح في أداة {result.toolName}
        </button>
        <button
          onClick={onReset}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
            'dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700',
            'transition-colors'
          )}
        >
          <AlertCircle className="h-4 w-4" />
          مسح
        </button>
      </div>
    </div>
  );
}
