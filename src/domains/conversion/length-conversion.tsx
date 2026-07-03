import UnitConverter from './unit-converter';
import { LENGTH_UNITS } from '../../shared/lib/units';
import type { ToolProps } from '../../shared/types';

export default function LengthConversion(props: ToolProps) {
  return (
    <UnitConverter
      {...props}
      config={{
        title: 'تحويل الأطوال',
        toolId: 'length-conversion',
        units: LENGTH_UNITS,
      }}
    />
  );
}
