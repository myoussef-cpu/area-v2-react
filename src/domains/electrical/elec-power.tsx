import { useState } from 'react';
import { Gauge } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { usePendingSave } from '../../shared/store/pending-save-store';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

const PHASE_OPTIONS = [
  { label: 'أحادي الطور', value: 'single' },
  { label: 'ثلاثي الطور', value: 'three' },
];

export default function ElecPower({ onSave, initialValues }: ToolProps) {
  const [phase, setPhase] = useState('single');
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
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

    const __v = `${p.toFixed(2)} kW`;
    const __d = details;
    setResult({ value: __v, details: __d });
    usePendingSave.getState().set({
      toolId: 'elec-power',
      toolName: 'القدرة الكهربائية',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: __v,
      details: __d,
      unit: 'kW',
      timestamp: Date.now(),
    });
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
        <Select label="نوع الطور" value={phase} onChange={(e) => { setPhase(e); setResult(null); }} options={PHASE_OPTIONS} />
        <Input label="الجهد (V)" type="number" value={inputs['voltage'] || ''} onChange={(e) => handleInput('voltage', e.target.value)} placeholder="فولت" />
        <Input label="التيار (I)" type="number" value={inputs['current'] || ''} onChange={(e) => handleInput('current', e.target.value)} placeholder="أمبير" />
        <Input label="معامل القدرة (PF)" type="number" value={inputs['pf'] || ''} onChange={(e) => handleInput('pf', e.target.value)} placeholder="0-1" step="0.01" />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Gauge className="h-5 w-5" />} />
      )}
    </div>
  );
}
