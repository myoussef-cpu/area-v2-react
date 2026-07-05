import { useState } from 'react';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { Ruler, Calculator, Shovel } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

const SOIL_TYPES = [
  { value: '1', label: 'تربة عادية - ١:١ (45°)' },
  { value: '0.75', label: 'تربة رملية - ١:٠.٧٥ (53°)' },
  { value: '0.5', label: 'تربة متماسكة - ١:٠.٥ (63°)' },
  { value: '0', label: 'تربة صخرية - بدون ميل' },
];

export default function Excavation({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatVolume } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const L = parseFloat(inputs['L'] || '0');
    const W = parseFloat(inputs['W'] || '0');
    const depth = parseFloat(inputs['depth'] || '0');
    const slope = parseFloat(inputs['slope'] || '1');
    if (L <= 0 || W <= 0 || depth <= 0) return;
    const baseVolume = L * W * depth;
    const addition = slope > 0 ? (slope * depth) * (slope * depth) * depth / 3 : 0;
    const totalVolume = baseVolume + addition;
    const topL = L + 2 * slope * depth;
    const topW = W + 2 * slope * depth;
    const __v = formatVolume(totalVolume);
    setResult({
      value: __v,
      details: `أبعاد الحفر من أعلى: ${toFixed(topL)} × ${toFixed(topW)} م\nعمق الحفر = ${depth} م\nالحجم الأساسي = ${toFixed(baseVolume)} م³\nالزيادة بالميول = ${toFixed(addition)} م³\nالحجم الكلي = ${toFixed(totalVolume)} م³`,
      rawValue: totalVolume,
    });
    usePendingSave.getState().set({
      toolId: 'excavation',
      toolName: 'أعمال الحفر',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: __v,
      details: `أبعاد الحفر من أعلى: ${toFixed(topL)} × ${toFixed(topW)} م\nعمق الحفر = ${depth} م\nالحجم الأساسي = ${toFixed(baseVolume)} م³\nالزيادة بالميول = ${toFixed(addition)} م³\nالحجم الكلي = ${toFixed(totalVolume)} م³`,
      unit: 'م³',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'excavation',
      toolName: 'أعمال الحفر',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: result.value,
      details: result.details,
      unit: 'م³',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Input label="طول الموقع" placeholder="مثلاً 10" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['L'] || ''} onChange={(e) => handleInput('L', e.target.value)} />
        <Input label="عرض الموقع" placeholder="مثلاً 8" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['W'] || ''} onChange={(e) => handleInput('W', e.target.value)} />
        <Input label="عمق الحفر" placeholder="مثلاً 3" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['depth'] || ''} onChange={(e) => handleInput('depth', e.target.value)} />
        <Select
          label="نوع التربة"
          options={SOIL_TYPES}
          value={inputs['slope'] || '1'}
          onChange={(e) => handleInput('slope', e.target.value)}
        />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="volume" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
