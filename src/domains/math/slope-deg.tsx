import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';
import { usePendingSave } from '../../shared/store/pending-save-store';

const MODES = [
  { label: 'من الميل (%) إلى الدرجات', value: 'pctToDeg' },
  { label: 'من الدرجات إلى الميل (%)', value: 'degToPct' },
  { label: 'من الارتفاع/القاعدة إلى الميل', value: 'riseRun' },
];

export default function SlopeDeg({ onSave, initialValues }: ToolProps) {
  const [mode, setMode] = useState('pctToDeg');
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const pct = parseFloat(inputs['pct'] || '0');
    const deg = parseFloat(inputs['deg'] || '0');
    const rise = parseFloat(inputs['rise'] || '0');
    const run = parseFloat(inputs['run'] || '0');

    if (mode === 'pctToDeg') {
      const d = (Math.atan(pct / 100) * 180) / Math.PI;
      const __v = `${d.toFixed(4)}°`;
      const __d = `الدرجات = arctan(الميل% / 100) = arctan(${pct} / 100) = ${d.toFixed(4)}°\nالميل = ${pct}%\nالنسبة (Rise:Run) = ${pct}:100`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'slope-deg',
        toolName: 'الميل بالدرجات',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '',
        timestamp: Date.now(),
      });
    } else if (mode === 'degToPct') {
      const p = Math.tan((deg * Math.PI) / 180) * 100;
      const __v = `${p.toFixed(4)}%`;
      const __d = `الميل% = tan(الدرجات) × 100 = tan(${deg}°) × 100 = ${p.toFixed(4)}%\nالدرجات = ${deg}°\nالنسبة (Rise:Run) = ${p.toFixed(2)}:100`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'slope-deg',
        toolName: 'الميل بالدرجات',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '',
        timestamp: Date.now(),
      });
    } else {
      if (!run) return;
      const p = (rise / run) * 100;
      const d = (Math.atan(rise / run) * 180) / Math.PI;
      const __v = `${p.toFixed(4)}% (${d.toFixed(4)}°)`;
      const __d = `الارتفاع: ${rise}\nالقاعدة: ${run}\nالميل% = (الارتفاع / القاعدة) × 100 = (${rise} / ${run}) × 100 = ${p.toFixed(4)}%\nالدرجات = arctan(${rise} / ${run}) = ${d.toFixed(4)}°`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'slope-deg',
        toolName: 'الميل بالدرجات',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '',
        timestamp: Date.now(),
      });
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'slope-deg',
      toolName: 'الميل بالدرجات',
      inputs: { mode: mode === 'pctToDeg' ? 1 : mode === 'degToPct' ? 2 : 3, pct: parseFloat(inputs['pct'] || '0'), deg: parseFloat(inputs['deg'] || '0'), rise: parseFloat(inputs['rise'] || '0'), run: parseFloat(inputs['run'] || '0') },
      result: result.value,
      details: result.details,
      unit: '',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Select label="وضع الحساب" value={mode} onChange={(e) => { setMode(e); setResult(null); }} options={MODES} />
        {mode === 'pctToDeg' && (
          <Input label="نسبة الميل (%)" type="number" value={inputs['pct'] || ''} onChange={(e) => handleInput('pct', e.target.value)} placeholder="%" />
        )}
        {mode === 'degToPct' && (
          <Input label="الزاوية (درجات)" type="number" value={inputs['deg'] || ''} onChange={(e) => handleInput('deg', e.target.value)} placeholder="°" />
        )}
        {mode === 'riseRun' && (
          <>
            <Input label="الارتفاع (Rise)" type="number" value={inputs['rise'] || ''} onChange={(e) => handleInput('rise', e.target.value)} />
            <Input label="القاعدة (Run)" type="number" value={inputs['run'] || ''} onChange={(e) => handleInput('run', e.target.value)} />
          </>
        )}
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Ruler className="h-5 w-5" />} />
      )}
    </div>
  );
}
