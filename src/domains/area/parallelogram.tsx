import { useState } from 'react';
import { Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function Parallelogram({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const { formatArea } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const base = parseFloat(inputs['base'] || '0');
    const height = parseFloat(inputs['height'] || '0');
    const side = parseFloat(inputs['side'] || '0');
    if (base <= 0 || height <= 0) return;
    const area = Geometry.parallelogramArea(base, height);
    const perimeter = side > 0 ? 2 * (base + side) : 0;
    const details = [`المساحة = ${base} × ${height} = ${toFixed(area)} م²`];
    if (perimeter > 0) details.push(`المحيط = 2(${base} + ${side}) = ${toFixed(perimeter)} م`);
    setResult({ value: formatArea(area), details: details.join('\n') });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'parallelogram',
      toolName: 'متوازي الأضلاع',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: result.value,
      details: result.details,
      unit: 'م²',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex justify-center">
          <svg viewBox="0 0 160 100" className="h-24 w-full max-w-xs">
            <polygon points="40,15 150,15 120,85 10,85" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="40" y1="15" x2="40" y2="85" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-yellow-500" />
            <text x="42" y="55" fontSize="10" fill="currentColor" className="fill-yellow-500">h</text>
          </svg>
        </div>
        <Input label="طول القاعدة" placeholder="مثلاً 8" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['base'] || ''} onChange={(e) => handleInput('base', e.target.value)} />
        <Input label="الارتفاع" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['height'] || ''} onChange={(e) => handleInput('height', e.target.value)} />
        <Input label="طول الضلع الجانبي" placeholder="مثلاً 6 (اختياري)" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['side'] || ''} onChange={(e) => handleInput('side', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
