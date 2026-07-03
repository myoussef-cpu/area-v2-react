import UnitConverter from './unit-converter';
import { TEMP_UNITS } from '../../shared/lib/units';
import type { ToolProps } from '../../shared/types';

export default function TempConversion(props: ToolProps) {
  return (
    <UnitConverter
      {...props}
      config={{
        title: 'تحويل الحرارة',
        toolId: 'temp-conversion',
        units: TEMP_UNITS,
        isTemperature: true,
      }}
    />
  );
}
