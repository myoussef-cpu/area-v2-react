import type { Intent, ToolResult, ConversionResult } from './chat-types';
import { getToolById } from '../../domains/registry';
import { Geometry, toFixed } from '../../shared/lib/geometry';
import {
  AREA_UNITS, VOLUME_UNITS, LENGTH_UNITS, WEIGHT_UNITS, TEMP_UNITS,
  convertUnit, convertTemperature,
} from '../../shared/lib/units';
import { formatFeddan } from '../../shared/lib/feddan';

export function normalizeArabic(text: string): string {
  return text.trim().toLowerCase();
}

export function extractNumbers(text: string): number[] {
  const matches = [...text.matchAll(/\d+(?:[.,]\d+)?/g)];
  return matches.map(m => parseFloat(m[0].replace(',', '.')));
}

type NumParams = Record<string, number>;
type ParamExtractor = (text: string, nums: number[]) => { params: NumParams; missing?: string[] };

interface ShapeMatcher {
  keywords: string[];
  toolId: string;
  label: string;
  unitType: ToolResult['unitType'];
  paramCount: number;
  extract: ParamExtractor;
  calculate: (params: NumParams) => { value: number; details: string; primaryLabel: string };
}

const extractByKeyword = (map: Record<string, string[]>): ParamExtractor =>
  (text, nums) => {
    const params: Record<string, number> = {};
    const missing: string[] = [];
    let numIdx = 0;
    for (const [param, keywords] of Object.entries(map)) {
      const match = keywords.find(kw => text.includes(kw));
      if (match && nums[numIdx] != null) {
        params[param] = nums[numIdx++];
      }
    }
    if (Object.keys(params).length === 0 && nums.length > 0) {
      const keys = Object.keys(map);
      nums.forEach((n, i) => { if (keys[i]) params[keys[i]] = n; });
    }
    for (const key of Object.keys(map)) {
      if (!params[key] && key !== 'mode') missing.push(key);
    }
    return { params, missing: missing.length ? missing : undefined };
  };

