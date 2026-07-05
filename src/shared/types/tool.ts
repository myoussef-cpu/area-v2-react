import type { LucideIcon } from 'lucide-react';

export type ToolCategory =
  | 'area'
  | 'volumes'
  | 'construction'
  | 'conversion'
  | 'electrical'
  | 'physics'
  | 'math';

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  icon: LucideIcon;
  description: string;
  Component?: React.LazyExoticComponent<React.ComponentType<ToolProps>>;
}

export interface ToolInput {
  label: string;
  key: string;
  placeholder?: string;
  icon?: string;
  suffix?: string;
}

export interface ToolProps {
  onSave: (data: CalculationData) => void;
  initialValues?: Record<string, number>;
}

export interface CalculationData {
  toolId: string;
  toolName: string;
  inputs: Record<string, number>;
  result: string;
  details: string;
  unit: string;
  timestamp: number;
  image?: string;
}

export const CATEGORY_META: Record<ToolCategory, { name: string; icon: string }> = {
  area: { name: 'المساحة والأشكال', icon: 'Shapes' },
  volumes: { name: 'الأحجام والمجسمات', icon: 'Cube' },
  construction: { name: 'الإنشاءات والمباني', icon: 'HardHat' },
  conversion: { name: 'التحويلات الهندسية', icon: 'ArrowLeftRight' },
  electrical: { name: 'الكهرباء والإلكترونيات', icon: 'Zap' },
  physics: { name: 'الميكانيكا والحركة', icon: 'Settings' },
  math: { name: 'الرياضيات الهندسية', icon: 'Calculator' },
};
