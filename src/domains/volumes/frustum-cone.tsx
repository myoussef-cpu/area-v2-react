import { useState } from 'react';
import { Circle, Ruler, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

export default function FrustumCone({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const { formatVolume } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const R1 = parseFloat(inputs['R1'] || '0');
    const R2 = parseFloat(inputs['R2'] || '0');
    const h = parseFloat(inputs['h'] || '0');
    if (R1 <= 0 || R2 <= 0 || h <= 0) return;
    const volume = Geometry.frustumVolume(R1, R2, h);
    const slant = Math.sqrt(h * h + (R2 - R1) * (R2 - R1));
    const surface = Math.PI * (R1 * R1 + R2 * R2) + Math.PI * (R1 + R2) * slant;
    setResult({
      value: formatVolume(volume),
      details: `الحجم = (π × ${h} / 3) × (${R1}² + ${R2}² + ${R1}×${R2}) = ${toFixed(volume)} م³\nالمساحة السطحية = ${toFixed(surface)} م²`,
    });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'frustum-cone',
      toolName: 'المخروط الناقص',
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
          <svg viewBox="0 0 100 120" className="h-28 w-full max-w-xs">
            <line x1="25" y1="15" x2="75" y2="15" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="25" y1="15" x2="10" y2="105" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="75" y1="15" x2="90" y2="105" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="10" y1="105" x2="90" y2="105" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <line x1="15" y1="15" x2="15" y2="105" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-yellow-500" />
            <text x="17" y="65" fontSize="10" fill="currentColor" className="fill-yellow-500">h</text>
            <text x="40" y="12" fontSize="9" fill="currentColor">R₁</text>
            <text x="40" y="118" fontSize="9" fill="currentColor">R₂</text>
          </svg>
        </div>
        <Input label="نصف القطر العلوي (R₁)" placeholder="مثلاً 2" icon={<Circle className="h-4 w-4" />} suffix="م" value={inputs['R1'] || ''} onChange={(e) => handleInput('R1', e.target.value)} />
        <Input label="نصف القطر السفلي (R₂)" placeholder="مثلاً 4" icon={<Circle className="h-4 w-4" />} suffix="م" value={inputs['R2'] || ''} onChange={(e) => handleInput('R2', e.target.value)} />
        <Input label="الارتفاع (h)" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['h'] || ''} onChange={(e) => handleInput('h', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
