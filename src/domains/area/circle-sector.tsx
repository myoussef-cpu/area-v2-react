import { useState } from 'react';
import { Circle, Ruler, Calculator, Radius } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

type Mode = 'circle' | 'sector' | 'ellipse';

export default function CircleSector({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const [mode, setMode] = useState<Mode>('circle');
  const { formatArea } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    let area = 0;
    let details = '';

    if (mode === 'circle') {
      const r = parseFloat(inputs['r'] || '0');
      if (r <= 0) return;
      area = Geometry.circleArea(r);
      const circ = Geometry.circlePerimeter(r);
      details = `المساحة = π × ${r}² = ${toFixed(area)} م²\nمحيط الدائرة = 2π × ${r} = ${toFixed(circ)} م`;
    } else if (mode === 'sector') {
      const r = parseFloat(inputs['r'] || '0');
      const angle = parseFloat(inputs['angle'] || '0');
      if (r <= 0 || angle <= 0) return;
      area = Geometry.sectorArea(r, angle);
      const arcLength = (angle / 360) * 2 * Math.PI * r;
      details = `مساحة القطاع = (${angle} / 360) × π × ${r}² = ${toFixed(area)} م²\nطول القوس = (${angle} / 360) × 2π × ${r} = ${toFixed(arcLength)} م`;
    } else {
      const a = parseFloat(inputs['a'] || '0');
      const b = parseFloat(inputs['b'] || '0');
      if (a <= 0 || b <= 0) return;
      area = Geometry.ellipseArea(a, b);
      details = `مساحة البيضاوي = π × ${a} × ${b} = ${toFixed(area)} م²`;
    }

    if (isNaN(area) || area <= 0) return;
    setResult({ value: formatArea(area), details });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'circle-sector',
      toolName: 'الدائرة والقطاعات',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: result.value,
      details: result.details,
      unit: 'م²',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex justify-center">
          {mode === 'circle' && (
            <svg viewBox="0 0 120 120" className="h-28 w-full max-w-xs">
              <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <line x1="60" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-yellow-500" />
              <text x="82" y="55" fontSize="10" fill="currentColor" className="fill-yellow-500">r</text>
            </svg>
          )}
          {mode === 'sector' && (
            <svg viewBox="0 0 120 120" className="h-28 w-full max-w-xs">
              <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/30" />
              <path d="M60,60 L60,20 A40,40 0 0,1 96.6,40 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <line x1="60" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-yellow-500" />
            </svg>
          )}
          {mode === 'ellipse' && (
            <svg viewBox="0 0 120 80" className="h-24 w-full max-w-xs">
              <ellipse cx="60" cy="40" rx="45" ry="25" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <line x1="15" y1="40" x2="60" y2="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-yellow-500" />
              <text x="32" y="37" fontSize="9" fill="currentColor" className="fill-yellow-500">a</text>
              <line x1="60" y1="40" x2="60" y2="15" stroke="currentColor" strokeWidth="1" strokeDasharray="3" className="text-green-500" />
              <text x="62" y="30" fontSize="9" fill="currentColor" className="fill-green-500">b</text>
            </svg>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant={mode === 'circle' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('circle')}>دائرة</Button>
          <Button variant={mode === 'sector' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('sector')}>قطاع</Button>
          <Button variant={mode === 'ellipse' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('ellipse')}>بيضاوي</Button>
        </div>

        {(mode === 'circle' || mode === 'sector') && (
          <Input label="نصف القطر (r)" placeholder="مثلاً 5" icon={<Circle className="h-4 w-4" />} suffix="م" value={inputs['r'] || ''} onChange={(e) => handleInput('r', e.target.value)} />
        )}
        {mode === 'sector' && (
          <Input label="الزاوية (°)" placeholder="مثلاً 60" icon={<Radius className="h-4 w-4" />} suffix="°" value={inputs['angle'] || ''} onChange={(e) => handleInput('angle', e.target.value)} />
        )}
        {mode === 'ellipse' && (
          <>
            <Input label="المحور الأول (a)" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} />
            <Input label="المحور الثاني (b)" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} />
          </>
        )}

        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>

      {result && (
        <ResultCard
          title="النتيجة"
          result={result.value}
          details={result.details}
          onSave={handleSave}
          icon={<Calculator className="h-5 w-5" />}
        />
      )}
    </div>
  );
}
