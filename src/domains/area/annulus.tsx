import { useState } from 'react';
import { Circle, Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { AnnulusSVG } from '../../shared/lib/shapes';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { useShapeCapture } from '../../shared/hooks/use-shape-capture';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function Annulus({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatArea } = useUnits();
  const { shapeRef, capture } = useShapeCapture();

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
    const __v = formatArea(area);
    const __d = `المساحة = π(${R}² − ${r}²) = ${toFixed(area)} م²\nمحيط الخارجي = ${toFixed(outerCirc)} م\nمحيط الداخلي = ${toFixed(innerCirc)} م`;
    setResult({ value: __v, details: __d, rawValue: area });
    usePendingSave.getState().set({
      toolId: 'annulus',
      toolName: 'الحلقة الدائرية',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: __v,
      details: __d,
      unit: 'م²',
      image: capture(),
      timestamp: Date.now(),
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
      image: capture(),
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div ref={shapeRef} className="mb-4 flex justify-center">
          <AnnulusSVG R={parseFloat(inputs['R'] || '8') || 8} r={parseFloat(inputs['r'] || '4') || 4} />
        </div>
        <Input label="نصف القطر الخارجي (R)" placeholder="مثلاً 8" icon={<Circle className="h-4 w-4" />} suffix="م" value={inputs['R'] || ''} onChange={(e) => handleInput('R', e.target.value)} />
        <Input label="نصف القطر الداخلي (r)" placeholder="مثلاً 4" icon={<Circle className="h-4 w-4" />} suffix="م" value={inputs['r'] || ''} onChange={(e) => handleInput('r', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="area" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
