import { useState } from 'react';
import { Diamond, Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { RhombusSVG } from '../../shared/lib/shapes';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { useShapeCapture } from '../../shared/hooks/use-shape-capture';
import type { ToolProps, CalculationData } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

export default function Rhombus({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatArea } = useUnits();
  const { shapeRef, capture } = useShapeCapture();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const d1 = parseFloat(inputs['d1'] || '0');
    const d2 = parseFloat(inputs['d2'] || '0');
    if (d1 <= 0 || d2 <= 0) return;
    const area = Geometry.rhombusArea(d1, d2);
    const side = Math.sqrt((d1 / 2) * (d1 / 2) + (d2 / 2) * (d2 / 2));
    const perimeter = 4 * side;
    const __v = formatArea(area);
    const __d = `المساحة = ½ × ${d1} × ${d2} = ${toFixed(area)} م²\nطول الضلع = √((${d1}/2)² + (${d2}/2)²) = ${toFixed(side)} م\nالمحيط = 4 × ${toFixed(side)} = ${toFixed(perimeter)} م`;
    setResult({ value: __v, details: __d, rawValue: area });
    usePendingSave.getState().set({
      toolId: 'rhombus',
      toolName: 'المعين',
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
      toolId: 'rhombus',
      toolName: 'المعين',
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
          <RhombusSVG d1={parseFloat(inputs['d1'] || '8') || 8} d2={parseFloat(inputs['d2'] || '6') || 6} />
        </div>
        <Input label="القطر الأول (d₁)" placeholder="مثلاً 8" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['d1'] || ''} onChange={(e) => handleInput('d1', e.target.value)} />
        <Input label="القطر الثاني (d₂)" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['d2'] || ''} onChange={(e) => handleInput('d2', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="area" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
