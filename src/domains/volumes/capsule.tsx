import { useState } from 'react';
import { Circle, Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { usePendingSave } from '../../shared/store/pending-save-store';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

export default function Capsule({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatVolume } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const r = parseFloat(inputs['r'] || '0');
    const h = parseFloat(inputs['h'] || '0');
    if (r <= 0 || h <= 0) return;
    const volume = Geometry.capsuleVolume(r, h);
    const cylinderPart = Math.PI * r * r * h;
    const spherePart = (4 / 3) * Math.PI * r * r * r;
    const __v = formatVolume(volume);
    const __d = `حجم الأسطوانة = π × ${r}² × ${h} = ${toFixed(cylinderPart)} م³\nحجم الكرة (طرفين) = 4/3 × π × ${r}³ = ${toFixed(spherePart)} م³\nالحجم الكلي = ${toFixed(volume)} م³`;
    setResult({ value: __v, details: __d, rawValue: volume });
    usePendingSave.getState().set({
      toolId: 'capsule',
      toolName: 'الكبسولة',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: __v,
      details: __d,
      unit: 'م³',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'capsule',
      toolName: 'الكبسولة',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: result.value,
      details: result.details,
      unit: 'م³',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex justify-center">
          <svg viewBox="0 0 140 60" className="h-20 w-full max-w-xs">
            <rect x="30" y="10" width="80" height="40" rx="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="30" y1="30" x2="110" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-yellow-500" />
            <text x="55" y="28" fontSize="9" fill="currentColor" className="fill-yellow-500">h</text>
            <line x1="110" y1="10" x2="110" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-green-500" />
            <text x="112" y="22" fontSize="9" fill="currentColor" className="fill-green-500">r</text>
          </svg>
        </div>
        <Input label="نصف القطر (r)" placeholder="مثلاً 2" icon={<Circle className="h-4 w-4" />} suffix="م" value={inputs['r'] || ''} onChange={(e) => handleInput('r', e.target.value)} />
        <Input label="طول الجزء الأسطواني (h)" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['h'] || ''} onChange={(e) => handleInput('h', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="volume" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
