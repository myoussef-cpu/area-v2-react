import { useState } from 'react';
import { Droplets } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';
import { usePendingSave } from '../../shared/store/pending-save-store';

export default function HydraulicForce({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const bore = parseFloat(inputs['bore'] || '0');
    const rod = parseFloat(inputs['rod'] || '0');
    const pressure = parseFloat(inputs['pressure'] || '0');

    if (!bore || !pressure) return;

    const boreArea = (Math.PI / 4) * bore * bore / 100;
    const rodArea = rod ? (Math.PI / 4) * rod * rod / 100 : 0;
    const annulusArea = boreArea - rodArea;

    const pushForce = pressure * 10 * boreArea;
    const retractForce = rod ? pressure * 10 * annulusArea : pushForce;

    const details = `مساحة المكبس: ${boreArea.toFixed(2)} سم²
مساحة القضيب: ${rodArea.toFixed(2)} سم²
المساحة الحلقية: ${annulusArea.toFixed(2)} سم²

قوة الدفع (Push): ${pushForce.toFixed(2)} نيوتن (${(pushForce / 1000).toFixed(2)} كيلو نيوتن)
قوة السحب (Retract): ${retractForce.toFixed(2)} نيوتن (${(retractForce / 1000).toFixed(2)} كيلو نيوتن)`;

    const __v = `${pushForce.toFixed(2)} نيوتن (دفع)`;
    setResult({ value: __v, details });
    usePendingSave.getState().set({
      toolId: 'hydraulic-force',
      toolName: 'قوة الهيدروليك',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: __v,
      details,
      unit: 'N',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'hydraulic-force',
      toolName: 'قوة الهيدروليك',
      inputs: { bore: parseFloat(inputs['bore'] || '0'), rod: parseFloat(inputs['rod'] || '0'), pressure: parseFloat(inputs['pressure'] || '0') },
      result: result.value,
      details: result.details,
      unit: 'N',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Input label="قطر المكبس (مم)" type="number" value={inputs['bore'] || ''} onChange={(e) => handleInput('bore', e.target.value)} placeholder="مم" />
        <Input label="قطر القضيب (مم) - اختياري" type="number" value={inputs['rod'] || ''} onChange={(e) => handleInput('rod', e.target.value)} placeholder="مم" />
        <Input label="الضغط (بار)" type="number" value={inputs['pressure'] || ''} onChange={(e) => handleInput('pressure', e.target.value)} placeholder="بار" />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Droplets className="h-5 w-5" />} />
      )}
    </div>
  );
}
