import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import type { ToolProps } from '../../shared/types';
import { usePendingSave } from '../../shared/store/pending-save-store';

export default function UnitPrice({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    const qty1 = parseFloat(inputs['qty1'] || '0');
    const price1 = parseFloat(inputs['price1'] || '0');
    const qty2 = parseFloat(inputs['qty2'] || '0');
    const price2 = parseFloat(inputs['price2'] || '0');

    if (!qty1 || !price1) return;

    const up1 = price1 / qty1;
    let details = `المنتج الأول:\n${qty1} وحدة بسعر ${price1}\nسعر الوحدة = ${price1} / ${qty1} = ${up1.toFixed(4)}`;

    if (qty2 && price2) {
      const up2 = price2 / qty2;
      const diff = Math.abs(up1 - up2);
      const cheaper = up1 < up2 ? 'الأول' : 'الثاني';
      details += `\n\nالمنتج الثاني:\n${qty2} وحدة بسعر ${price2}\nسعر الوحدة = ${price2} / ${qty2} = ${up2.toFixed(4)}`;
      details += `\n\nالفرق: ${diff.toFixed(4)}\nالمنتج ${cheaper} أرخص`;
      const __v = `${cheaper === 'الأول' ? up1.toFixed(4) : up2.toFixed(4)}`;
      setResult({ value: __v, details });
      usePendingSave.getState().set({
        toolId: 'unit-price',
        toolName: 'سعر الوحدة',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details,
        unit: '',
        timestamp: Date.now(),
      });
    } else {
      const __v = `${up1.toFixed(4)}`;
      setResult({ value: __v, details });
      usePendingSave.getState().set({
        toolId: 'unit-price',
        toolName: 'سعر الوحدة',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details,
        unit: '',
        timestamp: Date.now(),
      });
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'unit-price',
      toolName: 'سعر الوحدة',
      inputs: { qty1: parseFloat(inputs['qty1'] || '0'), price1: parseFloat(inputs['price1'] || '0'), qty2: parseFloat(inputs['qty2'] || '0'), price2: parseFloat(inputs['price2'] || '0') },
      result: result.value,
      details: result.details,
      unit: '',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <p className="mb-3 text-sm font-semibold text-[#1c1c1e] dark:text-white">المنتج الأول</p>
        <Input label="الكمية" type="number" value={inputs['qty1'] || ''} onChange={(e) => handleInput('qty1', e.target.value)} placeholder="الكمية" />
        <Input label="السعر" type="number" value={inputs['price1'] || ''} onChange={(e) => handleInput('price1', e.target.value)} placeholder="السعر" />
        <p className="mb-3 mt-6 text-sm font-semibold text-[#1c1c1e] dark:text-white">المنتج الثاني (اختياري)</p>
        <Input label="الكمية" type="number" value={inputs['qty2'] || ''} onChange={(e) => handleInput('qty2', e.target.value)} placeholder="الكمية" />
        <Input label="السعر" type="number" value={inputs['price2'] || ''} onChange={(e) => handleInput('price2', e.target.value)} placeholder="السعر" />
        <Button onClick={calculate} className="w-full mt-4">مقارنة الأسعار</Button>
      </Card>
      {result && (
        <ResultCard title="النتيجة" result={result.value} details={result.details} onSave={handleSave} icon={<Calculator className="h-5 w-5" />} />
      )}
    </div>
  );
}
