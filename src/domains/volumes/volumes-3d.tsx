import { useState } from 'react';
import { Circle, Ruler, Calculator, Box } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

type Mode = 'cylinder' | 'sphere' | 'cone';

export default function Volumes3d({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const [mode, setMode] = useState<Mode>('cylinder');
  const { formatVolume } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    let volume = 0;
    let surface = 0;
    let details = '';

    if (mode === 'cylinder') {
      const r = parseFloat(inputs['r'] || '0');
      const h = parseFloat(inputs['h'] || '0');
      if (r <= 0 || h <= 0) return;
      volume = Geometry.cylinderVolume(r, h);
      surface = 2 * Math.PI * r * (r + h);
      details = `الحجم = π × ${r}² × ${h} = ${toFixed(volume)} م³\nالمساحة السطحية = 2π × ${r}(${r} + ${h}) = ${toFixed(surface)} م²`;
    } else if (mode === 'sphere') {
      const r = parseFloat(inputs['r'] || '0');
      if (r <= 0) return;
      volume = Geometry.sphereVolume(r);
      surface = 4 * Math.PI * r * r;
      details = `الحجم = 4/3 × π × ${r}³ = ${toFixed(volume)} م³\nالمساحة السطحية = 4π × ${r}² = ${toFixed(surface)} م²`;
    } else {
      const r = parseFloat(inputs['r'] || '0');
      const h = parseFloat(inputs['h'] || '0');
      if (r <= 0 || h <= 0) return;
      volume = Geometry.coneVolume(r, h);
      const slant = Math.sqrt(r * r + h * h);
      surface = Math.PI * r * (r + slant);
      details = `الحجم = ⅓ × π × ${r}² × ${h} = ${toFixed(volume)} م³\nالمساحة السطحية = π × ${r}(${r} + ${toFixed(slant)}) = ${toFixed(surface)} م²`;
    }

    if (volume <= 0 || isNaN(volume)) return;
    setResult({ value: formatVolume(volume), details });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'volumes-3d',
      toolName: 'الأحجام الأساسية',
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
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant={mode === 'cylinder' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('cylinder')}>أسطوانة</Button>
          <Button variant={mode === 'sphere' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('sphere')}>كرة</Button>
          <Button variant={mode === 'cone' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('cone')}>مخروط</Button>
        </div>

        <Input label="نصف القطر (r)" placeholder="مثلاً 3" icon={<Circle className="h-4 w-4" />} suffix="م" value={inputs['r'] || ''} onChange={(e) => handleInput('r', e.target.value)} />
        {mode !== 'sphere' && (
          <Input label="الارتفاع (h)" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['h'] || ''} onChange={(e) => handleInput('h', e.target.value)} />
        )}

        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>

      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
