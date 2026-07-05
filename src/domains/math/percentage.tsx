import { useState } from 'react';
import { Percent } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';
import { usePendingSave } from '../../shared/store/pending-save-store';

const MODES = [
  { label: 'نسبة مئوية من عدد', value: 'pctOf' },
  { label: 'النسبة المئوية للتغير', value: 'pctChange' },
  { label: 'إيجاد العدد من النسبة', value: 'numberFromPct' },
];

export default function Percentage({ onSave, initialValues }: ToolProps) {
  const [mode, setMode] = useState('pctOf');
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const a = parseFloat(inputs['a'] || '0');
    const b = parseFloat(inputs['b'] || '0');

    if (mode === 'pctOf') {
      const r = (a / 100) * b;
      const __v = `${r.toFixed(2)}`;
      const __d = `${a}% من ${b} = (${a} ÷ 100) × ${b} = ${r.toFixed(2)}`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'percentage',
        toolName: 'النسبة المئوية',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '%',
        timestamp: Date.now(),
      });
    } else if (mode === 'pctChange') {
      if (b === 0) return;
      const r = ((a - b) / b) * 100;
      const sign = r >= 0 ? 'زيادة' : 'نقصان';
      const __v = `${Math.abs(r).toFixed(2)}%`;
      const __d = `التغير = ((${a} - ${b}) ÷ ${b}) × 100 = ${r.toFixed(2)}%\n${sign} بنسبة ${Math.abs(r).toFixed(2)}%`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'percentage',
        toolName: 'النسبة المئوية',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '%',
        timestamp: Date.now(),
      });
    } else {
      const r = (a / b) * 100;
      const __v = `${r.toFixed(2)}`;
      const __d = `${a} تمثل ${b}%\nالعدد الكلي = (${a} ÷ ${b}) × 100 = ${r.toFixed(2)}`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'percentage',
        toolName: 'النسبة المئوية',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '%',
        timestamp: Date.now(),
      });
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'percentage',
      toolName: 'النسبة المئوية',
      inputs: { mode: mode === 'pctOf' ? 1 : mode === 'pctChange' ? 2 : 3, a: parseFloat(inputs['a'] || '0'), b: parseFloat(inputs['b'] || '0') },
      result: result.value,
      details: result.details,
      unit: '%',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Select label="نوع العملية" value={mode} onChange={(e) => { setMode(e); setResult(null); }} options={MODES} />
        <Input label="
            {mode === 'pctOf' ? 'النسبة المئوية' : mode === 'pctChange' ? 'القيمة الجديدة' : 'الجزء'}
          " type="number" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} placeholder="أدخل القيمة" />
        <Input label="
            {mode === 'pctOf' ? 'العدد' : mode === 'pctChange' ? 'القيمة الأصلية' : 'النسبة المئوية'}
          " type="number" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} placeholder="أدخل القيمة" />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Percent className="h-5 w-5" />} />
      )}
    </div>
  );
}
