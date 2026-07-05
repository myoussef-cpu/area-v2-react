import { useState } from 'react';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { Ruler, Calculator, Mountain } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

export default function LandLeveling({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatVolume } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const orig = parseFloat(inputs['orig'] || '0');
    const req = parseFloat(inputs['req'] || '0');
    const area = parseFloat(inputs['area'] || '0');
    if (orig <= 0 || req <= 0 || area <= 0) return;
    const diff = orig - req;
    const volume = Math.abs(diff) * area;
    const type = diff > 0 ? 'حفر (Cut)' : 'ردم (Fill)';
    const __v = formatVolume(volume);
    setResult({
      value: __v,
      details: `الفرق في المناسيب = ${toFixed(orig)} - ${toFixed(req)} = ${toFixed(diff)} م\nمساحة الأرض = ${toFixed(area)} م²\nحجم ال${diff > 0 ? 'حفر' : 'ردم'} = ${toFixed(Math.abs(diff))} × ${toFixed(area)} = ${toFixed(volume)} م³\nالنوع: ${type}`,
      rawValue: volume,
    });
    usePendingSave.getState().set({
      toolId: 'land-leveling',
      toolName: 'تسوية الأرض',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: __v,
      details: `الفرق في المناسيب = ${toFixed(orig)} - ${toFixed(req)} = ${toFixed(diff)} م\nمساحة الأرض = ${toFixed(area)} م²\nحجم ال${diff > 0 ? 'حفر' : 'ردم'} = ${toFixed(Math.abs(diff))} × ${toFixed(area)} = ${toFixed(volume)} م³\nالنوع: ${type}`,
      unit: 'م³',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'land-leveling',
      toolName: 'تسوية الأرض',
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
        <Input label="منسوب الأرض الأصلي" placeholder="مثلاً 105.5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['orig'] || ''} onChange={(e) => handleInput('orig', e.target.value)} />
        <Input label="منسوب الأرض المطلوب" placeholder="مثلاً 103.2" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['req'] || ''} onChange={(e) => handleInput('req', e.target.value)} />
        <Input label="مساحة الأرض" placeholder="مثلاً 500" icon={<Mountain className="h-4 w-4" />} suffix="م²" value={inputs['area'] || ''} onChange={(e) => handleInput('area', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="volume" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
