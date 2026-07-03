import { useState } from 'react';
import { Gauge } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

const PHASE_OPTIONS = [
  { label: 'أحادي الطور', value: 'single' },
  { label: 'ثلاثي الطور', value: 'three' },
];

export default function ElecPower({ onSave }: ToolProps) {
  const [phase, setPhase] = useState('single');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const v = parseFloat(inputs['voltage'] || '0');
    const i = parseFloat(inputs['current'] || '0');
    const pf = parseFloat(inputs['pf'] || '0');

    if (v === 0 || i === 0 || pf === 0) return;

    const sqrt3 = phase === 'three' ? Math.sqrt(3) : 1;
    const s = (v * i * sqrt3) / 1000;
    const p = s * pf;
    const q = s * Math.sqrt(Math.abs(1 - pf * pf));

    const details = `الطور: ${phase === 'single' ? 'أحادي' : 'ثلاثي'}
S = ${s.toFixed(3)} kVA
P = ${p.toFixed(3)} kW
Q = ${q.toFixed(3)} kVAR
معامل القدرة: ${pf}`;

    setResult({ value: `${p.toFixed(2)} kW`, details });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'elec-power',
      toolName: 'القدرة الكهربائية',
      inputs: { phase: phase === 'three' ? 3 : 1, voltage: parseFloat(inputs['voltage'] || '0'), current: parseFloat(inputs['current'] || '0'), pf: parseFloat(inputs['pf'] || '0') },
      result: result.value,
      details: result.details,
      unit: 'kW',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <Select label="نوع الطور" value={phase} onChange={(e) => { setPhase(e.target.value); setResult(null); }} options={PHASE_OPTIONS} />
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">الجهد (V)</label>
          <Input type="number" value={inputs['voltage'] || ''} onChange={(e) => handleInput('voltage', e.target.value)} placeholder="فولت" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">التيار (I)</label>
          <Input type="number" value={inputs['current'] || ''} onChange={(e) => handleInput('current', e.target.value)} placeholder="أمبير" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">معامل القدرة (PF)</label>
          <Input type="number" value={inputs['pf'] || ''} onChange={(e) => handleInput('pf', e.target.value)} placeholder="0-1" step="0.01" />
        </div>
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Gauge className="h-5 w-5" />} />
      )}
    </div>
  );
}
