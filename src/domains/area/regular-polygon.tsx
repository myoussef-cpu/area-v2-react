import { useState } from 'react';
import { Shapes, Ruler, Calculator, Hash } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { RegPolySVG } from '../../shared/lib/shapes';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { useShapeCapture } from '../../shared/hooks/use-shape-capture';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function RegularPolygon({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatArea } = useUnits();
  const { shapeRef, capture } = useShapeCapture();

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
    const __v = formatArea(area);
    const __d = `عدد الأضلاع (n) = ${n}\nطول الضلع = ${side} م\nالمساحة = ${toFixed(area)} م²\nالمحيط = ${n} × ${side} = ${toFixed(perimeter)} م\nالقياس (apothem) = ${toFixed(apothem)} م`;
    setResult({ value: __v, details: __d, rawValue: area });
    usePendingSave.getState().set({
      toolId: 'regular-polygon',
      toolName: 'المضلعات المنتظمة',
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
      toolId: 'regular-polygon',
      toolName: 'المضلعات المنتظمة',
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
          <RegPolySVG
            n={parseInt(inputs['n'] || '6', 10) || 6}
            r={(() => { const s = parseFloat(inputs['side'] || '0') || 5; const n = parseInt(inputs['n'] || '6', 10) || 6; return s / (2 * Math.sin(Math.PI / n)); })()}
          />
        </div>
        <Input label="عدد الأضلاع (n)" placeholder="مثلاً 6" icon={<Hash className="h-4 w-4" />} value={inputs['n'] || ''} onChange={(e) => handleInput('n', e.target.value)} />
        <Input label="طول الضلع" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['side'] || ''} onChange={(e) => handleInput('side', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="area" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
