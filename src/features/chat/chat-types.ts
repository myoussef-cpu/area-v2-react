export type ChatRole = 'user' | 'assistant';

export type ShapeSpec =
  | { kind: 'triangle'; base: number; height: number }
  | { kind: 'square'; side: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'circle'; radius: number }
  | { kind: 'sector'; radius: number; angle: number }
  | { kind: 'ellipse'; a: number; b: number }
  | { kind: 'regularPolygon'; n: number; side: number }
  | { kind: 'trapezoid'; a: number; b: number; h: number }
  | { kind: 'parallelogram'; base: number; height: number }
  | { kind: 'rhombus'; d1: number; d2: number }
  | { kind: 'kite'; d1: number; d2: number }
  | { kind: 'annulus'; R: number; r: number };

export interface ToolResult {
  toolId: string;
  toolName: string;
  params: Record<string, number | string>;
  summary: string;
  details: string;
  primaryValue?: number;
  primaryLabel?: string;
  unitType?: 'area' | 'volume' | 'length' | 'weight' | 'temperature' | 'pressure' | 'power';
  shape?: ShapeSpec;
}

export interface ConversionResult extends ToolResult {
  kind: 'conversion';
  convertedFrom: string;
  convertedTo: string;
  convertedValue: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  results?: (ToolResult | ConversionResult)[];
  suggestions?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface Intent {
  toolId: string;
  params: Record<string, number | string>;
  isConversion?: boolean;
  conversionTo?: string;
  missing?: string[];
}
