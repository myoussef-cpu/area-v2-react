import { useState } from 'react';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

const MATERIALS: Record<string, { label: string; density: number }> = {
  steel: { label: 'صلب (Steel)', density: 7850 },
  stainless: { label: 'استانلس (Stainless)', density: 8000 },
  aluminum: { label: 'ألومنيوم (Aluminum)', density: 2700 },
  copper: { label: 'نحاس (Copper)', density: 8960 },
  brass: { label: 'براص (Brass)', density: 8500 },
};

export default function SteelPlate({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const [material, setMaterial] = useState('steel');

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const L = parseFloat(inputs['L'] || '0');
    const W = parseFloat(inputs['W'] || '0');
    const T = parseFloat(inputs['T'] || '0');
    if (L <= 0 || W <= 0 || T <= 0) return;
    const mat = MATERIALS[material];
    const volume = L * W * (T / 1000);
    const weight = volume * mat.density;
    const area = L * W;
    setResult({
      value: `${toFixed(weight)} كجم`,
      details: `المادة: ${mat.label}\nالطول = ${L} م\nالعرض = ${W} م\nالسماكة = ${T} مم\nالمساحة = ${toFixed(area)} م²\nالحجم = ${toFixed(volume)} م³\nالكثافة = ${mat.density} كجم/م³\nالوزن = ${toFixed(weight)} كجم`,
    });
    usePendingSave.getState().set({
      toolId: 'steel-plate',
      toolName: 'وزن الصاج',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: `${toFixed(weight)} كجم`,
      details: `المادة: ${mat.label}\nالطول = ${L} م\nالعرض = ${W} م\nالسماكة = ${T} مم\nالمساحة = ${toFixed(area)} م²\nالحجم = ${toFixed(volume)} م³\nالكثافة = ${mat.density} كجم/م³\nالوزن = ${toFixed(weight)} كجم`,
      unit: 'كجم',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'steel-plate',
      toolName: 'وزن الصاج',
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
          <label className="mb-2 block text-sm font-semibold">المادة</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MATERIALS).map(([k, v]) => (
              <Button key={k} variant={material === k ? 'primary' : 'secondary'} size="sm" onClick={() => setMaterial(k)}>{v.label}</Button>
            ))}
          </div>
        </div>
        <Input label="الطول (L)" placeholder="مثلاً 2" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['L'] || ''} onChange={(e) => handleInput('L', e.target.value)} />
        <Input label="العرض (W)" placeholder="مثلاً 1" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['W'] || ''} onChange={(e) => handleInput('W', e.target.value)} />
        <Input label="السماكة (T)" placeholder="مثلاً 10" icon={<Ruler className="h-4 w-4" />} suffix="مم" value={inputs['T'] || ''} onChange={(e) => handleInput('T', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
