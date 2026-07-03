import UnitConverter from './unit-converter';
import type { ToolProps } from '../../shared/types';

const POWER_UNITS = {
  w: { id: 'w', label: 'واط (W)', factor: 1 },
  kw: { id: 'kw', label: 'كيلوواط (kW)', factor: 0.001 },
  hp: { id: 'hp', label: 'حصان (hp)', factor: 0.00134102 },
  mw: { id: 'mw', label: 'ميجاواط (MW)', factor: 0.000001 },
  btu_h: { id: 'btu_h', label: 'وحدة حرارية/ساعة (BTU/h)', factor: 3.41214 },
};

export default function PowerConversion(props: ToolProps) {
  return (
    <UnitConverter
      {...props}
      config={{
        title: 'تحويل القدرة',
        toolId: 'power-conversion',
        units: POWER_UNITS,
      }}
    />
  );
}
