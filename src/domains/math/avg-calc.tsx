import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

export default function AvgCalc({ onSave }: ToolProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const nums = useMemo(() => {
    return input
      .split(/[،,\s\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n));
  }, [input]);

  const calculate = () => {
    if (nums.length === 0) return;

    const sorted = [...nums].sort((a, b) => a - b);
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;
    const count = nums.length;

    let median: number;
    if (count % 2 === 0) {
      median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
    } else {
      median = sorted[Math.floor(count / 2)];
    }

    const freq = new Map<number, number>();
    nums.forEach((n) => freq.set(n, (freq.get(n) || 0) + 1));
    let maxFreq = 0;
    const modes: number[] = [];
    freq.forEach((f, n) => {
      if (f > maxFreq) { maxFreq = f; modes.length = 0; modes.push(n); }
      else if (f === maxFreq) modes.push(n);
    });
    const modeStr = maxFreq > 1 ? modes.join(', ') : 'لا يوجد';

    const range = sorted[count - 1] - sorted[0];
    const min = sorted[0];
    const max = sorted[count - 1];

    const details = `العدد الإجمالي: ${count}
المجموع: ${sum.toFixed(2)}
المتوسط الحسابي: ${mean.toFixed(4)}
الوسيط: ${median.toFixed(4)}
المنوال: ${modeStr}
المدى: ${range.toFixed(2)}
الأصغر: ${min}
الأكبر: ${max}`;

    setResult({ value: mean.toFixed(4), details });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'avg-calc',
      toolName: 'المتوسط الحسابي',
      inputs: { count: nums.length },
      result: result.value,
      details: result.details,
      unit: '',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">الأرقام (مفصولة بفواصل)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثال: 5, 10, 15, 20"
            className="w-full rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-right text-sm backdrop-blur-md transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
            rows={4}
            dir="rtl"
          />
        </div>
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {nums.length > 0 && (
        <div className="rounded-2xl border border-black/5 bg-white/70 px-4 py-2 text-sm text-[#8e8e93] dark:border-white/10 dark:bg-white/5 dark:text-white/60">
          تم إدخال {nums.length} رقم
        </div>
      )}
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
