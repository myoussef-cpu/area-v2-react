import { useState } from 'react';
import { Ruler, Calculator, RectangleHorizontal } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { RectSVG } from '../../shared/lib/shapes';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { useShapeCapture } from '../../shared/hooks/use-shape-capture';
import type { ToolProps, CalculationData } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

export default function RectangleTool({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatArea } = useUnits();
  const { shapeRef, capture } = useShapeCapture();

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
    const __v = formatArea(area);
    const __d = `المساحة = ${w} × ${h} = ${toFixed(area)} م²\nالمحيط = 2(${w} + ${h}) = ${toFixed(perimeter)} م\nالقطر = √(${w}² + ${h}²) = ${toFixed(diagonal)} م`;
    setResult({ value: __v, details: __d, rawValue: area });
    usePendingSave.getState().set({
      toolId: 'rectangle',
      toolName: 'المستطيل',
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
      toolId: 'rectangle',
      toolName: 'المستطيل',
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
          <RectSVG w={parseFloat(inputs['w'] || '8') || 8} h={parseFloat(inputs['h'] || '5') || 5} />
        </div>
        <Input label="العرض" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['w'] || ''} onChange={(e) => handleInput('w', e.target.value)} />
        <Input label="الارتفاع" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['h'] || ''} onChange={(e) => handleInput('h', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="area" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
