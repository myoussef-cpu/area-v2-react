import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

const MODES = [
  { label: 'من الميل (%) إلى الدرجات', value: 'pctToDeg' },
  { label: 'من الدرجات إلى الميل (%)', value: 'degToPct' },
  { label: 'من الارتفاع/القاعدة إلى الميل', value: 'riseRun' },
];

export default function SlopeDeg({ onSave }: ToolProps) {
  const [mode, setMode] = useState('pctToDeg');
  const [inputs, setInputs] = useState<Record<string, string>>({});
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
      setResult({ value: `${d.toFixed(4)}°`, details: `الدرجات = arctan(الميل% / 100) = arctan(${pct} / 100) = ${d.toFixed(4)}°\nالميل = ${pct}%\nالنسبة (Rise:Run) = ${pct}:100` });
    } else if (mode === 'degToPct') {
      const p = Math.tan((deg * Math.PI) / 180) * 100;
      setResult({ value: `${p.toFixed(4)}%`, details: `الميل% = tan(الدرجات) × 100 = tan(${deg}°) × 100 = ${p.toFixed(4)}%\nالدرجات = ${deg}°\nالنسبة (Rise:Run) = ${p.toFixed(2)}:100` });
    } else {
      if (!run) return;
      const p = (rise / run) * 100;
      const d = (Math.atan(rise / run) * 180) / Math.PI;
      setResult({ value: `${p.toFixed(4)}% (${d.toFixed(4)}°)`, details: `الارتفاع: ${rise}\nالقاعدة: ${run}\nالميل% = (الارتفاع / القاعدة) × 100 = (${rise} / ${run}) × 100 = ${p.toFixed(4)}%\nالدرجات = arctan(${rise} / ${run}) = ${d.toFixed(4)}°` });
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
        <Select label="وضع الحساب" value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); }} options={MODES} />
        {mode === 'pctToDeg' && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">نسبة الميل (%)</label>
            <Input type="number" value={inputs['pct'] || ''} onChange={(e) => handleInput('pct', e.target.value)} placeholder="%" />
          </div>
        )}
        {mode === 'degToPct' && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">الزاوية (درجات)</label>
            <Input type="number" value={inputs['deg'] || ''} onChange={(e) => handleInput('deg', e.target.value)} placeholder="°" />
          </div>
        )}
        {mode === 'riseRun' && (
          <>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">الارتفاع (Rise)</label>
              <Input type="number" value={inputs['rise'] || ''} onChange={(e) => handleInput('rise', e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">القاعدة (Run)</label>
              <Input type="number" value={inputs['run'] || ''} onChange={(e) => handleInput('run', e.target.value)} />
            </div>
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
