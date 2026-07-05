import { useState } from 'react';
import { Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { ParaSVG } from '../../shared/lib/shapes';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { useShapeCapture } from '../../shared/hooks/use-shape-capture';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

export default function Parallelogram({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatArea } = useUnits();
  const { shapeRef, capture } = useShapeCapture();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const base = parseFloat(inputs['base'] || '0');
    const height = parseFloat(inputs['height'] || '0');
    const side = parseFloat(inputs['side'] || '0');
    if (base <= 0 || height <= 0) return;
    const area = Geometry.parallelogramArea(base, height);
    const perimeter = side > 0 ? 2 * (base + side) : 0;
    const details = [`المساحة = ${base} × ${height} = ${toFixed(area)} م²`];
    if (perimeter > 0) details.push(`المحيط = 2(${base} + ${side}) = ${toFixed(perimeter)} م`);
    const __v = formatArea(area);
    const __d = details.join('\n');
    setResult({ value: __v, details: __d, rawValue: area });
    usePendingSave.getState().set({
      toolId: 'parallelogram',
      toolName: 'متوازي الأضلاع',
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
      toolId: 'parallelogram',
      toolName: 'متوازي الأضلاع',
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
          <ParaSVG
            base={parseFloat(inputs['base'] || '8') || 8}
            height={parseFloat(inputs['height'] || '5') || 5}
            skew={(parseFloat(inputs['side'] || '0') || 0) > 0 ? Math.sqrt(Math.max(Math.pow(parseFloat(inputs['side'] || '0'), 2) - Math.pow(parseFloat(inputs['height'] || '0'), 2), 1)) : 4}
          />
        </div>
        <Input label="طول القاعدة" placeholder="مثلاً 8" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['base'] || ''} onChange={(e) => handleInput('base', e.target.value)} />
        <Input label="الارتفاع" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['height'] || ''} onChange={(e) => handleInput('height', e.target.value)} />
        <Input label="طول الضلع الجانبي" placeholder="مثلاً 6 (اختياري)" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['side'] || ''} onChange={(e) => handleInput('side', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="area" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
