import { useState } from 'react';
import { Shapes, Ruler, Calculator, Hash } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function RegularPolygon({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const { formatArea } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const n = parseInt(inputs['n'] || '0', 10);
    const side = parseFloat(inputs['side'] || '0');
    if (n < 3 || side <= 0) return;
    const area = Geometry.regularPolygonArea(n, side);
    const perimeter = n * side;
    const apothem = side / (2 * Math.tan(Math.PI / n));
    setResult({
      value: formatArea(area),
      details: `عدد الأضلاع (n) = ${n}\nطول الضلع = ${side} م\nالمساحة = ${toFixed(area)} م²\nالمحيط = ${n} × ${side} = ${toFixed(perimeter)} م\nالقياس (apothem) = ${toFixed(apothem)} م`,
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'regular-polygon',
      toolName: 'المضلعات المنتظمة',
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
          <svg viewBox="0 0 120 120" className="h-28 w-full max-w-xs">
            <polygon points="60,15 98,40 98,80 60,105 22,80 22,40" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
          </svg>
        </div>
        <Input label="عدد الأضلاع (n)" placeholder="مثلاً 6" icon={<Hash className="h-4 w-4" />} value={inputs['n'] || ''} onChange={(e) => handleInput('n', e.target.value)} />
        <Input label="طول الضلع" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['side'] || ''} onChange={(e) => handleInput('side', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
