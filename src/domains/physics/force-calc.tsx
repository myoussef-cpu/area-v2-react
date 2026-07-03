import { useState } from 'react';
import { Hammer } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

const G = 9.81;

export default function ForceCalc({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const mass = parseFloat(inputs['mass'] || '0');
    const accel = parseFloat(inputs['accel'] || '0');
    const useGravity = inputs['gravity'] === 'true';

    if (!mass) return;

    const a = useGravity ? G : accel;
    const f = mass * a;
    const fkN = f / 1000;
    const w = mass * G;

    const details = `القوة (F) = الكتلة × التسارع
F = ${mass} × ${a.toFixed(2)} = ${f.toFixed(2)} نيوتن
F = ${fkN.toFixed(4)} كيلو نيوتن
الوزن (W) = ${mass} × ${G} = ${w.toFixed(2)} نيوتن`;

    setResult({ value: `${f.toFixed(2)} نيوتن (N)`, details });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'force-calc',
      toolName: 'حساب القوة',
      inputs: { mass: parseFloat(inputs['mass'] || '0'), accel: parseFloat(inputs['accel'] || '0'), gravity: inputs['gravity'] === 'true' ? 1 : 0 },
      result: result.value,
      details: result.details,
      unit: 'N',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">الكتلة (كجم)</label>
          <Input type="number" value={inputs['mass'] || ''} onChange={(e) => handleInput('mass', e.target.value)} placeholder="كجم" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">التسارع (م/ث²)</label>
          <Input type="number" value={inputs['accel'] || ''} onChange={(e) => handleInput('accel', e.target.value)} placeholder="م/ث²" />
        </div>
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-[#1c1c1e] dark:text-white">
          <input type="checkbox" checked={inputs['gravity'] === 'true'} onChange={(e) => handleInput('gravity', e.target.checked ? 'true' : 'false')} className="h-4 w-4 rounded border-gray-300" />
          استخدام تسارع الجاذبية (g = 9.81 م/ث²)
        </label>
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Hammer className="h-5 w-5" />} />
      )}
    </div>
  );
}
