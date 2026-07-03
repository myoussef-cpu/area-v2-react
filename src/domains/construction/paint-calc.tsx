import { useState } from 'react';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { Ruler, Calculator, PaintRoller } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function PaintCalc({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const area = parseFloat(inputs['area'] || '0');
    const coats = parseInt(inputs['coats'] || '1', 10);
    const coverage = parseFloat(inputs['coverage'] || '10');
    if (area <= 0 || coats <= 0 || coverage <= 0) return;
    const totalArea = area * coats;
    const liters = totalArea / coverage;
    const cans4L = Math.ceil(liters / 4);
    const cans1L = Math.ceil(liters);
    setResult({
      value: `${toFixed(liters, 1)} لتر`,
      details: `مساحة الحائط = ${toFixed(area)} م²\nعدد الوجوه = ${coats}\nالمساحة الكلية = ${toFixed(totalArea)} م²\nمعدل التغطية = ${coverage} م²/لتر\nكمية الدهان = ${toFixed(liters, 1)} لتر\nعلب ٤ لتر ≈ ${cans4L}\nعلب ١ لتر ≈ ${cans1L}`,
    });
    usePendingSave.getState().set({
      toolId: 'paint-calc',
      toolName: 'حساب الدهانات',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: `${toFixed(liters, 1)} لتر`,
      details: `مساحة الحائط = ${toFixed(area)} م²\nعدد الوجوه = ${coats}\nالمساحة الكلية = ${toFixed(totalArea)} م²\nمعدل التغطية = ${coverage} م²/لتر\nكمية الدهان = ${toFixed(liters, 1)} لتر\nعلب ٤ لتر ≈ ${cans4L}\nعلب ١ لتر ≈ ${cans1L}`,
      unit: 'لتر',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'paint-calc',
      toolName: 'حساب الدهانات',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: result.value,
      details: result.details,
      unit: 'لتر',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Input label="مساحة الحوائط" placeholder="مثلاً 120" icon={<Ruler className="h-4 w-4" />} suffix="م²" value={inputs['area'] || ''} onChange={(e) => handleInput('area', e.target.value)} />
        <Input label="عدد الوجوه" placeholder="مثلاً 2" icon={<PaintRoller className="h-4 w-4" />} value={inputs['coats'] || ''} onChange={(e) => handleInput('coats', e.target.value)} />
        <Input label="معدل التغطية (م²/لتر)" placeholder="مثلاً 10" icon={<Calculator className="h-4 w-4" />} suffix="م²/لتر" value={inputs['coverage'] || ''} onChange={(e) => handleInput('coverage', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
