import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

const MODES = [
  { label: 'تناسب طردي (a:b = c:x)', value: 'direct' },
  { label: 'تناسب عكسي', value: 'inverse' },
  { label: 'تبسيط النسبة', value: 'simplify' },
];

export default function RatioCalc({ onSave }: ToolProps) {
  const [mode, setMode] = useState('direct');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const gcd = (a: number, b: number): number => {
    if (b === 0) return Math.abs(a);
    return gcd(b, a % b);
  };

  const calculate = () => {
    const a = parseFloat(inputs['a'] || '0');
    const b = parseFloat(inputs['b'] || '0');
    const c = parseFloat(inputs['c'] || '0');

    if (mode === 'direct') {
      if (a === 0 || b === 0) return;
      const x = (b * c) / a;
      setResult({ value: `x = ${x.toFixed(4)}`, details: `${a} : ${b} = ${c} : x\nx = (${b} × ${c}) / ${a} = ${x.toFixed(4)}` });
    } else if (mode === 'inverse') {
      if (a === 0 || c === 0) return;
      const x = (a * b) / c;
      setResult({ value: `x = ${x.toFixed(4)}`, details: `تناسب عكسي: a × b = c × x\nx = (${a} × ${b}) / ${c} = ${x.toFixed(4)}` });
    } else {
      if (a === 0 && b === 0) return;
      const g = gcd(a, b);
      const sa = a / g;
      const sb = b / g;
      setResult({ value: `${sa} : ${sb}`, details: `القاسم المشترك الأكبر = ${g}\n${a} : ${b} = ${sa} : ${sb}` });
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'ratio-calc',
      toolName: 'التناسب والنسبة',
      inputs: { mode: mode === 'direct' ? 1 : mode === 'inverse' ? 2 : 3, a: parseFloat(inputs['a'] || '0'), b: parseFloat(inputs['b'] || '0'), c: parseFloat(inputs['c'] || '0') },
      result: result.value,
      details: result.details,
      unit: '',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Select label="نوع العملية" value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); }} options={MODES} />
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">أ</label>
          <Input type="number" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">ب</label>
          <Input type="number" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} />
        </div>
        {mode !== 'simplify' && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">جـ</label>
            <Input type="number" value={inputs['c'] || ''} onChange={(e) => handleInput('c', e.target.value)} />
          </div>
        )}
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
