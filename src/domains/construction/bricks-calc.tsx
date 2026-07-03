import { useState } from 'react';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { Ruler, Calculator, BrickWall } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

const BRICK_TYPES: Record<string, { label: string; l: number; h: number; t: number; mortar: number }> = {
  '6': { label: 'طوب 6 سم', l: 0.25, h: 0.06, t: 0.12, mortar: 0.01 },
  '10': { label: 'طوب 10 سم', l: 0.25, h: 0.10, t: 0.12, mortar: 0.01 },
  '12': { label: 'طوب 12 سم', l: 0.25, h: 0.12, t: 0.12, mortar: 0.01 },
  '20': { label: 'طوب 20 سم', l: 0.25, h: 0.20, t: 0.12, mortar: 0.01 },
  '25': { label: 'طوب 25 سم', l: 0.25, h: 0.25, t: 0.12, mortar: 0.01 },
};

export default function BricksCalc({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const [brickKey, setBrickKey] = useState('10');

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const wallL = parseFloat(inputs['wallL'] || '0');
    const wallH = parseFloat(inputs['wallH'] || '0');
    if (wallL <= 0 || wallH <= 0) return;
    const brick = BRICK_TYPES[brickKey];
    const wallArea = wallL * wallH;
    const brickArea = (brick.l + brick.mortar) * (brick.h + brick.mortar);
    const bricksCount = Math.ceil(wallArea / brickArea);
    const mortarVol = wallArea * brick.t * 0.3;
    const cementKg = mortarVol * 350;
    const sandM3 = mortarVol * 0.8;
    setResult({
      value: `${bricksCount.toLocaleString()} طوبة`,
      details: `نوع الطوب: ${brick.label}\nمساحة الحائط = ${wallL} × ${wallH} = ${toFixed(wallArea)} م²\nعدد الطوب = ${bricksCount.toLocaleString()} طوبة\nحجم المونة = ${toFixed(mortarVol)} م³\nالأسمنت ≈ ${toFixed(cementKg)} كجم\nالرمل ≈ ${toFixed(sandM3)} م³`,
    });
    usePendingSave.getState().set({
      toolId: 'bricks-calc',
      toolName: 'حساب الطوب',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: `${bricksCount.toLocaleString()} طوبة`,
      details: `نوع الطوب: ${brick.label}\nمساحة الحائط = ${wallL} × ${wallH} = ${toFixed(wallArea)} م²\nعدد الطوب = ${bricksCount.toLocaleString()} طوبة\nحجم المونة = ${toFixed(mortarVol)} م³\nالأسمنت ≈ ${toFixed(cementKg)} كجم\nالرمل ≈ ${toFixed(sandM3)} م³`,
      unit: 'طوبة',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'bricks-calc',
      toolName: 'حساب الطوب',
      inputs: { ...Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])), brickType: parseFloat(brickKey) },
      result: result.value,
      details: result.details,
      unit: 'طوبة',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold">نوع الطوب</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(BRICK_TYPES).map(([k, v]) => (
              <Button key={k} variant={brickKey === k ? 'primary' : 'secondary'} size="sm" onClick={() => setBrickKey(k)}>{v.label}</Button>
            ))}
          </div>
        </div>
        <Input label="طول الحائط" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['wallL'] || ''} onChange={(e) => handleInput('wallL', e.target.value)} />
        <Input label="ارتفاع الحائط" placeholder="مثلاً 3" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['wallH'] || ''} onChange={(e) => handleInput('wallH', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
