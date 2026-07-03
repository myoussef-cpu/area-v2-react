import { useState } from 'react';
import { Triangle } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

const MODES = [
  { label: 'حساب الوتر (c = √(a² + b²))', value: 'hyp' },
  { label: 'حساب الضلع (a = √(c² - b²))', value: 'leg' },
];

export default function Pythagoras({ onSave }: ToolProps) {
  const [mode, setMode] = useState('hyp');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const a = parseFloat(inputs['a'] || '0');
    const b = parseFloat(inputs['b'] || '0');
    const c = parseFloat(inputs['c'] || '0');

    if (mode === 'hyp') {
      if (!a || !b) return;
      const hyp = Math.sqrt(a * a + b * b);
      setResult({ value: `${hyp.toFixed(3)}`, details: `c = √(a² + b²) = √(${a}² + ${b}²) = √(${(a * a).toFixed(2)} + ${(b * b).toFixed(2)}) = ${hyp.toFixed(3)}` });
    } else {
      if (!c || !b) return;
      if (c <= b) {
        setResult({ value: 'الوتر يجب أن يكون أكبر من الضلع', details: '' });
        return;
      }
      const leg = Math.sqrt(c * c - b * b);
      setResult({ value: `${leg.toFixed(3)}`, details: `a = √(c² - b²) = √(${c}² - ${b}²) = √(${(c * c).toFixed(2)} - ${(b * b).toFixed(2)}) = ${leg.toFixed(3)}` });
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'pythagoras',
      toolName: 'فيثاغورس',
      inputs: { mode: mode === 'hyp' ? 1 : 2, a: parseFloat(inputs['a'] || '0'), b: parseFloat(inputs['b'] || '0'), c: parseFloat(inputs['c'] || '0') },
      result: result.value,
      details: result.details,
      unit: '',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Select label="وضع الحساب" value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); }} options={MODES} />
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">
            {mode === 'hyp' ? 'الضلع الأول (a)' : 'الوتر (c)'}
          </label>
          <Input type="number" value={inputs[mode === 'hyp' ? 'a' : 'c'] || ''} onChange={(e) => handleInput(mode === 'hyp' ? 'a' : 'c', e.target.value)} placeholder="القيمة" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">
            {mode === 'hyp' ? 'الضلع الثاني (b)' : 'الضلع المعلوم (b)'}
          </label>
          <Input type="number" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} placeholder="القيمة" />
        </div>
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Triangle className="h-5 w-5" />} />
      )}
    </div>
  );
}
