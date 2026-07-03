import { useState } from 'react';
import { Ruler, Calculator, Plane } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function Kite({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const { formatArea } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const d1 = parseFloat(inputs['d1'] || '0');
    const d2 = parseFloat(inputs['d2'] || '0');
    const a = parseFloat(inputs['a'] || '0');
    const b = parseFloat(inputs['b'] || '0');
    if (d1 <= 0 || d2 <= 0) return;
    const area = Geometry.kiteArea(d1, d2);
    const details: string[] = [`المساحة = ½ × ${d1} × ${d2} = ${toFixed(area)} م²`];
    if (a > 0 && b > 0) {
      const perimeter = 2 * (a + b);
      details.push(`المحيط = 2(${a} + ${b}) = ${toFixed(perimeter)} م`);
    }
    setResult({ value: formatArea(area), details: details.join('\n') });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'kite',
      toolName: 'الطائرة الورقية',
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
          <svg viewBox="0 0 120 140" className="h-28 w-full max-w-xs">
            <polygon points="60,10 105,70 60,130 15,70" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="15" y1="70" x2="105" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-yellow-500" />
            <line x1="60" y1="10" x2="60" y2="130" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-green-500" />
            <text x="48" y="66" fontSize="9" fill="currentColor" className="fill-yellow-500">d₁</text>
            <text x="62" y="30" fontSize="9" fill="currentColor" className="fill-green-500">d₂</text>
          </svg>
        </div>
        <Input label="القطر الأول (d₁)" placeholder="مثلاً 10" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['d1'] || ''} onChange={(e) => handleInput('d1', e.target.value)} />
        <Input label="القطر الثاني (d₂)" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['d2'] || ''} onChange={(e) => handleInput('d2', e.target.value)} />
        <Input label="الضلع الأول (a)" placeholder="اختياري" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} />
        <Input label="الضلع الثاني (b)" placeholder="اختياري" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
