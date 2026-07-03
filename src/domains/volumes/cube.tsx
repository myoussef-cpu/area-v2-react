import { useState } from 'react';
import { Ruler, Calculator, Cuboid } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function CubeTool({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const { formatVolume } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const side = parseFloat(inputs['side'] || '0');
    if (side <= 0) return;
    const volume = Geometry.cubeVolume(side);
    const surface = Geometry.cubeSurface(side);
    const diagonal = side * Math.sqrt(3);
    setResult({
      value: formatVolume(volume),
      details: `الحجم = ${side}³ = ${toFixed(volume)} م³\nالمساحة السطحية = 6 × ${side}² = ${toFixed(surface)} م²\nقطر المجسم = ${side}√3 = ${toFixed(diagonal)} م`,
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'cube',
      toolName: 'المكعب',
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
          <svg viewBox="0 0 120 120" className="h-28 w-full max-w-xs">
            <polygon points="30,50 60,30 100,50 100,90 60,110 30,90" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="60" y1="30" x2="60" y2="70" stroke="currentColor" strokeWidth="1" />
            <line x1="30" y1="50" x2="30" y2="90" stroke="currentColor" strokeWidth="1" />
            <line x1="100" y1="50" x2="60" y2="70" stroke="currentColor" strokeWidth="1" className="text-white/30" />
          </svg>
        </div>
        <Input label="طول الضلع" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['side'] || ''} onChange={(e) => handleInput('side', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
