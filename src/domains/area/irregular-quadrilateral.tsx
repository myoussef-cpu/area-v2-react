import { useState } from 'react';
import { Ruler, Calculator, VectorSquare } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { toFixed } from '../../shared/lib/geometry';
import { IrregQuadSVG } from '../../shared/lib/shapes';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { useShapeCapture } from '../../shared/hooks/use-shape-capture';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function IrregularQuadrilateral({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatArea } = useUnits();
  const { shapeRef, capture } = useShapeCapture();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const triangleArea = (a: number, b: number, c: number) => {
    const s = (a + b + c) / 2;
    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
  };

  const calculate = () => {
    const a = parseFloat(inputs['a'] || '0');
    const b = parseFloat(inputs['b'] || '0');
    const c = parseFloat(inputs['c'] || '0');
    const d = parseFloat(inputs['d'] || '0');
    const diag = parseFloat(inputs['diag'] || '0');
    if (a <= 0 || b <= 0 || c <= 0 || d <= 0 || diag <= 0) return;
    const area1 = triangleArea(a, b, diag);
    const area2 = triangleArea(c, d, diag);
    if (isNaN(area1) || isNaN(area2)) return;
    const area = area1 + area2;
    const perimeter = a + b + c + d;
    const __v = formatArea(area);
    const __d = `المثلث الأول (a,b,قطر): المساحة = ${toFixed(area1)} م²\nالمثلث الثاني (c,d,قطر): المساحة = ${toFixed(area2)} م²\nالمساحة الكلية = ${toFixed(area)} م²\nالمحيط = ${toFixed(perimeter)} م`;
    setResult({ value: __v, details: __d, rawValue: area });
    usePendingSave.getState().set({
      toolId: 'irregular-quadrilateral',
      toolName: 'الرباعي غير المنتظم',
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
      toolId: 'irregular-quadrilateral',
      toolName: 'الرباعي غير المنتظم',
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
          <IrregQuadSVG
            sides={[
              parseFloat(inputs['a'] || '6') || 6,
              parseFloat(inputs['b'] || '5') || 5,
              parseFloat(inputs['c'] || '7') || 7,
              parseFloat(inputs['d'] || '4') || 4,
            ]}
            diag={parseFloat(inputs['diag'] || '8') || 8}
          />
        </div>
        <Input label="الضلع الأول (a)" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} />
        <Input label="الضلع الثاني (b)" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} />
        <Input label="الضلع الثالث (c)" placeholder="مثلاً 7" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['c'] || ''} onChange={(e) => handleInput('c', e.target.value)} />
        <Input label="الضلع الرابع (d)" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['d'] || ''} onChange={(e) => handleInput('d', e.target.value)} />
        <Input label="طول القطر" placeholder="مثلاً 8" icon={<VectorSquare className="h-4 w-4" />} suffix="م" value={inputs['diag'] || ''} onChange={(e) => handleInput('diag', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="area" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
