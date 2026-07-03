import { useState } from 'react';
import { Hash } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

const INSTALL_METHODS = [
  { label: 'في الهواء الطلق', value: 'open' },
  { label: 'في قناة مغلقة', value: 'conduit' },
  { label: 'مدفون تحت الأرض', value: 'underground' },
];

const CABLE_TABLE = [
  { size: 1.5, ampacity: { open: 18, conduit: 14, underground: 22 } },
  { size: 2.5, ampacity: { open: 25, conduit: 20, underground: 30 } },
  { size: 4, ampacity: { open: 34, conduit: 27, underground: 40 } },
  { size: 6, ampacity: { open: 43, conduit: 35, underground: 51 } },
  { size: 10, ampacity: { open: 60, conduit: 48, underground: 70 } },
  { size: 16, ampacity: { open: 80, conduit: 64, underground: 93 } },
  { size: 25, ampacity: { open: 105, conduit: 85, underground: 120 } },
  { size: 35, ampacity: { open: 130, conduit: 105, underground: 148 } },
  { size: 50, ampacity: { open: 160, conduit: 130, underground: 180 } },
  { size: 70, ampacity: { open: 200, conduit: 160, underground: 225 } },
  { size: 95, ampacity: { open: 240, conduit: 195, underground: 270 } },
  { size: 120, ampacity: { open: 275, conduit: 225, underground: 310 } },
  { size: 150, ampacity: { open: 315, conduit: 260, underground: 355 } },
  { size: 185, ampacity: { open: 360, conduit: 295, underground: 405 } },
  { size: 240, ampacity: { open: 425, conduit: 350, underground: 475 } },
];

export default function WireSize({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [method, setMethod] = useState('open');
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const current = parseFloat(inputs['current'] || '0');
    const voltage = parseFloat(inputs['voltage'] || '0');
    const length = parseFloat(inputs['length'] || '0');

    if (!current) return;

    const methodKey = method as keyof typeof CABLE_TABLE[0]['ampacity'];
    let suggestion = CABLE_TABLE.find((c) => c.ampacity[methodKey] >= current);

    if (!suggestion) {
      suggestion = CABLE_TABLE[CABLE_TABLE.length - 1];
    }

    const vDrop = length ? (2 * length * current * 0.0178) / suggestion.size : 0;
    const vDropPct = voltage ? (vDrop / voltage) * 100 : 0;

    const details = `التيار: ${current} أمبير
الموصى به: ${suggestion.size} مم²
سعة التحمل: ${suggestion.ampacity[methodKey]} أمبير
هبوط الجهد المقدر: ${vDrop.toFixed(2)} فولت (${vDropPct.toFixed(2)}%)`;

    setResult({ value: `${suggestion.size} مم²`, details });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'wire-size',
      toolName: 'مقاسات الأسلاك',
      inputs: { method: method === 'open' ? 1 : method === 'conduit' ? 2 : 3, current: parseFloat(inputs['current'] || '0'), voltage: parseFloat(inputs['voltage'] || '0'), length: parseFloat(inputs['length'] || '0') },
      result: result.value,
      details: result.details,
      unit: 'mm²',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Select label="طريقة التركيب" value={method} onChange={(e) => setMethod(e.target.value)} options={INSTALL_METHODS} />
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">تيار الحمل (أمبير)</label>
          <Input type="number" value={inputs['current'] || ''} onChange={(e) => handleInput('current', e.target.value)} placeholder="أمبير" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">الجهد (فولت)</label>
          <Input type="number" value={inputs['voltage'] || ''} onChange={(e) => handleInput('voltage', e.target.value)} placeholder="فولت" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">طول الكابل (متر)</label>
          <Input type="number" value={inputs['length'] || ''} onChange={(e) => handleInput('length', e.target.value)} placeholder="متر" />
        </div>
        <Button onClick={calculate} className="w-full mt-4">حساب المقاس المناسب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Hash className="h-5 w-5" />} />
      )}
    </div>
  );
}
