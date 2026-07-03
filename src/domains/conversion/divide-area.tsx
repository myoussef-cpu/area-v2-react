import UnitConverter from './unit-converter';
import { AREA_UNITS } from '../../shared/lib/units';
import type { ToolProps } from '../../shared/types';

export default function DivideArea(props: ToolProps) {
  return (
    <UnitConverter
      {...props}
      config={{
        title: 'تحويل المساحات',
        toolId: 'divide-area',
        units: AREA_UNITS,
        specialFeddan: true,
      }}
    />
  );
}
