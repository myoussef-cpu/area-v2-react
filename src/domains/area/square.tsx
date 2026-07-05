import { useState } from 'react';
import { Square, Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { SquareSVG } from '../../shared/lib/shapes';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { useShapeCapture } from '../../shared/hooks/use-shape-capture';
import type { ToolProps, CalculationData } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

export default function SquareTool({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatArea } = useUnits();
  const { shapeRef, capture } = useShapeCapture();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const side = parseFloat(inputs['side'] || '0');
    if (side <= 0) return;
    const area = Geometry.squareArea(side);
    const perimeter = 4 * side;
    const diagonal = side * Math.SQRT2;
    const __v = formatArea(area);
    const __d = `المساحة = ${side}² = ${toFixed(area)} م²\nالمحيط = 4 × ${side} = ${toFixed(perimeter)} م\nالقطر = ${side}√2 = ${toFixed(diagonal)} م`;
    setResult({ value: __v, details: __d, rawValue: area });
    usePendingSave.getState().set({
      toolId: 'square',
      toolName: 'المربع',
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
      toolId: 'square',
      toolName: 'المربع',
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
          <SquareSVG side={parseFloat(inputs['side'] || '5') || 5} />
        </div>
        <Input label="طول الضلع" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['side'] || ''} onChange={(e) => handleInput('side', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="area" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
