export type UnitType = 'area' | 'volume' | 'length' | 'weight' | 'temperature' | 'pressure' | 'power';

export interface UnitDefinition {
  id: string;
  label: string;
  factor: number;
  type: UnitType;
  special?: boolean;
}

export interface FeddanResult {
  feddan: number;
  qirat: number;
  sahm: string;
}
