import { useState } from 'react';
import { Ruler, Calculator, Pyramid } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { usePendingSave } from '../../shared/store/pending-save-store';
import type { ToolProps, CalculationData } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

type BaseType = 'square' | 'rectangular';

export default function PyramidTool({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const [baseType, setBaseType] = useState<BaseType>('square');
  const { formatVolume } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const h = parseFloat(inputs['h'] || '0');
    if (h <= 0) return;
    let baseArea = 0;
    let details = '';

    if (baseType === 'square') {
      const side = parseFloat(inputs['side'] || '0');
      if (side <= 0) return;
      baseArea = side * side;
      details = `مساحة القاعدة = ${side}² = ${toFixed(baseArea)} م²`;
    } else {
      const w = parseFloat(inputs['w'] || '0');
      const l = parseFloat(inputs['l'] || '0');
      if (w <= 0 || l <= 0) return;
      baseArea = w * l;
      details = `مساحة القاعدة = ${w} × ${l} = ${toFixed(baseArea)} م²`;
    }

    const volume = Geometry.pyramidVolume(baseArea, h);
    details += `\nالحجم = ⅓ × ${toFixed(baseArea)} × ${h} = ${toFixed(volume)} م³`;
    const __v = formatVolume(volume);
    setResult({ value: __v, details, rawValue: volume });
    usePendingSave.getState().set({
      toolId: 'pyramid',
      toolName: 'الهرم',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: __v,
      details,
      unit: 'م³',
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'pyramid',
      toolName: 'الهرم',
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
          <svg viewBox="0 0 120 110" className="h-28 w-full max-w-xs">
            <polygon points="60,10 110,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="60" y1="10" x2="60" y2="90" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-yellow-500" />
            <text x="62" y="55" fontSize="10" fill="currentColor" className="fill-yellow-500">h</text>
          </svg>
        </div>

        <div className="mb-4 flex gap-2">
          <Button variant={baseType === 'square' ? 'primary' : 'secondary'} size="sm" onClick={() => setBaseType('square')}>قاعدة مربعة</Button>
          <Button variant={baseType === 'rectangular' ? 'primary' : 'secondary'} size="sm" onClick={() => setBaseType('rectangular')}>قاعدة مستطيلة</Button>
        </div>

        {baseType === 'square' ? (
          <Input label="طول ضلع القاعدة" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['side'] || ''} onChange={(e) => handleInput('side', e.target.value)} />
        ) : (
          <>
            <Input label="عرض القاعدة" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['w'] || ''} onChange={(e) => handleInput('w', e.target.value)} />
            <Input label="طول القاعدة" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['l'] || ''} onChange={(e) => handleInput('l', e.target.value)} />
          </>
        )}

        <Input label="ارتفاع الهرم (h)" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['h'] || ''} onChange={(e) => handleInput('h', e.target.value)} />

        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>

      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="volume" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
