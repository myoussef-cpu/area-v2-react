import { useState } from 'react';
import { Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { usePendingSave } from '../../shared/store/pending-save-store';
import type { ToolProps, CalculationData } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

export default function Ellipsoid({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const { formatVolume } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const a = parseFloat(inputs['a'] || '0');
    const b = parseFloat(inputs['b'] || '0');
    const c = parseFloat(inputs['c'] || '0');
    if (a <= 0 || b <= 0 || c <= 0) return;
    const volume = Geometry.ellipsoidVolume(a, b, c);
    const __v = formatVolume(volume);
    const __d = `الحجم = 4/3 × π × ${a} × ${b} × ${c} = ${toFixed(volume)} م³`;
    setResult({ value: __v, details: __d, rawValue: volume });
    usePendingSave.getState().set({
      toolId: 'ellipsoid',
      toolName: 'السطح الناقص',
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
      toolId: 'ellipsoid',
      toolName: 'السطح الناقص',
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
          <svg viewBox="0 0 120 80" className="h-24 w-full max-w-xs">
            <ellipse cx="60" cy="40" rx="50" ry="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="10" y1="40" x2="60" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-yellow-500" />
            <text x="28" y="37" fontSize="9" fill="currentColor" className="fill-yellow-500">a</text>
            <line x1="60" y1="40" x2="60" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-green-500" />
            <text x="62" y="25" fontSize="9" fill="currentColor" className="fill-green-500">b</text>
            <line x1="60" y1="40" x2="60" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-blue-500" />
            <text x="62" y="62" fontSize="9" fill="currentColor" className="fill-blue-500">c</text>
          </svg>
        </div>
        <Input label="المحور الأول (a)" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} />
        <Input label="المحور الثاني (b)" placeholder="مثلاً 3" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} />
        <Input label="المحور الثالث (c)" placeholder="مثلاً 2" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['c'] || ''} onChange={(e) => handleInput('c', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="volume" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
