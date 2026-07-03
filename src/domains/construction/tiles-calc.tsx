import { useState } from 'react';
import { Ruler, Calculator, Grid3X3 } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

const TILE_SIZES = [
  { label: '20 × 20 سم', w: 0.2, h: 0.2, perBox: 25 },
  { label: '30 × 30 سم', w: 0.3, h: 0.3, perBox: 16 },
  { label: '40 × 40 سم', w: 0.4, h: 0.4, perBox: 10 },
  { label: '50 × 50 سم', w: 0.5, h: 0.5, perBox: 8 },
  { label: '60 × 60 سم', w: 0.6, h: 0.6, perBox: 6 },
];

export default function TilesCalc({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const [tileIdx, setTileIdx] = useState(2);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const roomL = parseFloat(inputs['roomL'] || '0');
    const roomW = parseFloat(inputs['roomW'] || '0');
    if (roomL <= 0 || roomW <= 0) return;
    const tile = TILE_SIZES[tileIdx];
    const roomArea = roomL * roomW;
    const tileArea = tile.w * tile.h;
    const tilesNeeded = Math.ceil(roomArea / tileArea * 1.1);
    const boxesNeeded = Math.ceil(tilesNeeded / tile.perBox);
    setResult({
      value: `${tilesNeeded} بلاطة`,
      details: `مساحة الغرفة = ${roomL} × ${roomW} = ${toFixed(roomArea)} م²\nمقاس البلاط: ${tile.label}\nعدد البلاط المطلوب (بفاقد ١٠٪) = ${tilesNeeded} بلاطة\nعدد الكراتين = ${boxesNeeded} كرتونة\nعدد البلاط في الكرتونة = ${tile.perBox}`,
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'tiles-calc',
      toolName: 'حساب السيراميك',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: result.value,
      details: result.details,
      unit: 'بلاطة',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold">مقاس البلاط</label>
          <div className="flex flex-wrap gap-2">
            {TILE_SIZES.map((t, i) => (
              <Button key={i} variant={tileIdx === i ? 'primary' : 'secondary'} size="sm" onClick={() => setTileIdx(i)}>{t.label}</Button>
            ))}
          </div>
        </div>
        <Input label="طول الغرفة" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['roomL'] || ''} onChange={(e) => handleInput('roomL', e.target.value)} />
        <Input label="عرض الغرفة" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['roomW'] || ''} onChange={(e) => handleInput('roomW', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