const SHAPE_MATCHERS: ShapeMatcher[] = [
  {
    keywords: ['مثلث', 'triangle'], toolId: 'triangle', label: 'مساحة المثلث',
    unitType: 'area', paramCount: 2,
    extract: extractByKeyword({ base: ['قاعدة', 'base', 'ضلع'], height: ['ارتفاع', 'height', 'h'] }),
    calculate: ({ base, height }) => {
      const area = Geometry.triangleArea(base, height);
      return { value: area, details: `المساحة = ½ × ${base} × ${height} = ${toFixed(area)} م²`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['مستطيل', 'rectangle'], toolId: 'rectangle', label: 'مساحة المستطيل',
    unitType: 'area', paramCount: 2,
    extract: extractByKeyword({ w: ['عرض', 'width', 'w'], h: ['ارتفاع', 'طول', 'height', 'h'] }),
    calculate: ({ w, h }) => {
      const area = Geometry.rectangleArea(w, h);
      const perimeter = 2 * (w + h);
      return { value: area, details: `المساحة = ${w} × ${h} = ${toFixed(area)} م²\nالمحيط = ${toFixed(perimeter)} م`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['مربع', 'square'], toolId: 'square', label: 'مساحة المربع',
    unitType: 'area', paramCount: 1,
    extract: extractByKeyword({ side: ['ضلع', 'side', 's', 'طول'] }),
    calculate: ({ side }) => {
      const area = Geometry.squareArea(side);
      const perimeter = 4 * side;
      return { value: area, details: `المساحة = ${side}² = ${toFixed(area)} م²\nالمحيط = 4 × ${side} = ${toFixed(perimeter)} م`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['دائرة', 'circle'], toolId: 'circle-sector', label: 'مساحة الدائرة',
    unitType: 'area', paramCount: 1,
    extract: extractByKeyword({ r: ['نصف قطر', 'radius', 'r', 'قطر'] }),
    calculate: ({ r }) => {
      const area = Geometry.circleArea(r);
      const circ = Geometry.circlePerimeter(r);
      return { value: area, details: `المساحة = π × ${r}² = ${toFixed(area)} م²\nالمحيط = 2π × ${r} = ${toFixed(circ)} م`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['قطاع', 'sector'], toolId: 'circle-sector', label: 'مساحة القطاع',
    unitType: 'area', paramCount: 2,
    extract: extractByKeyword({ r: ['نصف قطر', 'radius', 'r'], angle: ['زاوية', 'angle', 'ز'] }),
    calculate: ({ r, angle }) => {
      const area = Geometry.sectorArea(r, angle);
      return { value: area, details: `مساحة القطاع = (${angle}/360) × π × ${r}² = ${toFixed(area)} م²`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['بيضاوي', 'ellipse', 'قطع ناقص'], toolId: 'circle-sector', label: 'مساحة البيضاوي',
    unitType: 'area', paramCount: 2,
    extract: extractByKeyword({ a: ['محور', 'a', 'axis'], b: ['b', 'محور ثاني'] }),
    calculate: ({ a, b }) => {
      const area = Geometry.ellipseArea(a, b);
      return { value: area, details: `المساحة = π × ${a} × ${b} = ${toFixed(area)} م²`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['شبه منحرف', 'trapezoid'], toolId: 'trapezoid', label: 'مساحة شبه المنحرف',
    unitType: 'area', paramCount: 3,
    extract: extractByKeyword({ a: ['قاعدة', 'a', 'قاعدة أولى'], b: ['b', 'قاعدة ثانية'], h: ['ارتفاع', 'height', 'h'] }),
    calculate: ({ a, b, h }) => {
      const area = Geometry.trapezoidArea(a, b, h);
      return { value: area, details: `المساحة = ((${a} + ${b}) / 2) × ${h} = ${toFixed(area)} م²`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['متوازي أضلاع', 'parallelogram'], toolId: 'parallelogram', label: 'مساحة متوازي الأضلاع',
    unitType: 'area', paramCount: 2,
    extract: extractByKeyword({ base: ['قاعدة', 'base'], height: ['ارتفاع', 'height'] }),
    calculate: ({ base, height }) => {
      const area = Geometry.parallelogramArea(base, height);
      return { value: area, details: `المساحة = ${base} × ${height} = ${toFixed(area)} م²`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['معين', 'rhombus'], toolId: 'rhombus', label: 'مساحة المعين',
    unitType: 'area', paramCount: 2,
    extract: extractByKeyword({ d1: ['قطر', 'd1', 'قطر أول'], d2: ['d2', 'قطر ثاني'] }),
    calculate: ({ d1, d2 }) => {
      const area = Geometry.rhombusArea(d1, d2);
      return { value: area, details: `المساحة = (${d1} × ${d2}) / 2 = ${toFixed(area)} م²`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['طائرة ورقية', 'kite'], toolId: 'kite', label: 'مساحة الطائرة الورقية',
    unitType: 'area', paramCount: 2,
    extract: extractByKeyword({ d1: ['قطر', 'd1', 'قطر أول'], d2: ['d2', 'قطر ثاني'] }),
    calculate: ({ d1, d2 }) => {
      const area = Geometry.kiteArea(d1, d2);
      return { value: area, details: `المساحة = (${d1} × ${d2}) / 2 = ${toFixed(area)} م²`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['حلقة', 'annulus', 'ring'], toolId: 'annulus', label: 'مساحة الحلقة',
    unitType: 'area', paramCount: 2,
    extract: extractByKeyword({ R: ['خارجي', 'R', 'outside'], r: ['داخلي', 'r', 'inside'] }),
    calculate: ({ R, r }) => {
      const area = Geometry.annulusArea(R, r);
      return { value: area, details: `المساحة = π × (${R}² - ${r}²) = ${toFixed(area)} م²`, primaryLabel: 'المساحة' };
    },
  },
  {
    keywords: ['مكعب', 'cube'], toolId: 'cube', label: 'حجم المكعب',
    unitType: 'volume', paramCount: 1,
    extract: extractByKeyword({ side: ['ضلع', 'side', 's', 'طول'] }),
    calculate: ({ side }) => {
      const volume = Geometry.cubeVolume(side);
      const surface = Geometry.cubeSurface(side);
      const diagonal = side * Math.sqrt(3);
      return { value: volume, details: `الحجم = ${side}³ = ${toFixed(volume)} م³\nالمساحة السطحية = ${toFixed(surface)} م²\nالقطر = ${toFixed(diagonal)} م`, primaryLabel: 'الحجم' };
    },
  },
  {
    keywords: ['كرة', 'sphere', 'ball'], toolId: 'volumes-3d', label: 'حجم الكرة',
    unitType: 'volume', paramCount: 1,
    extract: extractByKeyword({ r: ['نصف قطر', 'radius', 'r', 'قطر'] }),
    calculate: ({ r }) => {
      const volume = Geometry.sphereVolume(r);
      const surface = 4 * Math.PI * r * r;
      return { value: volume, details: `الحجم = 4/3 × π × ${r}³ = ${toFixed(volume)} م³\nالمساحة السطحية = 4π × ${r}² = ${toFixed(surface)} م²`, primaryLabel: 'الحجم' };
    },
  },
  {
    keywords: ['أسطوانة', 'cylinder'], toolId: 'volumes-3d', label: 'حجم الأسطوانة',
    unitType: 'volume', paramCount: 2,
    extract: extractByKeyword({ r: ['نصف قطر', 'radius', 'r'], h: ['ارتفاع', 'height', 'طول', 'h'] }),
    calculate: ({ r, h }) => {
      const volume = Geometry.cylinderVolume(r, h);
      const surface = 2 * Math.PI * r * (r + h);
      return { value: volume, details: `الحجم = π × ${r}² × ${h} = ${toFixed(volume)} م³\nالمساحة السطحية = ${toFixed(surface)} م²`, primaryLabel: 'الحجم' };
    },
  },
  {
    keywords: ['مخروط', 'cone'], toolId: 'volumes-3d', label: 'حجم المخروط',
    unitType: 'volume', paramCount: 2,
    extract: extractByKeyword({ r: ['نصف قطر', 'radius', 'r'], h: ['ارتفاع', 'height', 'h'] }),
    calculate: ({ r, h }) => {
      const volume = Geometry.coneVolume(r, h);
      return { value: volume, details: `الحجم = ⅓ × π × ${r}² × ${h} = ${toFixed(volume)} م³`, primaryLabel: 'الحجم' };
    },
  },
  {
    keywords: ['هرم', 'pyramid'], toolId: 'pyramid', label: 'حجم الهرم',
    unitType: 'volume', paramCount: 2,
    extract: extractByKeyword({ baseArea: ['قاعدة', 'base area'], height: ['ارتفاع', 'height', 'h'] }),
    calculate: ({ baseArea, height }) => {
      const volume = Geometry.pyramidVolume(baseArea, height);
      return { value: volume, details: `الحجم = ⅓ × ${baseArea} × ${height} = ${toFixed(volume)} م³`, primaryLabel: 'الحجم' };
    },
  },
  {
    keywords: ['مخروط ناقص', 'frustum'], toolId: 'frustum-cone', label: 'حجم المخروط الناقص',
    unitType: 'volume', paramCount: 3,
    extract: extractByKeyword({ r1: ['r1', 'نصف قطر سفلي', 's1', 'أسفل'], r2: ['r2', 'نصف قطر علوي', 's2', 'أعلى'], h: ['ارتفاع', 'height', 'h'] }),
    calculate: ({ r1, r2, h }) => {
      const volume = Geometry.frustumVolume(r1, r2, h);
      return { value: volume, details: `الحجم = π × ${h}/3 × (${r1}² + ${r2}² + ${r1}×${r2}) = ${toFixed(volume)} م³`, primaryLabel: 'الحجم' };
    },
  },
  {
    keywords: ['كبسولة', 'capsule'], toolId: 'capsule', label: 'حجم الكبسولة',
    unitType: 'volume', paramCount: 2,
    extract: extractByKeyword({ r: ['نصف قطر', 'radius', 'r'], h: ['طول', 'height', 'h'] }),
    calculate: ({ r, h }) => {
      const volume = Geometry.capsuleVolume(r, h);
      return { value: volume, details: `الحجم = π × ${r}² × (${h} + 4/3 × ${r}) = ${toFixed(volume)} م³`, primaryLabel: 'الحجم' };
    },
  },
  {
    keywords: ['قوة', 'force', 'نيوتن'], toolId: 'force-calc', label: 'حساب القوة',
    unitType: undefined, paramCount: 2,
    extract: extractByKeyword({ mass: ['كتلة', 'mass', 'weight', 'وزن'], accel: ['تسارع', 'accel', 'acceleration'] }),
    calculate: ({ mass, accel }) => {
      const G = 9.81;
      const a = accel || G;
      const force = mass * a;
      return { value: force, details: `F = ${mass} × ${a} = ${toFixed(force)} نيوتن\nF = ${toFixed(force / 1000)} كيلو نيوتن`, primaryLabel: 'القوة' };
    },
  },
  {
    keywords: ['أوم', 'ohm', 'ohms', 'om'], toolId: 'ohms-law', label: 'قانون أوم',
    unitType: undefined, paramCount: 2,
    extract: (_text, nums) => {
      const params: Record<string, number> = {};
      const missing: string[] = [];
      const hasV = /\b(جهد|voltage|v|فولت)\b/i.test(_text);
      const hasI = /\b(تيار|current|i|أمبير|امبير)\b/i.test(_text);
      const hasR = /\b(مقاومة|resistance|r|أوم|اوم)\b/i.test(_text);
      if (hasV && hasI && nums.length >= 2) { params.voltage = nums[0]; params.current = nums[1]; params.mode = 2; }
      else if (hasV && hasR && nums.length >= 2) { params.voltage = nums[0]; params.resistance = nums[1]; params.mode = 1; }
      else if (hasI && hasR && nums.length >= 2) { params.current = nums[0]; params.resistance = nums[1]; params.mode = 3; }
      else { nums.forEach((n, i) => { if (i === 0) params.voltage = n; if (i === 1) { params.current = n; params.mode = 2; } }); }
      if (!params.voltage && !params.current && !params.resistance) missing.push('values');
      return { params, missing: missing.length ? missing : undefined };
    },
    calculate: (params) => {
      if (params.mode === 1) {
        const i = params.voltage! / params.resistance!;
        return { value: i, details: `I = V/R = ${params.voltage}/${params.resistance} = ${toFixed(i)} A\nP = V×I = ${toFixed(params.voltage! * i)} W`, primaryLabel: 'التيار' };
      } else if (params.mode === 2) {
        const v = params.voltage!;
        const i = params.current!;
        const r = v / i;
        return { value: r, details: `R = V/I = ${v}/${i} = ${toFixed(r)} Ω\nP = V×I = ${toFixed(v * i)} W`, primaryLabel: 'المقاومة' };
      } else {
        const v = params.voltage || (params.current! * params.resistance!);
        return { value: v, details: `V = I×R = ${params.current}×${params.resistance} = ${toFixed(v)} V\nP = V×I = ${toFixed(v * params.current!)} W`, primaryLabel: 'الجهد' };
      }
    },
  },
  {
    keywords: ['فيثاغورس', 'pythagoras', 'pythagorean', 'وتر'], toolId: 'pythagoras', label: 'نظرية فيثاغورس',
    unitType: 'length', paramCount: 2,
    extract: extractByKeyword({ a: ['ضلع', 'a', 'side'], b: ['b', 'ضلع ثاني'] }),
    calculate: ({ a, b }) => {
      const hyp = Geometry.pythagoreanHyp(a, b);
      return { value: hyp, details: `الوتر = √(${a}² + ${b}²) = ${toFixed(hyp)} م`, primaryLabel: 'الوتر' };
    },
  },
  {
    keywords: ['نسبة مئوية', 'percentage', 'percent', '%'], toolId: 'percentage', label: 'النسبة المئوية',
    unitType: undefined, paramCount: 2,
    extract: (_text, nums) => {
      const params: Record<string, number> = {};
      if (nums.length >= 2) { params.a = nums[0]; params.b = nums[1]; }
      return { params, missing: nums.length < 2 ? ['القيم'] : undefined };
    },
    calculate: ({ a, b }) => {
      const r = (a / 100) * b;
      return { value: r, details: `${a}% من ${b} = (${a} ÷ 100) × ${b} = ${toFixed(r)}`, primaryLabel: 'الناتج' };
    },
  },
  {
    keywords: ['سرعة', 'speed', 'velocity', 'مسافة', 'distance', 'زمن', 'time'], toolId: 'speed-dist', label: 'السرعة والمسافة والزمن',
    unitType: undefined, paramCount: 2,
    extract: (_text, nums) => {
      const params: Record<string, number> = {};
      const hasDist = /(مسافة|distance|d)/i.test(_text);
      const hasSpeed = /(سرعة|speed|s|velocity|v)/i.test(_text);
      const hasTime = /(زمن|time|t)/i.test(_text);
      if (hasDist && hasTime && nums.length >= 2) { params.distance = nums[0]; params.time = nums[1]; }
      else if (hasDist && hasSpeed && nums.length >= 2) { params.distance = nums[0]; params.speed = nums[1]; }
      else if (hasSpeed && hasTime && nums.length >= 2) { params.speed = nums[0]; params.time = nums[1]; }
      else { nums.forEach((n, i) => { if (i === 0) params.distance = n; if (i === 1) params.time = n; }); }
      return { params, missing: nums.length < 2 ? ['القيم'] : undefined };
    },
    calculate: (params) => {
      if (params.speed && params.time && !params.distance) {
        const d = params.speed * params.time;
        return { value: d, details: `المسافة = ${params.speed} × ${params.time} = ${toFixed(d)} م`, primaryLabel: 'المسافة' };
      } else if (params.distance && params.time && !params.speed) {
        const s = params.distance / params.time;
        return { value: s, details: `السرعة = ${params.distance} ÷ ${params.time} = ${toFixed(s)} م/ث`, primaryLabel: 'السرعة' };
      } else {
        return { value: params.distance! / params.speed!, details: `الزمن = ${params.distance} ÷ ${params.speed} = ${toFixed(params.distance! / params.speed!)} ث`, primaryLabel: 'الزمن' };
      }
    },
  },
];

function findShapeMatch(text: string): { match: ShapeMatcher; params: Record<string, number>; missing?: string[] } | null {
  const normalized = normalizeArabic(text);
  const nums = extractNumbers(text);

  for (const matcher of SHAPE_MATCHERS) {
    const hasKeyword = matcher.keywords.some(kw => normalized.includes(kw));
    if (!hasKeyword) continue;
    const { params, missing } = matcher.extract(normalized, nums);
    return { match: matcher, params, missing };
  }
  return null;
}

const UNIT_GROUP_NAMES: Record<string, string> = {
  m2: 'متر مربع', ft2: 'قدم مربع', feddan: 'فدان', km2: 'كيلومتر مربع',
  m3: 'متر مكعب', liter: 'لتر', ft3: 'قدم مكعب',
  m: 'متر', ft: 'قدم', inch: 'بوصة', cm: 'سنتيمتر', km: 'كيلومتر',
  kg: 'كيلوغرام', lb: 'رطل', ton: 'طن', g: 'غرام',
  celsius: 'سليزيوس', fahrenheit: 'فهرنهايت',
};

const UNIT_GROUPS: Record<string, Record<string, { factor: number; special?: boolean }>> = {
  area: AREA_UNITS, volume: VOLUME_UNITS, length: LENGTH_UNITS,
  weight: WEIGHT_UNITS, temperature: TEMP_UNITS,
};

function matchConversionIntent(text: string): { fromUnit: string; toUnit: string; value: number } | null {
  const normalized = normalizeArabic(text);
  const nums = extractNumbers(text);
  if (nums.length === 0) return null;

  const allUnits = Object.entries(UNIT_GROUP_NAMES);
  const found: string[] = [];
  for (const [id, names] of allUnits) {
    if (normalized.includes(id) || normalized.includes(names)) found.push(id);
  }

  const toKeyword = /\b(الى|إلى|to|في|ل)\b/i.exec(normalized);
  if (found.length >= 2 && toKeyword) {
    const before = normalized.slice(0, toKeyword.index).trim();
    const after = normalized.slice(toKeyword.index + toKeyword[0].length).trim();
    const beforeMatch = found.find(u => before.includes(u) || before.includes(UNIT_GROUP_NAMES[u]));
    const afterMatch = found.find(u => after.includes(u) || after.includes(UNIT_GROUP_NAMES[u]) && u !== beforeMatch);
    if (beforeMatch && afterMatch) return { fromUnit: beforeMatch, toUnit: afterMatch, value: nums[0] };
  }

  if (found.length >= 2) {
    return { fromUnit: found[0], toUnit: found[1], value: nums[0] };
  }

  if (found.length === 1) {
    const unitGroup = Object.entries(UNIT_GROUPS).find(([, us]) => found[0] in us)?.[0];
    if (unitGroup) {
      const groupUnits = Object.keys(UNIT_GROUPS[unitGroup]);
      const otherUnit = groupUnits.find(u => u !== found[0]);
      if (otherUnit) return { fromUnit: found[0], toUnit: otherUnit, value: nums[0] };
    }
  }

  return null;
}

function matchGeneralIntent(text: string): Intent | null {
  const normalized = normalizeArabic(text);
  const nums = extractNumbers(text);

  if (/(متوسط|average|mean|avg)/i.test(normalized) && nums.length >= 1) {
    return { toolId: 'avg-calc', params: { values: nums[0] }, isConversion: false };
  }
  if (/(نسبة|ratio|تناسب)/i.test(normalized) && nums.length >= 2) {
    return { toolId: 'ratio-calc', params: { a: nums[0], b: nums[1] }, isConversion: false };
  }
  if (/(ميل|slope|درجة|degree)/i.test(normalized) && nums.length >= 1) {
    return { toolId: 'slope-deg', params: { value: nums[0] }, isConversion: false };
  }
  if (/(خرسانة|concrete)/i.test(normalized) && nums.length >= 3) {
    return { toolId: 'concrete-calc', params: { l: nums[0], w: nums[1], t: nums[2] }, isConversion: false };
  }
  if (/(قدرة|power|elec)/i.test(normalized) && nums.length >= 2) {
    return { toolId: 'elec-power', params: { voltage: nums[0], current: nums[1] }, isConversion: false };
  }
  if (/(طوب|brick)/i.test(normalized) && nums.length >= 1) {
    return { toolId: 'bricks-calc', params: { area: nums[0] }, isConversion: false };
  }
  if (/(دهان|paint)/i.test(normalized) && nums.length >= 2) {
    return { toolId: 'paint-calc', params: { length: nums[0], width: nums[1] }, isConversion: false };
  }

  return null;
}

export function matchIntent(text: string): Intent | null {
  const normalized = normalizeArabic(text);

  const conversionMatch = matchConversionIntent(normalized);
  if (conversionMatch) {
    return {
      toolId: 'unitConverter',
      params: { value: conversionMatch.value, from: conversionMatch.fromUnit, to: conversionMatch.toUnit },
      isConversion: true,
      conversionTo: conversionMatch.toUnit,
    };
  }

  if (/\b(تحويل|convert|حول|تحويلات|conversion|to )\b/i.test(normalized)) {
    const m = matchConversionIntent(normalized);
    if (m) {
      return {
        toolId: 'unitConverter',
        params: { value: m.value, from: m.fromUnit, to: m.toUnit },
        isConversion: true,
        conversionTo: m.toUnit,
      };
    }
  }

  const shapeMatch = findShapeMatch(normalized);
  if (shapeMatch) {
    return {
      toolId: shapeMatch.match.toolId,
      params: shapeMatch.params,
      isConversion: false,
      missing: shapeMatch.missing,
    };
  }

  if (/\b(area|مساحة|volume|حجم)\b/.test(normalized)) {
    const nums = extractNumbers(text);
    if (nums.length >= 2) {
      return { toolId: 'triangle', params: { base: nums[0], height: nums[1] }, isConversion: false };
    }
  }

  const generalMatch = matchGeneralIntent(normalized);
  if (generalMatch) return generalMatch;

  return null;
}

function formatResultLabel(_toolId: string, value: number, unitType?: ToolResult['unitType']): string {
  if (unitType === 'area') {
    if (value >= 4200) return `${toFixed(value)} م² (${formatFeddan(value)})`;
    return `${toFixed(value)} م²`;
  }
  if (unitType === 'volume') return `${toFixed(value)} م³`;
  if (unitType === 'length') return `${toFixed(value)} م`;
  return `${toFixed(value)}`;
}

function toNumParams(params: Record<string, number | string>): NumParams {
  const result: NumParams = {};
  for (const [key, val] of Object.entries(params)) {
    if (typeof val === 'number') result[key] = val;
  }
  return result;
}

async function executeShapeIntent(intent: Intent): Promise<ToolResult> {
  const shapeMatch = SHAPE_MATCHERS.find(m => m.toolId === intent.toolId);
  if (!shapeMatch) throw new Error(`No matcher for tool: ${intent.toolId}`);

  const { value, details, primaryLabel } = shapeMatch.calculate(toNumParams(intent.params));
  const toolDef = getToolById(intent.toolId);

  return {
    toolId: intent.toolId,
    toolName: toolDef?.name || shapeMatch.label,
    params: intent.params,
    summary: formatResultLabel(intent.toolId, value, shapeMatch.unitType),
    details,
    primaryValue: value,
    primaryLabel,
    unitType: shapeMatch.unitType,
  };
}

async function executeConversionIntent(intent: Intent): Promise<ConversionResult> {
  const value = Number(intent.params.value) || 0;
  const fromUnit = String(intent.params.from || '');
  const toUnit = String(intent.params.to || '');

  let converted: number;
  let details: string;

  const tempUnits = Object.keys(TEMP_UNITS);
  if (tempUnits.includes(fromUnit) && tempUnits.includes(toUnit)) {
    converted = convertTemperature(value, fromUnit, toUnit);
    details = `${value} ${UNIT_GROUP_NAMES[fromUnit] || fromUnit} = ${toFixed(converted)} ${UNIT_GROUP_NAMES[toUnit] || toUnit}`;
  } else {
    const allGroup = { ...AREA_UNITS, ...VOLUME_UNITS, ...LENGTH_UNITS, ...WEIGHT_UNITS };
    const fromDef = allGroup[fromUnit as keyof typeof allGroup];
    const toDef = allGroup[toUnit as keyof typeof allGroup];

    if (fromDef && toDef) {
      if (toUnit === 'feddan' && fromUnit !== 'feddan') {
        const valInM2 = value / (fromDef as { factor: number }).factor;
        const feddanResult = formatFeddan(valInM2);
        converted = valInM2 / 4200.833;
        details = `${value} ${fromDef.label} = ${feddanResult}`;
      } else {
        converted = convertUnit(value, fromDef.factor, toDef.factor);
        details = `${value} ${fromDef.label} = ${toFixed(converted)} ${toDef.label}`;
      }
    } else {
      converted = value;
      details = `تحويل ${value} ${fromUnit} إلى ${toUnit}`;
    }
  }

  return {
    kind: 'conversion',
    toolId: 'unitConverter',
    toolName: 'تحويل الوحدات',
    params: intent.params,
    summary: `${toFixed(converted)} ${UNIT_GROUP_NAMES[toUnit] || toUnit}`,
    details,
    primaryValue: converted,
    unitType: undefined,
    convertedFrom: fromUnit,
    convertedTo: toUnit,
    convertedValue: converted,
  };
}

async function executeGeneralIntent(intent: Intent): Promise<ToolResult> {
  const toolId = intent.toolId;
  const np = toNumParams(intent.params);

  if (toolId === 'avg-calc') {
    return { toolId, toolName: 'المتوسط الحسابي', params: intent.params, summary: `${np.values}`, details: 'حساب المتوسط', primaryValue: np.values, unitType: undefined };
  }
  if (toolId === 'ratio-calc') {
    const r = np.a / np.b;
    return { toolId, toolName: 'التناسب والنسبة', params: intent.params, summary: `${np.a}:${np.b} = ${toFixed(r)}`, details: `النسبة = ${np.a} ÷ ${np.b} = ${toFixed(r)}`, primaryValue: r, unitType: undefined };
  }
  if (toolId === 'slope-deg') {
    return { toolId, toolName: 'الميل بالدرجات', params: intent.params, summary: `${np.value}°`, details: `القيمة: ${np.value}°`, primaryValue: np.value, unitType: undefined };
  }
  if (toolId === 'concrete-calc') {
    const volume = np.l * np.w * np.t;
    return { toolId, toolName: 'كميات الخرسانة', params: intent.params, summary: `${toFixed(volume)} م³`, details: `الحجم = ${np.l} × ${np.w} × ${np.t} = ${toFixed(volume)} م³`, primaryValue: volume, unitType: 'volume' };
  }
  if (toolId === 'elec-power') {
    const power = np.voltage * np.current;
    return { toolId, toolName: 'القدرة الكهربائية', params: intent.params, summary: `${toFixed(power)} W`, details: `P = ${np.voltage} × ${np.current} = ${toFixed(power)} واط`, primaryValue: power, unitType: undefined };
  }

  throw new Error(`Unknown general tool: ${toolId}`);
}

export async function executeIntent(intent: Intent): Promise<ToolResult | ConversionResult> {
  if (intent.isConversion) {
    return executeConversionIntent(intent);
  }

  const shapeMatch = SHAPE_MATCHERS.find(m => m.toolId === intent.toolId);
  if (shapeMatch) {
    return executeShapeIntent(intent);
  }

  return executeGeneralIntent(intent);
}
