import { useState, useMemo } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Select } from '../../shared/ui/select';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { convertUnit, convertTemperature } from '../../shared/lib/units';
import { formatFeddan } from '../../shared/lib/feddan';
import type { ToolProps } from '../../shared/types';

export interface UnitDef {
  id: string;
  label: string;
  factor: number;
  special?: boolean;
}

export interface ConverterConfig {
  title: string;
  toolId: string;
  units: Record<string, UnitDef>;
  isTemperature?: boolean;
  specialFeddan?: boolean;
}

export default function UnitConverter({ onSave, config }: ToolProps & { config: ConverterConfig }) {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);

  const unitOptions = useMemo(
    () => Object.values(config.units).map((u) => ({ label: u.label, value: u.id })),
    [config.units]
  );

  const calculate = () => {
    const val = parseFloat(value);
    if (isNaN(val) || !fromUnit || !toUnit) return;

    let converted: number;
    let details = '';

    if (config.isTemperature) {
      converted = Number(convertTemperature(val, fromUnit, toUnit).toFixed(2));
      const fromLabel = config.units[fromUnit]?.label || fromUnit;
      const toLabel = config.units[toUnit]?.label || toUnit;
      details = `${val} ${fromLabel} = ${converted.toFixed(2)} ${toLabel}`;
    } else {
      const fromDef = config.units[fromUnit];
      const toDef = config.units[toUnit];
      if (!fromDef || !toDef) return;
      converted = convertUnit(val, fromDef.factor, toDef.factor);
      details = `${val} ${fromDef.label} = ${converted.toFixed(4)} ${toDef.label}`;
    }

    let resultValue: string;
    if (config.specialFeddan && toUnit === 'feddan') {
      const fromDef = config.units[fromUnit];
      if (!fromDef) return;
      resultValue = formatFeddan(val / fromDef.factor);
    } else {
      resultValue = converted.toFixed(4);
    }

    setResult({ value: resultValue, details });
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: config.toolId,
      toolName: config.title,
      inputs: { value: parseFloat(value || '0'), fromUnit: fromUnit.charCodeAt(0), toUnit: toUnit.charCodeAt(0) },
      result: result.value,
      details: result.details,
      unit: config.units[toUnit]?.label || '',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-[#1c1c1e] dark:text-white">القيمة</label>
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="أدخل القيمة"
          />
        </div>
        <Select
          label="من"
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          options={unitOptions}
        />
        <Select
          label="إلى"
          value={toUnit}
          onChange={(e) => setToUnit(e.target.value)}
          options={unitOptions}
        />
        <Button onClick={calculate} className="w-full mt-4">تحويل</Button>
      </Card>
      {result && (
        <ResultCard
          title="النتيجة"
          result={result.value}
          details={result.details}
          onSave={handleSave}
          icon={<ArrowLeftRight className="h-5 w-5" />}
        />
      )}
    </div>
  );
}
