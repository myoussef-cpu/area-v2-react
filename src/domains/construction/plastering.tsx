import { useState } from 'react';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { Ruler, Calculator, Brush } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

export default function Plastering({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const area = parseFloat(inputs['area'] || '0');
    const thick = parseFloat(inputs['thick'] || '0');
    if (area <= 0 || thick <= 0) return;
    const volume = area * (thick / 1000);
    const dryVolume = volume * 1.3;
    const cementVol = dryVolume / 5;
    const sandVol = dryVolume * 4 / 5;
    const cementKg = cementVol * 1440;
    const sandM3 = sandVol;
    setResult({
      value: `${toFixed(cementKg)} كجم أسمنت`,
      details: `مساحة المحارة = ${toFixed(area)} م²\nسماكة المحارة = ${thick} مم\nحجم المونة = ${toFixed(volume)} م³\nحجم المونة الجافة = ${toFixed(dryVolume)} م³\nالأسمنت (نسبة ١:٤) = ${toFixed(cementKg)} كجم ≈ ${toFixed(cementKg / 50)} شيكارة\nالرمل = ${toFixed(sandM3)} م³`,
    });
    usePendingSave.getState().set({
      toolId: 'plastering',
      toolName: 'أعمال المحارة',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: `${toFixed(cementKg)} كجم أسمنت`,
      details: `مساحة المحارة = ${toFixed(area)} م²\nسماكة المحارة = ${thick} مم\nحجم المونة = ${toFixed(volume)} م³\nحجم المونة الجافة = ${toFixed(dryVolume)} م³\nالأسمنت (نسبة ١:٤) = ${toFixed(cementKg)} كجم ≈ ${toFixed(cementKg / 50)} شيكارة\nالرمل = ${toFixed(sandM3)} م³`,
      unit: 'كجم',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'plastering',
      toolName: 'أعمال المحارة',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: result.value,
      details: result.details,
      unit: 'كجم',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Input label="مساحة الحوائط" placeholder="مثلاً 150" icon={<Ruler className="h-4 w-4" />} suffix="م²" value={inputs['area'] || ''} onChange={(e) => handleInput('area', e.target.value)} />
        <Input label="سماكة المحارة" placeholder="مثلاً 15" icon={<Ruler className="h-4 w-4" />} suffix="مم" value={inputs['thick'] || ''} onChange={(e) => handleInput('thick', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
