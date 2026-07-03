export interface CalculationResult {
  id: string;
  toolId: string;
  toolName: string;
  inputs: Record<string, number | string>;
  result: string;
  details: string;
  unit: string;
  timestamp: number;
  image?: string;
  cloudId?: string;
  synced?: boolean;
}
