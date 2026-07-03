import { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';

const MODES = [
  { label: 'حساب المسافة على الخريطة', value: 'map' },
  { label: 'حساب المسافة الفعلية', value: 'actual' },
  { label: 'حساب مقياس الرسم', value: 'scale' },
];

const DIST_UNITS = [
  { label: 'متر (m)', value: 'm' },
  { label: 'كيلومتر (km)', value: 'km' },
  { label: 'سنتيمتر (cm)', value: 'cm' },
];

export default function ScaleMap({ onSave }: ToolProps) {
  const [mode, setMode] = useState('map');
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [unit, setUnit] = useState('m');
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const actual = parseFloat(inputs['actual'] || '0');
    const mapDist = parseFloat(inputs['mapDist'] || '0');
    const scaleNum = parseFloat(inputs['scale'] || '0');

    if (mode === 'map') {
      if (!actual || !scaleNum) return;
      const map = actual / scaleNum;
      const unitLabel = unit === 'm' ? 'م' : unit === 'km' ? 'كم' : 'سم';
      setResult({ value: `${map.toFixed(4)} ${unitLabel}`, details: `المسافة على الخريطة = المسافة الفعلية ÷ مقياس الرسم\n= ${actual} ÷ ${scaleNum} = ${map.toFixed(4)} ${unitLabel}` });
    } else if (mode === 'actual') {
      if (!mapDist || !scaleNum) return;
      const act = mapDist * scaleNum;
      const unitLabel = unit === 'm' ? 'م' : unit === 'km' ? 'كم' : 'سم';
      const actKm = unit === 'm' ? act / 1000 : unit === 'km' ? act : act / 100000;
      setResult({ value: `${act.toFixed(2)} ${unitLabel} (${actKm.toFixed(4)} كم)`, details: `المسافة الفعلية = المسافة على الخريطة × مقياس الرسم\n= ${mapDist} × ${scaleNum} = ${act.toFixed(2)} ${unitLabel}` });
    } else {
      if (!actual || !mapDist) return;
      const s = actual / mapDist;
      setResult({ value: `1 : ${Math.round(s).toLocaleString()}`, details: `مقياس الرسم = المسافة الفعلية ÷ المسافة على الخريطة\n= ${actual} ÷ ${mapDist} = ${s.toFixed(0)}\nأي 1 : ${Math.round(s).toLocaleString()}` });
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'scale-map',
      toolName: 'مقياس الرسم',
      inputs: { mode: mode === 'map' ? 1 : mode === 'actual' ? 2 : 3, unit: unit === 'm' ? 1 : unit === 'km' ? 2 : 3, actual: parseFloat(inputs['actual'] || '0'), mapDist: parseFloat(inputs['mapDist'] || '0'), scale: parseFloat(inputs['scale'] || '0') },
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
        {mode !== 'scale' && (
          <Select label="وحدة المسافة" value={unit} onChange={(e) => setUnit(e.target.value)} options={DIST_UNITS} />
        )}
        {mode !== 'map' && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">المسافة الفعلية</label>
            <Input type="number" value={inputs['actual'] || ''} onChange={(e) => handleInput('actual', e.target.value)} placeholder="المسافة الفعلية" />
          </div>
        )}
        {mode !== 'actual' && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">المسافة على الخريطة</label>
            <Input type="number" value={inputs['mapDist'] || ''} onChange={(e) => handleInput('mapDist', e.target.value)} placeholder="المسافة على الخريطة" />
          </div>
        )}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">
            {mode === 'scale' ? 'الرقم الأول (المسافة الفعلية)' : 'مقياس الرسم (مثلاً 1000 لو 1:1000)'}
          </label>
          <Input type="number" value={inputs['scale'] || ''} onChange={(e) => handleInput('scale', e.target.value)} placeholder="مقياس الرسم" />
        </div>
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Ruler className="h-5 w-5" />} />
      )}
    </div>
  );
}
