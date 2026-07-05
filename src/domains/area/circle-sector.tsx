import { useState } from 'react';
import { Circle, Ruler, Calculator, CircleDot } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import { CircleSVG, SectorSVG, EllipseSVG } from '../../shared/lib/shapes';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { useShapeCapture } from '../../shared/hooks/use-shape-capture';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

type Mode = 'circle' | 'sector' | 'ellipse';

export default function CircleSector({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const [mode, setMode] = useState<Mode>('circle');
  const { formatArea } = useUnits();
  const { shapeRef, capture } = useShapeCapture();

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
    const __v = formatArea(area);
    setResult({ value: __v, details, rawValue: area });
    usePendingSave.getState().set({
      toolId: 'circle-sector',
      toolName: 'الدائرة والقطاعات',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: __v,
      details,
      unit: 'م²',
      image: capture(),
      timestamp: Date.now(),
    });
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
      image: capture(),
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div ref={shapeRef} className="mb-4 flex justify-center">
          {mode === 'circle' && (
            <CircleSVG r={parseFloat(inputs['r'] || '5') || 5} />
          )}
          {mode === 'sector' && (
            <SectorSVG r={parseFloat(inputs['r'] || '5') || 5} angle={parseFloat(inputs['angle'] || '60') || 60} />
          )}
          {mode === 'ellipse' && (
            <EllipseSVG a={parseFloat(inputs['a'] || '6') || 6} b={parseFloat(inputs['b'] || '4') || 4} />
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
          <Input label="الزاوية (°)" placeholder="مثلاً 60" icon={<CircleDot className="h-4 w-4" />} suffix="°" value={inputs['angle'] || ''} onChange={(e) => handleInput('angle', e.target.value)} />
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
          rawValue={result.rawValue}
          unitType="area"
          onSave={handleSave}
          icon={<Calculator className="h-5 w-5" />}
        />
      )}
    </div>
  );
}
