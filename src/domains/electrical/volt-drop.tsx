import { useState } from 'react';
import { Cable } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { usePendingSave } from '../../shared/store/pending-save-store';
import type { ToolProps } from '../../shared/types';

const MATERIAL_OPTIONS = [
  { label: 'نحاس (Copper)', value: 'copper' },
  { label: 'ألمنيوم (Aluminum)', value: 'aluminum' },
];

const RESISTIVITY = { copper: 0.0178, aluminum: 0.029 };

export default function VoltDrop({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [material, setMaterial] = useState('copper');
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const length = parseFloat(inputs['length'] || '0');
    const current = parseFloat(inputs['current'] || '0');
    const size = parseFloat(inputs['size'] || '0');
    const voltage = parseFloat(inputs['voltage'] || '0');
    const pf = parseFloat(inputs['pf'] || '1');

    if (!length || !current || !size || !voltage) return;

    const rho = RESISTIVITY[material as keyof typeof RESISTIVITY];
    const r = (rho * length * 2) / size;
    const x = 0.08 / 1000 * length * 2;
    const vDrop = current * (r * pf + x * Math.sqrt(Math.abs(1 - pf * pf)));
    const vDropPct = (vDrop / voltage) * 100;
    const status = vDropPct <= 3 ? 'مقبول ✓' : 'غير مقبول ✗';

    const details = `مقاومة الكابل: ${r.toFixed(4)} Ω
مفاعلة الكابل: ${x.toFixed(4)} Ω
هبوط الجهد: ${vDrop.toFixed(2)} V
نسبة الهبوط: ${vDropPct.toFixed(2)}%
الحالة: ${status}`;

    const __v = `${vDrop.toFixed(2)} فولت (${vDropPct.toFixed(1)}%)`;
    const __d = details;
    setResult({ value: __v, details: __d });
    usePendingSave.getState().set({
      toolId: 'volt-drop',
      toolName: 'هبوط الجهد',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: __v,
      details: __d,
      unit: 'V',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'volt-drop',
      toolName: 'هبوط الجهد',
      inputs: { material: material === 'copper' ? 1 : 0, length: parseFloat(inputs['length'] || '0'), current: parseFloat(inputs['current'] || '0'), size: parseFloat(inputs['size'] || '0'), voltage: parseFloat(inputs['voltage'] || '0'), pf: parseFloat(inputs['pf'] || '1') },
      result: result.value,
      details: result.details,
      unit: 'V',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Select label="مادة الكابل" value={material} onChange={(e) => setMaterial(e.target.value)} options={MATERIAL_OPTIONS} />
        <Input label="طول الكابل (م)" type="number" value={inputs['length'] || ''} onChange={(e) => handleInput('length', e.target.value)} placeholder="متر" />
        <Input label="تيار الحمل (أمبير)" type="number" value={inputs['current'] || ''} onChange={(e) => handleInput('current', e.target.value)} placeholder="أمبير" />
        <Input label="مساحة المقطع (مم²)" type="number" value={inputs['size'] || ''} onChange={(e) => handleInput('size', e.target.value)} placeholder="مم²" />
        <Input label="الجهد (فولت)" type="number" value={inputs['voltage'] || ''} onChange={(e) => handleInput('voltage', e.target.value)} placeholder="فولت" />
        <Input label="معامل القدرة (PF)" type="number" value={inputs['pf'] || '1'} onChange={(e) => handleInput('pf', e.target.value)} placeholder="0-1" step="0.01" />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Cable className="h-5 w-5" />} />
      )}
    </div>
  );
}
