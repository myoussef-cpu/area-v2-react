import { useState } from 'react';
import { Circle, Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function Annulus({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const { formatArea } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const R = parseFloat(inputs['R'] || '0');
    const r = parseFloat(inputs['r'] || '0');
    if (R <= 0 || r <= 0 || r >= R) return;
    const area = Geometry.annulusArea(R, r);
    const outerCirc = Geometry.circlePerimeter(R);
    const innerCirc = Geometry.circlePerimeter(r);
    setResult({
      value: formatArea(area),
      details: `المساحة = π(${R}² − ${r}²) = ${toFixed(area)} م²\nمحيط الخارجي = ${toFixed(outerCirc)} م\nمحيط الداخلي = ${toFixed(innerCirc)} م`,
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'annulus',
      toolName: 'الحلقة الدائرية',
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
            <circle cx="60" cy="60" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <circle cx="60" cy="60" r="24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500" />
            <line x1="60" y1="60" x2="108" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3" />
            <line x1="60" y1="60" x2="84" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-yellow-500" />
            <text x="88" y="56" fontSize="9" fill="currentColor">R</text>
            <text x="72" y="56" fontSize="9" fill="currentColor" className="fill-yellow-500">r</text>
          </svg>
        </div>
        <Input label="نصف القطر الخارجي (R)" placeholder="مثلاً 8" icon={<Circle className="h-4 w-4" />} suffix="م" value={inputs['R'] || ''} onChange={(e) => handleInput('R', e.target.value)} />
        <Input label="نصف القطر الداخلي (r)" placeholder="مثلاً 4" icon={<Circle className="h-4 w-4" />} suffix="م" value={inputs['r'] || ''} onChange={(e) => handleInput('r', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
