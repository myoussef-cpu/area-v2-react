import UnitConverter from './unit-converter';
import type { ToolProps } from '../../shared/types';

const PRESSURE_UNITS = {
  bar: { id: 'bar', label: 'بار (bar)', factor: 1 },
  psi: { id: 'psi', label: 'رطل/بوصة² (psi)', factor: 14.5038 },
  pa: { id: 'pa', label: 'باسكال (Pa)', factor: 100000 },
  kpa: { id: 'kpa', label: 'كيلوباسكال (kPa)', factor: 100 },
  mpa: { id: 'mpa', label: 'ميجاباسكال (MPa)', factor: 0.1 },
};

export default function PressureConversion(props: ToolProps) {
  return (
    <UnitConverter
      {...props}
      config={{
        title: 'تحويل الضغط',
        toolId: 'pressure-conversion',
        units: PRESSURE_UNITS,
      }}
    />
  );
}
