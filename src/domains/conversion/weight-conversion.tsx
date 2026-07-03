import UnitConverter from './unit-converter';
import { WEIGHT_UNITS } from '../../shared/lib/units';
import type { ToolProps } from '../../shared/types';

export default function WeightConversion(props: ToolProps) {
  return (
    <UnitConverter
      {...props}
      config={{
        title: 'تحويل الأوزان',
        toolId: 'weight-conversion',
        units: WEIGHT_UNITS,
      }}
    />
  );
}
