import { useState } from 'react';
import { Sigma } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

export default function Quadratic({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const a = parseFloat(inputs['a'] || '0');
    const b = parseFloat(inputs['b'] || '0');
    const c = parseFloat(inputs['c'] || '0');

    if (a === 0) {
      setResult({ value: 'المعامل a لا يمكن أن يكون صفراً', details: '' });
      return;
    }

    const d = b * b - 4 * a * c;
    let roots: string;
    let details = `المعادلة: ${a}x² + ${b}x + ${c} = 0\nالمميز (Δ) = b² - 4ac = ${b}² - 4×${a}×${c} = ${d.toFixed(2)}\n`;

    if (d > 0) {
      const x1 = (-b + Math.sqrt(d)) / (2 * a);
      const x2 = (-b - Math.sqrt(d)) / (2 * a);
      roots = `x₁ = ${x1.toFixed(3)}, x₂ = ${x2.toFixed(3)}`;
      details += `جذران حقيقيان مختلفان\nx₁ = (-b + √Δ) / 2a = ${(-b + Math.sqrt(d)).toFixed(3)} / ${(2 * a).toFixed(3)} = ${x1.toFixed(3)}\nx₂ = (-b - √Δ) / 2a = ${(-b - Math.sqrt(d)).toFixed(3)} / ${(2 * a).toFixed(3)} = ${x2.toFixed(3)}`;
    } else if (d === 0) {
      const x = -b / (2 * a);
      roots = `x = ${x.toFixed(3)} (جذر مكرر)`;
      details += `جذر حقيقي مكرر\nx = -b / 2a = ${-b} / ${(2 * a).toFixed(3)} = ${x.toFixed(3)}`;
    } else {
      const re = (-b / (2 * a)).toFixed(3);
      const im = (Math.sqrt(Math.abs(d)) / (2 * a)).toFixed(3);
      roots = `جذور تخيلية`;
      details += `جذران تخيليان\nx₁ = ${re} + ${im}i\nx₂ = ${re} - ${im}i`;
    }

    setResult({ value: roots, details });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'quadratic',
      toolName: 'المعادلة التربيعية',
      inputs: { a: parseFloat(inputs['a'] || '0'), b: parseFloat(inputs['b'] || '0'), c: parseFloat(inputs['c'] || '0') },
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
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">المعامل a</label>
          <Input type="number" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} placeholder="a" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">المعامل b</label>
          <Input type="number" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} placeholder="b" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">المعامل c</label>
          <Input type="number" value={inputs['c'] || ''} onChange={(e) => handleInput('c', e.target.value)} placeholder="c" />
        </div>
        <Button onClick={calculate} className="w-full mt-4">حساب الجذور</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Sigma className="h-5 w-5" />} />
      )}
    </div>
  );
}
