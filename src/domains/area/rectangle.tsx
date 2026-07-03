import { useState } from 'react';
import { Ruler, Calculator, RectangleHorizontal } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function RectangleTool({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const { formatArea } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const w = parseFloat(inputs['w'] || '0');
    const h = parseFloat(inputs['h'] || '0');
    if (w <= 0 || h <= 0) return;
    const area = Geometry.rectangleArea(w, h);
    const perimeter = 2 * (w + h);
    const diagonal = Math.sqrt(w * w + h * h);
    setResult({
      value: formatArea(area),
      details: `المساحة = ${w} × ${h} = ${toFixed(area)} م²\nالمحيط = 2(${w} + ${h}) = ${toFixed(perimeter)} م\nالقطر = √(${w}² + ${h}²) = ${toFixed(diagonal)} م`,
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'rectangle',
      toolName: 'المستطيل',
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
          <svg viewBox="0 0 140 100" className="h-24 w-full max-w-xs">
            <rect x="15" y="15" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="15" y1="85" x2="125" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-yellow-500" />
            <text x="22" y="12" fontSize="9" fill="currentColor">العرض</text>
            <text x="132" y="55" fontSize="9" fill="currentColor">الارتفاع</text>
          </svg>
        </div>
        <Input label="العرض" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['w'] || ''} onChange={(e) => handleInput('w', e.target.value)} />
        <Input label="الارتفاع" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['h'] || ''} onChange={(e) => handleInput('h', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
