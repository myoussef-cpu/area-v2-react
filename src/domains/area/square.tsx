import { useState } from 'react';
import { Square, Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function SquareTool({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const { formatArea } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const side = parseFloat(inputs['side'] || '0');
    if (side <= 0) return;
    const area = Geometry.squareArea(side);
    const perimeter = 4 * side;
    const diagonal = side * Math.SQRT2;
    setResult({
      value: formatArea(area),
      details: `المساحة = ${side}² = ${toFixed(area)} م²\nالمحيط = 4 × ${side} = ${toFixed(perimeter)} م\nالقطر = ${side}√2 = ${toFixed(diagonal)} م`,
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'square',
      toolName: 'المربع',
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
            <rect x="20" y="20" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="20" y1="100" x2="100" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-yellow-500" />
            <text x="30" y="28" fontSize="10" fill="currentColor">ضلع</text>
          </svg>
        </div>
        <Input label="طول الضلع" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['side'] || ''} onChange={(e) => handleInput('side', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
