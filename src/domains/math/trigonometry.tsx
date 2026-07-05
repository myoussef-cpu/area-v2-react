import { useState } from 'react';
import { Triangle } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';
import { usePendingSave } from '../../shared/store/pending-save-store';

const ANGLE_MODES = [
  { label: 'درجة (Degree)', value: 'deg' },
  { label: 'راديان (Radian)', value: 'rad' },
];

const FUNCS = [
  { label: 'جيب (sin)', value: 'sin' },
  { label: 'جيب التمام (cos)', value: 'cos' },
  { label: 'ظل (tan)', value: 'tan' },
  { label: 'ظل التمام (cot)', value: 'cot' },
  { label: 'قاطع (sec)', value: 'sec' },
  { label: 'قاطع التمام (csc)', value: 'csc' },
];

const INV_FUNCS = [
  { label: 'قوس الجيب (arcsin)', value: 'asin' },
  { label: 'قوس التمام (arccos)', value: 'acos' },
  { label: 'قوس الظل (arctan)', value: 'atan' },
];

export default function Trigonometry({ onSave, initialValues }: ToolProps) {
  const [mode, setMode] = useState('direct');
  const [func, setFunc] = useState('sin');
  const [angleUnit, setAngleUnit] = useState('deg');
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const val = parseFloat(inputs['val'] || '0');
    let details = '';

    if (mode === 'direct') {
      let angle = val;
      if (angleUnit === 'deg') angle = (val * Math.PI) / 180;

      let res: number;
      switch (func) {
        case 'sin': res = Math.sin(angle); break;
        case 'cos': res = Math.cos(angle); break;
        case 'tan': res = Math.tan(angle); break;
        case 'cot': res = 1 / Math.tan(angle); break;
        case 'sec': res = 1 / Math.cos(angle); break;
        case 'csc': res = 1 / Math.sin(angle); break;
        default: return;
      }

      const funcName = FUNCS.find(f => f.value === func)?.label || func;
      details = `${funcName}(${val}°) = ${res.toFixed(6)}`;
      if (['cot', 'sec', 'csc'].includes(func)) {
        details += `\n= 1/${func === 'cot' ? 'tan' : func === 'sec' ? 'cos' : 'sin'}(${val}°)`;
      }
      const __v = res.toFixed(6);
      setResult({ value: __v, details });
      usePendingSave.getState().set({
        toolId: 'trigonometry',
        toolName: 'حساب المثلثات',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details,
        unit: '',
        timestamp: Date.now(),
      });
    } else {
      let res: number;
      const invFunc = func;
      switch (invFunc) {
        case 'asin': res = Math.asin(val); break;
        case 'acos': res = Math.acos(val); break;
        case 'atan': res = Math.atan(val); break;
        default: return;
      }

      const invName = INV_FUNCS.find(f => f.value === invFunc)?.label || invFunc;
      if (angleUnit === 'deg') {
        const deg = (res * 180) / Math.PI;
        details = `${invName}(${val}) = ${deg.toFixed(4)}°`;
        const __v = `${deg.toFixed(4)}°`;
        setResult({ value: __v, details });
        usePendingSave.getState().set({
          toolId: 'trigonometry',
          toolName: 'حساب المثلثات',
          inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
          result: __v,
          details,
          unit: '',
          timestamp: Date.now(),
        });
      } else {
        details = `${invName}(${val}) = ${res.toFixed(4)} rad`;
        const __v = `${res.toFixed(4)} rad`;
        setResult({ value: __v, details });
        usePendingSave.getState().set({
          toolId: 'trigonometry',
          toolName: 'حساب المثلثات',
          inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
          result: __v,
          details,
          unit: '',
          timestamp: Date.now(),
        });
      }
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'trigonometry',
      toolName: 'حساب المثلثات',
      inputs: { mode: mode === 'direct' ? 1 : 2, func: func === 'sin' ? 1 : func === 'cos' ? 2 : func === 'tan' ? 3 : func === 'cot' ? 4 : func === 'sec' ? 5 : func === 'csc' ? 6 : func === 'asin' ? 7 : func === 'acos' ? 8 : 9, angleUnit: angleUnit === 'deg' ? 1 : 2, val: parseFloat(inputs['val'] || '0') },
      result: result.value,
      details: result.details,
      unit: '',
      timestamp: Date.now(),
    });
  };

  const funcOptions = mode === 'direct' ? FUNCS : INV_FUNCS;

  return (
    <div className="space-y-4">
      <Card>
        <Select label="النوع" value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); }} options={[{ label: 'حساب الدالة المثلثية', value: 'direct' }, { label: 'حساب الزاوية (عكسية)', value: 'inverse' }]} />
        <Select label="وحدة الزاوية" value={angleUnit} onChange={(e) => setAngleUnit(e.target.value)} options={ANGLE_MODES} />
        <Select label="الدالة" value={func} onChange={(e) => { setFunc(e.target.value); setResult(null); }} options={funcOptions} />
        <Input
          label={mode === 'direct' ? 'الزاوية' : 'القيمة'}
          type="number" value={inputs['val'] || ''}
          onChange={(e) => handleInput('val', e.target.value)}
          placeholder={mode === 'direct' ? 'الزاوية' : 'القيمة'}
        />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Triangle className="h-5 w-5" />} />
      )}
    </div>
  );
}
