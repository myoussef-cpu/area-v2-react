import { useState } from 'react';
import { Zap } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { usePendingSave } from '../../shared/store/pending-save-store';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

const MODES = [
  { label: 'حساب التيار (I = V/R)', value: 'I' },
  { label: 'حساب الجهد (V = I×R)', value: 'V' },
  { label: 'حساب المقاومة (R = V/I)', value: 'R' },
];

export default function OhmsLaw({ onSave, initialValues }: ToolProps) {
  const [mode, setMode] = useState('I');
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const v = parseFloat(inputs['voltage'] || '0');
    const i = parseFloat(inputs['current'] || '0');
    const r = parseFloat(inputs['resistance'] || '0');

    let val: number;
    let detail = '';

    if (mode === 'I') {
      if (r === 0) return;
      val = v / r;
      detail = `I = V / R = ${v} / ${r} = ${val.toFixed(3)} A`;
      const p = v * val;
      detail += `\nP = V × I = ${v} × ${val.toFixed(3)} = ${p.toFixed(2)} W`;
      const __v1 = `${val.toFixed(3)} أمبير (A)`;
      setResult({ value: __v1, details: detail });
      usePendingSave.getState().set({
        toolId: 'ohms-law',
        toolName: 'قانون أوم',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v1,
        details: detail,
        unit: '',
        timestamp: Date.now(),
      });
    } else if (mode === 'V') {
      val = i * r;
      detail = `V = I × R = ${i} × ${r} = ${val.toFixed(2)} V`;
      const p = val * i;
      detail += `\nP = V × I = ${val.toFixed(2)} × ${i} = ${p.toFixed(2)} W`;
      const __v2 = `${val.toFixed(2)} فولت (V)`;
      setResult({ value: __v2, details: detail });
      usePendingSave.getState().set({
        toolId: 'ohms-law',
        toolName: 'قانون أوم',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v2,
        details: detail,
        unit: '',
        timestamp: Date.now(),
      });
    } else {
      if (i === 0) return;
      val = v / i;
      detail = `R = V / I = ${v} / ${i} = ${val.toFixed(2)} Ω`;
      const p = v * i;
      detail += `\nP = V × I = ${v} × ${i} = ${p.toFixed(2)} W`;
      const __v3 = `${val.toFixed(2)} أوم (Ω)`;
      setResult({ value: __v3, details: detail });
      usePendingSave.getState().set({
        toolId: 'ohms-law',
        toolName: 'قانون أوم',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v3,
        details: detail,
        unit: '',
        timestamp: Date.now(),
      });
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'ohms-law',
      toolName: 'قانون أوم',
      inputs: { mode: mode === 'I' ? 1 : mode === 'V' ? 2 : 3, voltage: parseFloat(inputs['voltage'] || '0'), current: parseFloat(inputs['current'] || '0'), resistance: parseFloat(inputs['resistance'] || '0') },
      result: result.value,
      details: result.details,
      unit: '',
      timestamp: Date.now(),
    });
  };

  const showVoltage = mode !== 'V';
  const showCurrent = mode !== 'I';
  const showResistance = mode !== 'R';

  return (
    <div className="space-y-4">
      <Card>
        <Select label="وضع الحساب" value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); }} options={MODES} />
        {showVoltage && (
          <Input label="الجهد (V)" type="number" value={inputs['voltage'] || ''} onChange={(e) => handleInput('voltage', e.target.value)} placeholder="فولت" />
        )}
        {showCurrent && (
          <Input label="التيار (I)" type="number" value={inputs['current'] || ''} onChange={(e) => handleInput('current', e.target.value)} placeholder="أمبير" />
        )}
        {showResistance && (
          <Input label="المقاومة (R)" type="number" value={inputs['resistance'] || ''} onChange={(e) => handleInput('resistance', e.target.value)} placeholder="أوم" />
        )}
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Zap className="h-5 w-5" />} />
      )}
    </div>
  );
}
