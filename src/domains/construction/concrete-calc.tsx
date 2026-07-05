import { useState } from 'react';
import { usePendingSave } from '../../shared/store/pending-save-store';
import { Ruler, Calculator, HardHat } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

type Mode = 'slab' | 'column' | 'footing' | 'beam';

export default function ConcreteCalc({ onSave, initialValues }: ToolProps) {
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const [mode, setMode] = useState<Mode>('slab');
  const { formatVolume } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    let volume = 0;
    let details = '';

    if (mode === 'slab') {
      const l = parseFloat(inputs['l'] || '0');
      const w = parseFloat(inputs['w'] || '0');
      const t = parseFloat(inputs['t'] || '0');
      if (l <= 0 || w <= 0 || t <= 0) return;
      volume = l * w * t;
      details = `حجم البلاطة = ${l} × ${w} × ${t} = ${toFixed(volume)} م³`;
    } else if (mode === 'column') {
      const w = parseFloat(inputs['w'] || '0');
      const d = parseFloat(inputs['d'] || '0');
      const h = parseFloat(inputs['h'] || '0');
      if (w <= 0 || d <= 0 || h <= 0) return;
      volume = w * d * h;
      details = `حجم العمود = ${w} × ${d} × ${h} = ${toFixed(volume)} م³`;
    } else if (mode === 'footing') {
      const l = parseFloat(inputs['l'] || '0');
      const w = parseFloat(inputs['w'] || '0');
      const h = parseFloat(inputs['h'] || '0');
      if (l <= 0 || w <= 0 || h <= 0) return;
      volume = l * w * h;
      details = `حجم القاعدة = ${l} × ${w} × ${h} = ${toFixed(volume)} م³`;
    } else {
      const w = parseFloat(inputs['w'] || '0');
      const d = parseFloat(inputs['d'] || '0');
      const l = parseFloat(inputs['l'] || '0');
      if (w <= 0 || d <= 0 || l <= 0) return;
      volume = w * d * l;
      details = `حجم الكمرة = ${w} × ${d} × ${l} = ${toFixed(volume)} م³`;
    }

    const __v = formatVolume(volume);
    setResult({ value: __v, details, rawValue: volume });
    usePendingSave.getState().set({
      toolId: 'concrete-calc',
      toolName: 'كميات الخرسانة',
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
      toolId: 'concrete-calc',
      toolName: 'كميات الخرسانة',
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
          <Button variant={mode === 'slab' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('slab')}>بلاطة</Button>
          <Button variant={mode === 'column' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('column')}>عمود</Button>
          <Button variant={mode === 'footing' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('footing')}>قاعدة</Button>
          <Button variant={mode === 'beam' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('beam')}>كمرة</Button>
        </div>

        {mode === 'slab' && (
          <>
            <Input label="الطول" placeholder="مثلاً 6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['l'] || ''} onChange={(e) => handleInput('l', e.target.value)} />
            <Input label="العرض" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['w'] || ''} onChange={(e) => handleInput('w', e.target.value)} />
            <Input label="السماكة" placeholder="مثلاً 0.15" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['t'] || ''} onChange={(e) => handleInput('t', e.target.value)} />
          </>
        )}
        {mode === 'column' && (
          <>
            <Input label="العرض" placeholder="مثلاً 0.3" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['w'] || ''} onChange={(e) => handleInput('w', e.target.value)} />
            <Input label="العمق" placeholder="مثلاً 0.5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['d'] || ''} onChange={(e) => handleInput('d', e.target.value)} />
            <Input label="الارتفاع" placeholder="مثلاً 3" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['h'] || ''} onChange={(e) => handleInput('h', e.target.value)} />
          </>
        )}
        {mode === 'footing' && (
          <>
            <Input label="الطول" placeholder="مثلاً 2" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['l'] || ''} onChange={(e) => handleInput('l', e.target.value)} />
            <Input label="العرض" placeholder="مثلاً 2" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['w'] || ''} onChange={(e) => handleInput('w', e.target.value)} />
            <Input label="الارتفاع" placeholder="مثلاً 0.5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['h'] || ''} onChange={(e) => handleInput('h', e.target.value)} />
          </>
        )}
        {mode === 'beam' && (
          <>
            <Input label="العرض" placeholder="مثلاً 0.25" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['w'] || ''} onChange={(e) => handleInput('w', e.target.value)} />
            <Input label="العمق" placeholder="مثلاً 0.6" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['d'] || ''} onChange={(e) => handleInput('d', e.target.value)} />
            <Input label="الطول" placeholder="مثلاً 5" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['l'] || ''} onChange={(e) => handleInput('l', e.target.value)} />
          </>
        )}

        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>

      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} rawValue={result.rawValue} unitType="volume" onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
