import { useState } from 'react';
import { Ruler, Calculator, Weight, Hash } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

const STEEL_DENSITY = 7850;

const STANDARD_BARS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 25, 28, 32, 36, 40];

export default function SteelWeight({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const d = parseFloat(inputs['d'] || '0');
    const len = parseFloat(inputs['len'] || '0');
    const qty = parseInt(inputs['qty'] || '1', 10);
    if (d <= 0 || len <= 0 || qty <= 0) return;
    const crossSection = Math.PI * (d / 1000 / 2) * (d / 1000 / 2);
    const barWeight = crossSection * len * STEEL_DENSITY;
    const totalWeight = barWeight * qty;
    const weightPerMeter = crossSection * STEEL_DENSITY;
    setResult({
      value: `${toFixed(totalWeight)} كجم`,
      details: `قطر السيخ = ${d} مم\nالطول = ${len} م\nالعدد = ${qty}\nوزن المتر الطولي = ${toFixed(weightPerMeter * 1000, 1)} كجم/م\nوزن السيخ الواحد = ${toFixed(barWeight)} كجم\nالوزن الإجمالي = ${toFixed(totalWeight)} كجم = ${toFixed(totalWeight / 1000, 3)} طن`,
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'steel-weight',
      toolName: 'وزن الحديد',
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
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold">أقطار قياسية</label>
          <div className="flex flex-wrap gap-1.5">
            {STANDARD_BARS.map((bar) => (
              <Button key={bar} variant={inputs['d'] === String(bar) ? 'primary' : 'secondary'} size="sm" onClick={() => handleInput('d', String(bar))}>{bar} مم</Button>
            ))}
          </div>
        </div>
        <Input label="قطر السيخ" placeholder="مثلاً 16" icon={<Hash className="h-4 w-4" />} suffix="مم" value={inputs['d'] || ''} onChange={(e) => handleInput('d', e.target.value)} />
        <Input label="طول السيخ" placeholder="مثلاً 12" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['len'] || ''} onChange={(e) => handleInput('len', e.target.value)} />
        <Input label="العدد" placeholder="مثلاً 10" icon={<Weight className="h-4 w-4" />} value={inputs['qty'] || ''} onChange={(e) => handleInput('qty', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
