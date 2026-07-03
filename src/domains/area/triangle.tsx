import { useState } from 'react';
import { Ruler, Calculator, Triangle } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

type Mode = 'base-height' | 'heron' | 'base-angles';

export default function TriangleTool({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const [mode, setMode] = useState<Mode>('base-height');
  const { formatArea } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    let area = 0;
    let perimeter = 0;
    let details = '';

    if (mode === 'base-height') {
      const base = parseFloat(inputs['base'] || '0');
      const height = parseFloat(inputs['height'] || '0');
      if (base <= 0 || height <= 0) return;
      area = Geometry.triangleArea(base, height);
      details = `المساحة = ½ × ${base} × ${height} = ${toFixed(area)} م²`;
    } else if (mode === 'heron') {
      const a = parseFloat(inputs['a'] || '0');
      const b = parseFloat(inputs['b'] || '0');
      const c = parseFloat(inputs['c'] || '0');
      if (a <= 0 || b <= 0 || c <= 0) return;
      area = Geometry.triangleHeron(a, b, c);
      perimeter = a + b + c;
      details = `نصف المحيط (s) = ${toFixed((a + b + c) / 2)}\nالمساحة = ${toFixed(area)} م²\nالمحيط = ${toFixed(perimeter)}`;
    } else {
      const base = parseFloat(inputs['base'] || '0');
      const angle1 = parseFloat(inputs['angle1'] || '0');
      const angle2 = parseFloat(inputs['angle2'] || '0');
      if (base <= 0 || angle1 <= 0 || angle2 <= 0) return;
      const angle3 = 180 - angle1 - angle2;
      if (angle3 <= 0) return;
      const rad1 = (angle1 * Math.PI) / 180;
      const rad2 = (angle2 * Math.PI) / 180;
      const rad3 = (angle3 * Math.PI) / 180;
      const sideA = base;
      const sideB = (sideA * Math.sin(rad2)) / Math.sin(rad1);
      const sideC = (sideA * Math.sin(rad3)) / Math.sin(rad1);
      const s = (sideA + sideB + sideC) / 2;
      area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));
      perimeter = sideA + sideB + sideC;
      details = `الزوايا: ${angle1}°، ${angle2}°، ${toFixed(angle3)}°\nالأضلاع: ${toFixed(sideA)}، ${toFixed(sideB)}، ${toFixed(sideC)}\nالمساحة = ${toFixed(area)} م²\nالمحيط = ${toFixed(perimeter)}`;
    }

    if (isNaN(area) || area <= 0) return;
    setResult({ value: formatArea(area), details });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'triangle',
      toolName: 'مساحة مثلث',
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
          <svg viewBox="0 0 160 120" className="h-28 w-full max-w-xs">
            <polygon points="80,15 150,105 10,105" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary" />
            <text x="80" y="112" fontSize="10" textAnchor="middle" fill="currentColor">القاعدة</text>
            <line x1="80" y1="15" x2="80" y2="105" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-yellow-500" />
            <text x="85" y="65" fontSize="10" fill="currentColor" className="fill-yellow-500">h</text>
          </svg>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant={mode === 'base-height' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('base-height')}>قاعدة + ارتفاع</Button>
          <Button variant={mode === 'heron' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('heron')}>ثلاثة أضلاع</Button>
          <Button variant={mode === 'base-angles' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('base-angles')}>قاعدة + زاويتان</Button>
        </div>

        {mode === 'base-height' && (
          <>
            <Input label="طول القاعدة" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['base'] || ''} onChange={(e) => handleInput('base', e.target.value)} />
            <Input label="الارتفاع" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['height'] || ''} onChange={(e) => handleInput('height', e.target.value)} />
          </>
        )}
        {mode === 'heron' && (
          <>
            <Input label="الضلع الأول (a)" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} />
            <Input label="الضلع الثاني (b)" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} />
            <Input label="الضلع الثالث (c)" placeholder="مثلاً 7" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['c'] || ''} onChange={(e) => handleInput('c', e.target.value)} />
          </>
        )}
        {mode === 'base-angles' && (
          <>
            <Input label="طول القاعدة" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['base'] || ''} onChange={(e) => handleInput('base', e.target.value)} />
            <Input label="الزاوية الأولى" placeholder="مثلاً 50" icon={<Triangle className="h-4 w-4" />} suffix="°" value={inputs['angle1'] || ''} onChange={(e) => handleInput('angle1', e.target.value)} />
            <Input label="الزاوية الثانية" placeholder="مثلاً 60" icon={<Triangle className="h-4 w-4" />} suffix="°" value={inputs['angle2'] || ''} onChange={(e) => handleInput('angle2', e.target.value)} />
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
