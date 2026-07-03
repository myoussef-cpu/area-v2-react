import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

export default function TorqueCalc({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const force = parseFloat(inputs['force'] || '0');
    const dist = parseFloat(inputs['dist'] || '0');
    const rpm = parseFloat(inputs['rpm'] || '0');

    let details = '';

    if (force && dist) {
      const torque = force * dist;
      const torqueNm = torque;
      details = `العزم (τ) = القوة × المسافة
τ = ${force} × ${dist} = ${torqueNm.toFixed(2)} نيوتن.متر`;

      if (rpm) {
        const power = (torqueNm * rpm * 2 * Math.PI) / 60;
        const powerKw = power / 1000;
        const powerHp = power / 745.7;
        details += `\n\nالقدرة من العزم:
P = τ × ω = ${torqueNm.toFixed(2)} × ${((rpm * 2 * Math.PI) / 60).toFixed(2)}
P = ${power.toFixed(2)} واط = ${powerKw.toFixed(3)} كيلوواط
P = ${powerHp.toFixed(3)} حصان`;
      }

      setResult({ value: `${torqueNm.toFixed(2)} نيوتن.متر (N·m)`, details });
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'torque-calc',
      toolName: 'حساب العزم',
      inputs: { force: parseFloat(inputs['force'] || '0'), distance: parseFloat(inputs['dist'] || '0'), rpm: parseFloat(inputs['rpm'] || '0') },
      result: result.value,
      details: result.details,
      unit: 'N·m',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">القوة (نيوتن)</label>
          <Input type="number" value={inputs['force'] || ''} onChange={(e) => handleInput('force', e.target.value)} placeholder="N" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">المسافة (متر)</label>
          <Input type="number" value={inputs['dist'] || ''} onChange={(e) => handleInput('dist', e.target.value)} placeholder="م" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">سرعة الدوران (دورة/دقيقة) - اختياري</label>
          <Input type="number" value={inputs['rpm'] || ''} onChange={(e) => handleInput('rpm', e.target.value)} placeholder="RPM" />
        </div>
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Settings className="h-5 w-5" />} />
      )}
    </div>
  );
}
