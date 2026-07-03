import type { ToolDefinition, ToolCategory } from '../shared/types';
import {
  Ruler, Circle, CircleDot, VectorSquare, Triangle, Shapes,
  Square, RectangleHorizontal, Diamond, Plane, CircleDotDashed,
  Box, Cuboid, Pyramid, Cone, Pill, Egg,
  HardHat, Mountain, BrickWall, Grid3X3, PaintRoller, Weight,
  Sheet, Shovel, Brush,
  ArrowLeftRight, Ruler as RulerIcon, Thermometer, Gauge,
  Zap, Plug, LineChart, Ellipsis,
  Gauge as SpeedGauge, Hand, Wrench, Droplets,
  Percent, Superscript, ExternalLink, Waves, Map,
  SortAsc, MoveDiagonal, Scale, Tag,
} from 'lucide-react';

interface ToolEntry {
  id: string;
  name: string;
  category: ToolCategory;
  icon: typeof DrawPolygon;
  description: string;
}

export const TOOLS: ToolEntry[] = [
  { id: 'trapezoid', name: 'مساحة شبه المنحرف', category: 'area', icon: Shapes, description: 'حساب المساحة وتقسيم شبه المنحرف' },
  { id: 'triangle', name: 'مساحة مثلث', category: 'area', icon: Triangle, description: 'قاعدة هيرون' },
  { id: 'circle-sector', name: 'الدائرة والقطاعات', category: 'area', icon: Circle, description: 'دائرة، بيضاوي، قطاع' },
  { id: 'regular-polygon', name: 'مضلعات منتظمة', category: 'area', icon: Shapes, description: 'خماسي، سداسي، إلخ' },
  { id: 'square', name: 'المربع', category: 'area', icon: Square, description: 'مساحة ومحيط المربع' },
  { id: 'rectangle', name: 'المستطيل', category: 'area', icon: RectangleHorizontal, description: 'مساحة ومحيط المستطيل' },
  { id: 'parallelogram', name: 'متوازي الأضلاع', category: 'area', icon: Shapes, description: 'حساب المساحة والمحيط' },
  { id: 'rhombus', name: 'المعين', category: 'area', icon: Diamond, description: 'حساب المساحة عن طريق الأقطار' },
  { id: 'kite', name: 'الطائرة الورقية', category: 'area', icon: Plane, description: 'مساحة شكل الطائرة الورقية' },
  { id: 'annulus', name: 'الحلقة الدائرية', category: 'area', icon: CircleDotDashed, description: 'المساحة بين دائرتين' },
  { id: 'cyclic-quadrilateral', name: 'رباعي دائري', category: 'area', icon: CircleDot, description: 'حساب المساحة' },
  { id: 'irregular-quadrilateral', name: 'رباعي غير منتظم', category: 'area', icon: VectorSquare, description: 'أشكال حرة' },

  { id: 'volumes-3d', name: 'الأحجام الأساسية', category: 'volumes', icon: Box, description: 'أسطوانة، كرة، مخروط' },
  { id: 'cube', name: 'المكعب', category: 'volumes', icon: Cuboid, description: 'حجم ومساحة سطح المكعب' },
  { id: 'pyramid', name: 'الهرم', category: 'volumes', icon: Pyramid, description: 'حجم الهرم القائم' },
  { id: 'frustum-cone', name: 'مخروط ناقص', category: 'volumes', icon: Cone, description: 'حجم المخروط الناقص' },
  { id: 'capsule', name: 'الكبسولة', category: 'volumes', icon: Pill, description: 'حجم الخزانات الكبسولية' },
  { id: 'ellipsoid', name: 'السطح الناقص', category: 'volumes', icon: Egg, description: 'حجم المجسم البيضاوي' },

  { id: 'concrete-calc', name: 'كميات الخرسانة', category: 'construction', icon: HardHat, description: 'بلاطات، أعمدة، قواعد' },
  { id: 'land-leveling', name: 'تسوية وميول', category: 'construction', icon: Mountain, description: 'حساب الميل والتسوية' },
  { id: 'bricks-calc', name: 'حساب الطوب', category: 'construction', icon: BrickWall, description: 'عدد الطوب في المتر المربع' },
  { id: 'tiles-calc', name: 'حساب السيراميك', category: 'construction', icon: Grid3X3, description: 'عدد البلاط والكراتين' },
  { id: 'paint-calc', name: 'حساب الدهانات', category: 'construction', icon: PaintRoller, description: 'كمية الدهان للجدران' },
  { id: 'steel-weight', name: 'وزن الحديد', category: 'construction', icon: Weight, description: 'وزن أسياخ الحديد' },
  { id: 'steel-plate', name: 'وزن الصاج', category: 'construction', icon: Sheet, description: 'وزن ألواح الصاج' },
  { id: 'excavation', name: 'أعمال الحفر', category: 'construction', icon: Shovel, description: 'حجم ناتج الحفر والردم' },
  { id: 'plastering', name: 'أعمال المحارة', category: 'construction', icon: Brush, description: 'كميات الرمل والأسمنت' },

  { id: 'divide-area', name: 'تحويل المساحات', category: 'conversion', icon: ArrowLeftRight, description: 'فدان، قيراط، سهم' },
  { id: 'length-conversion', name: 'تحويل الأطوال', category: 'conversion', icon: RulerIcon, description: 'متر، قدم، بوصة' },
  { id: 'weight-conversion', name: 'تحويل الأوزان', category: 'conversion', icon: Weight, description: 'طن، كيلو، رطل' },
  { id: 'temp-conversion', name: 'تحويل الحرارة', category: 'conversion', icon: Thermometer, description: 'سليزيوس، فهرنهايت' },
  { id: 'pressure-conversion', name: 'تحويل الضغط', category: 'conversion', icon: Gauge, description: 'بار، PSI، باسكال' },
  { id: 'power-conversion', name: 'تحويل القدرة', category: 'conversion', icon: Zap, description: 'حصان، كيلوواط' },

  { id: 'ohms-law', name: 'قانون أوم', category: 'electrical', icon: Plug, description: 'حساب الجهد، التيار، المقاومة' },
  { id: 'elec-power', name: 'القدرة الكهربائية', category: 'electrical', icon: Zap, description: 'الواط والفولت أمبير' },
  { id: 'volt-drop', name: 'هبوط الجهد', category: 'electrical', icon: LineChart, description: 'Voltage Drop' },
  { id: 'wire-size', name: 'مقاس الأسلاك', category: 'electrical', icon: Ellipsis, description: 'اختيار مقاس السلك' },

  { id: 'speed-dist', name: 'السرعة والزمن', category: 'physics', icon: SpeedGauge, description: 'المسافة، السرعة، الوقت' },
  { id: 'force-calc', name: 'حساب القوة', category: 'physics', icon: Hand, description: 'F = ma' },
  { id: 'torque-calc', name: 'حساب العزم', category: 'physics', icon: Wrench, description: 'Torque' },
  { id: 'hydraulic-force', name: 'قوة الهيدروليك', category: 'physics', icon: Droplets, description: 'قوة السلندر الهيدروليكي' },

  { id: 'percentage', name: 'النسبة المئوية', category: 'math', icon: Percent, description: 'حساب النسب والزيادة' },
  { id: 'quadratic', name: 'المعادلة التربيعية', category: 'math', icon: Superscript, description: 'حل معادلات الدرجة الثانية' },
  { id: 'pythagoras', name: 'فيثاغورس', category: 'math', icon: ExternalLink, description: 'حساب الوتر والأضلاع' },
  { id: 'trigonometry', name: 'حساب المثلثات', category: 'math', icon: Waves, description: 'Sin, Cos, Tan' },
  { id: 'scale-map', name: 'مقياس الرسم', category: 'math', icon: Map, description: 'التحويل بين الخريطة والواقع' },
  { id: 'avg-calc', name: 'المتوسط الحسابي', category: 'math', icon: SortAsc, description: 'المتوسط، الوسيط، الانحراف' },
  { id: 'slope-deg', name: 'الميل بالدرجات', category: 'math', icon: MoveDiagonal, description: 'التحويل بين النسبة والدرجة' },
  { id: 'ratio-calc', name: 'التناسب والنسبة', category: 'math', icon: Scale, description: 'التناسب الطردي والعكسي' },
  { id: 'unit-price', name: 'سعر الوحدة', category: 'math', icon: Tag, description: 'مقارنة الأسعار' },
];

export function getToolsByCategory(category: ToolCategory): ToolEntry[] {
  return TOOLS.filter((t) => t.category === category);
}

export function getToolById(id: string): ToolEntry | undefined {
  return TOOLS.find((t) => t.id === id);
}

export const CATEGORY_ORDER: ToolCategory[] = [
  'area', 'volumes', 'construction', 'conversion', 'electrical', 'physics', 'math',
];
