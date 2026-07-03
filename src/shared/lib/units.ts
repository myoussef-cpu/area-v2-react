import type { UnitType } from '../types';

export const AREA_UNITS = {
  m2: { id: 'm2', label: 'متر² (m²)', factor: 1, type: 'area' as UnitType },
  feddan: { id: 'feddan', label: 'فدان', factor: 4200.833, type: 'area' as UnitType, special: true },
  km2: { id: 'km2', label: 'كيلومتر² (km²)', factor: 1e-6, type: 'area' as UnitType },
  cm2: { id: 'cm2', label: 'سنتيمتر² (cm²)', factor: 1e4, type: 'area' as UnitType },
  ft2: { id: 'ft2', label: 'قدم² (ft²)', factor: 10.7639, type: 'area' as UnitType },
  acre: { id: 'acre', label: 'أكر (acre)', factor: 0.000247105, type: 'area' as UnitType },
  ha: { id: 'ha', label: 'هكتار (ha)', factor: 0.0001, type: 'area' as UnitType },
};

export const VOLUME_UNITS = {
  m3: { id: 'm3', label: 'متر³ (m³)', factor: 1, type: 'volume' as UnitType },
  liter: { id: 'liter', label: 'لتر (L)', factor: 1000, type: 'volume' as UnitType },
  ml: { id: 'ml', label: 'ميليلتر (mL)', factor: 1e6, type: 'volume' as UnitType },
  ft3: { id: 'ft3', label: 'قدم³ (ft³)', factor: 35.3147, type: 'volume' as UnitType },
};

export const LENGTH_UNITS = {
  m: { id: 'm', label: 'متر (m)', factor: 1, type: 'length' as UnitType },
  km: { id: 'km', label: 'كيلومتر (km)', factor: 0.001, type: 'length' as UnitType },
  cm: { id: 'cm', label: 'سنتيمتر (cm)', factor: 100, type: 'length' as UnitType },
  ft: { id: 'ft', label: 'قدم (ft)', factor: 3.28084, type: 'length' as UnitType },
  inch: { id: 'inch', label: 'بوصة (in)', factor: 39.3701, type: 'length' as UnitType },
};

export const WEIGHT_UNITS = {
  kg: { id: 'kg', label: 'كيلوغرام (kg)', factor: 1, type: 'weight' as UnitType },
  ton: { id: 'ton', label: 'طن (t)', factor: 0.001, type: 'weight' as UnitType },
  lb: { id: 'lb', label: 'رطل (lb)', factor: 2.20462, type: 'weight' as UnitType },
  g: { id: 'g', label: 'غرام (g)', factor: 1000, type: 'weight' as UnitType },
};

export const TEMP_UNITS = {
  celsius: { id: 'celsius', label: 'سليزيوس (°C)', factor: 1, type: 'temperature' as UnitType },
  fahrenheit: { id: 'fahrenheit', label: 'فهرنهايت (°F)', factor: 1, type: 'temperature' as UnitType },
};

export function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;
  if (from === 'celsius') celsius = value;
  else celsius = (value - 32) * 5 / 9;
  if (to === 'celsius') return celsius;
  return celsius * 9 / 5 + 32;
}

export function convertUnit(value: number, fromFactor: number, toFactor: number): number {
  return (value / fromFactor) * toFactor;
}
