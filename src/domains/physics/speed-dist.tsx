import { useState } from 'react';
import { Gauge } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';
import { usePendingSave } from '../../shared/store/pending-save-store';

const MODES = [
  { label: 'حساب السرعة (v = d ÷ t)', value: 'v' },
  { label: 'حساب المسافة (d = v × t)', value: 'd' },
  { label: 'حساب الزمن (t = d ÷ v)', value: 't' },
];

const DIST_UNITS = [
  { label: 'متر (m)', value: 'm' },
  { label: 'كيلومتر (km)', value: 'km' },
];

const TIME_UNITS = [
  { label: 'ثانية (s)', value: 's' },
  { label: 'دقيقة (min)', value: 'min' },
  { label: 'ساعة (hr)', value: 'hr' },
];

const TIME_TO_S = { s: 1, min: 60, hr: 3600 };
const DIST_TO_M = { m: 1, km: 1000 };

export default function SpeedDist({ onSave, initialValues }: ToolProps) {
  const [mode, setMode] = useState('v');
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [distUnit, setDistUnit] = useState('m');
  const [timeUnit, setTimeUnit] = useState('s');
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const d = parseFloat(inputs['distance'] || '0');
    const t = parseFloat(inputs['time'] || '0');
    const v = parseFloat(inputs['speed'] || '0');

    const dM = d * (DIST_TO_M[distUnit as keyof typeof DIST_TO_M] || 1);
    const tS = t * (TIME_TO_S[timeUnit as keyof typeof TIME_TO_S] || 1);

    if (mode === 'v') {
      if (tS === 0) return;
      const vmps = dM / tS;
      const vkmh = vmps * 3.6;
      const __v = `${vmps.toFixed(2)} م/ث`;
      const __d = `السرعة = المسافة ÷ الزمن\n${dM.toFixed(2)} م ÷ ${tS.toFixed(2)} ث = ${vmps.toFixed(2)} م/ث\n= ${vkmh.toFixed(2)} كم/س`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'speed-dist',
        toolName: 'السرعة والزمن',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '',
        timestamp: Date.now(),
      });
    } else if (mode === 'd') {
      const dm = v * tS;
      const dd = dm / (DIST_TO_M[distUnit as keyof typeof DIST_TO_M] || 1);
      const __v = `${dd.toFixed(2)} ${distUnit === 'km' ? 'كم' : 'م'}`;
      const __d = `المسافة = السرعة × الزمن\n${v} م/ث × ${tS.toFixed(2)} ث = ${dm.toFixed(2)} م\n= ${dd.toFixed(2)} ${distUnit === 'km' ? 'كم' : 'م'}`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'speed-dist',
        toolName: 'السرعة والزمن',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details: __d,
        unit: '',
        timestamp: Date.now(),
      });
    } else {
      if (v === 0) return;
      const ts = dM / v;
      const tu = ts / (TIME_TO_S[timeUnit as keyof typeof TIME_TO_S] || 1);
      const __v = `${tu.toFixed(2)} ${timeUnit === 's' ? 'ث' : timeUnit === 'min' ? 'دق' : 'س'}`;
      const __d = `الزمن = المسافة ÷ السرعة\n${dM.toFixed(2)} م ÷ ${v} م/ث = ${ts.toFixed(2)} ث\n= ${tu.toFixed(2)} ${timeUnit === 's' ? 'ثانية' : timeUnit === 'min' ? 'دقيقة' : 'ساعة'}`;
      setResult({ value: __v, details: __d });
      usePendingSave.getState().set({
        toolId: 'speed-dist',
        toolName: 'السرعة والزمن',
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
      toolId: 'speed-dist',
      toolName: 'السرعة والزمن',
      inputs: { mode: mode === 'v' ? 1 : mode === 'd' ? 2 : 3, distUnit: distUnit === 'm' ? 1 : 2, timeUnit: timeUnit === 's' ? 1 : timeUnit === 'min' ? 2 : 3, distance: parseFloat(inputs['distance'] || '0'), time: parseFloat(inputs['time'] || '0'), speed: parseFloat(inputs['speed'] || '0') },
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
        {mode !== 'v' && (
          <Input label="السرعة" type="number" value={inputs['speed'] || ''} onChange={(e) => handleInput('speed', e.target.value)} placeholder="م/ث" />
        )}
        {mode !== 'd' && (
          <>
            <Input label="المسافة" type="number" value={inputs['distance'] || ''} onChange={(e) => handleInput('distance', e.target.value)} placeholder="المسافة" />
            <Select label="وحدة المسافة" value={distUnit} onChange={(e) => setDistUnit(e.target.value)} options={DIST_UNITS} />
          </>
        )}
        {mode !== 't' && (
          <>
            <Input label="الزمن" type="number" value={inputs['time'] || ''} onChange={(e) => handleInput('time', e.target.value)} placeholder="الزمن" />
            <Select label="وحدة الزمن" value={timeUnit} onChange={(e) => setTimeUnit(e.target.value)} options={TIME_UNITS} />
          </>
        )}
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Gauge className="h-5 w-5" />} />
      )}
    </div>
  );
}
