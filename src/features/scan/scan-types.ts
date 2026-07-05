export interface DetectedInput {
  key: string;
  label: string;
  value: number;
  unit?: string;
}

export interface ScanResult {
  toolId: string;
  toolName: string;
  category?: string;
  inputs: Record<string, number>;
  unit: string;
  confidence: number;
  summary: string;
  details: string;
  rawExtraction: string;
  inputSpecs: DetectedInput[];
}
