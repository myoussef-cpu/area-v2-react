import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';
import { usePendingSave } from '../../shared/store/pending-save-store';

const MODES = [
  { label: 'تناسب طردي (a:b = c:x)', value: 'direct' },
  { label: 'تناسب عكسي', value: 'inverse' },
  { label: 'تبسيط النسبة', value: 'simplify' },
];

export default function RatioCalc({ onSave, initialValues }: ToolProps) {
  const [mode, setMode] = useState('direct');
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
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
      const __v = `x = ${x.toFixed(4)}`;
      const __d = `${a} : ${b} = ${c} : x\nx = (${b} × ${c}) / ${a} = ${x.toFixed(4)}`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'ratio-calc',
        toolName: 'التناسب والنسبة',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '',
        timestamp: Date.now(),
      });
    } else if (mode === 'inverse') {
      if (a === 0 || c === 0) return;
      const x = (a * b) / c;
      const __v = `x = ${x.toFixed(4)}`;
      const __d = `تناسب عكسي: a × b = c × x\nx = (${a} × ${b}) / ${c} = ${x.toFixed(4)}`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'ratio-calc',
        toolName: 'التناسب والنسبة',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '',
        timestamp: Date.now(),
      });
    } else {
      if (a === 0 && b === 0) return;
      const g = gcd(a, b);
      const sa = a / g;
      const sb = b / g;
      const __v = `${sa} : ${sb}`;
      const __d = `القاسم المشترك الأكبر = ${g}\n${a} : ${b} = ${sa} : ${sb}`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'ratio-calc',
        toolName: 'التناسب والنسبة',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '',
        timestamp: Date.now(),
      });
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
        <Input label="أ" type="number" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} />
        <Input label="ب" type="number" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} />
        {mode !== 'simplify' && (
          <Input label="جـ" type="number" value={inputs['c'] || ''} onChange={(e) => handleInput('c', e.target.value)} />
        )}
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
