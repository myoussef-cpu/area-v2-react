import { useState, useCallback } from 'react';
import { Scan, Loader2 } from 'lucide-react';
import { ImageCapture } from './image-capture';
import { ScanResultCard } from './scan-result';
import { analyzeImage } from './vision-service';
import { parseVisionResponse } from './tool-matcher';
import type { ScanResult } from './scan-types';

export default function ScanPage() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageCapture = useCallback((dataUrl: string) => {
    setImageDataUrl(dataUrl);
    setResult(null);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageDataUrl) return;
    setAnalyzing(true);
    setError(null);
    try {
      const raw = await analyzeImage(imageDataUrl);
      const parsed = parseVisionResponse(raw);
      if (parsed) {
        setResult(parsed);
      } else {
        setError('لم يتم التعرف على شكل أو أبعاد في الصورة. حاول صورة أوضح.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في التحليل');
    } finally {
      setAnalyzing(false);
    }
  }, [imageDataUrl]);

  const handleReset = useCallback(() => {
    setImageDataUrl(null);
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div className="text-center">
        <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
          <Scan className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          الماسح الهندسي
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          صوّر أو ارفع رسمة هندسية لاستخراج الأبعاد والحسابات تلقائياً
        </p>
      </div>

      {!result && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <ImageCapture onImageCapture={handleImageCapture} disabled={analyzing} />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {imageDataUrl && !result && !analyzing && (
        <button
          onClick={handleAnalyze}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Scan className="h-4 w-4" />
          تحليل الصورة
        </button>
      )}

      {analyzing && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">جاري تحليل الصورة...</p>
        </div>
      )}

      {result && (
        <ScanResultCard result={result} onReset={handleReset} />
      )}
    </div>
  );
}
