import { useState, useMemo } from 'react';
import { Ruler, Divide, Minus, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { useShapeCapture } from '../../shared/hooks/use-shape-capture';
import { toFixed } from '../../shared/lib/geometry';
import { TrapSVG } from '../../shared/lib/shapes';
import { usePendingSave } from '../../shared/store/pending-save-store';
import type { ToolProps } from '../../shared/types';
import { useToolInitializer } from '../../shared/hooks/use-tool-initializer';

type Mode = 'sides' | 'height';

function computeBySides(a: number, b: number, L1: number, L2: number) {
  if (a <= 0 || b <= 0 || L1 <= 0 || L2 <= 0) return null;
  const diff = b - a;
  if (diff === 0) {
    const h = L1;
    const area = ((a + b) / 2) * h;
    return { height: h, area, perimeter: a + b + L1 + L2, diag1: Math.sqrt(a * a + L1 * L1), diag2: Math.sqrt(b * b + L2 * L2), x: 0, h };
  }
  const x = (diff * diff + L1 * L1 - L2 * L2) / (2 * diff);
  const hSq = L1 * L1 - x * x;
  if (hSq <= 0) return null;
  const h = Math.sqrt(hSq);
  const area = ((a + b) / 2) * h;
  return { height: h, area, perimeter: a + b + L1 + L2, diag1: Math.sqrt((x + a) * (x + a) + h * h), diag2: Math.sqrt((b - x) * (b - x) + h * h), x, h };
}

function computeByHeight(a: number, b: number, h: number) {
  if (a <= 0 || b <= 0 || h <= 0) return null;
  const area = ((a + b) / 2) * h;
  const diff = b - a;
  const x = diff / 2;
  const L1 = Math.sqrt(x * x + h * h);
  const L2 = L1;
  return { height: h, area, perimeter: a + b + L1 + L2, diag1: Math.sqrt((x + a) * (x + a) + h * h), diag2: Math.sqrt((b - x) * (b - x) + h * h), x, h, L1, L2 };
}

export default function Trapezoid({ onSave, initialValues }: ToolProps) {
  const [mode, setMode] = useState<Mode>('sides');
  const initInputs = useToolInitializer(initialValues);
  const [inputs, setInputs] = useState<Record<string, string>>(initInputs);
  const [result, setResult] = useState<{ value: string; details: string; rawValue?: number } | null>(null);
  const [divMode, setDivMode] = useState<'manual' | 'auto'>('manual');
  const [divInput, setDivInput] = useState('');
  const [divResult, setDivResult] = useState<string | null>(null);
  const [divBoundaries, setDivBoundaries] = useState<number[]>([]);
  const [divDir, setDivDir] = useState<'x' | 'y'>('y');
  const { formatArea } = useUnits();
  const { shapeRef, capture } = useShapeCapture();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const parsed = useMemo(() => {
    const a = parseFloat(inputs['a'] || '0');
    const b = parseFloat(inputs['b'] || '0');
    const L1 = parseFloat(inputs['L1'] || '0');
    const L2 = parseFloat(inputs['L2'] || '0');
    const h = parseFloat(inputs['h'] || '0');
    return { a, b, L1, L2, h };
  }, [inputs]);

  const trapData = useMemo(() => {
    if (mode === 'sides') return computeBySides(parsed.a, parsed.b, parsed.L1, parsed.L2);
    return computeByHeight(parsed.a, parsed.b, parsed.h);
  }, [mode, parsed]);

  const calculate = () => {
    if (!trapData) return;
    const { a, b, L1, L2, h } = parsed;
    const td = trapData;
    if (mode === 'sides') {
      const details = [
        `الارتفاع (h) = ${toFixed(td.height)}`,
        `المساحة = ½ × (${a} + ${b}) × ${toFixed(td.height)} = ${toFixed(td.area)} م²`,
        `المحيط = ${toFixed(a)} + ${toFixed(b)} + ${toFixed(L1)} + ${toFixed(L2)} = ${toFixed(td.perimeter)}`,
        `القطر الأول (d₁) = ${toFixed(td.diag1)}`,
        `القطر الثاني (d₂) = ${toFixed(td.diag2)}`,
      ].join('\n');
      const __v = formatArea(td.area);
      setResult({ value: __v, details, rawValue: td.area });
      usePendingSave.getState().set({
        toolId: 'trapezoid',
        toolName: 'مساحة شبه المنحرف',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details,
        unit: 'م²',
        image: capture(),
        timestamp: Date.now(),
      });
    } else {
      const details = [
        `المساحة = ½ × (${a} + ${b}) × ${h} = ${toFixed(td.area)} م²`,
        `المحيط = ${toFixed(a)} + ${toFixed(b)} + ${toFixed(td.L1)} + ${toFixed(td.L2)} = ${toFixed(td.perimeter)}`,
        `الضلع المائل = ${toFixed(td.L1)}`,
      ].join('\n');
      const __v = formatArea(td.area);
      setResult({ value: __v, details, rawValue: td.area });
      usePendingSave.getState().set({
        toolId: 'trapezoid',
        toolName: 'مساحة شبه المنحرف',
        inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
        result: __v,
        details,
        unit: 'م²',
        image: capture(),
        timestamp: Date.now(),
      });
    }
    if (divResult) {
      const pendingExtra = `\n\n--- تقسيم شبه المنحرف ---\n${divResult}`;
      usePendingSave.getState().set((p) => p ? { ...p, details: p.details + pendingExtra } : p);
    }
  };

  const handleDivision = () => {
    if (!trapData) return;
    const { area, h } = trapData;
    const { a, b } = parsed;
    const x0 = trapData.x;
    let parts: number[] = [];
    const bounds: number[] = [];

    const cumXArea = (xPos: number): number => {
      const nSteps = 100; const dy = h / nSteps; let aSum = 0;
      for (let j = 0; j < nSteps; j++) {
        const y = (j + 0.5) * dy;
        const xL = x0 * (y / h), xR = b + (x0 + a - b) * (y / h);
        const sL = Math.max(0, xL), sR = Math.min(xPos, xR);
        if (sR > sL) aSum += (sR - sL) * dy;
      }
      return aSum;
    };
    const findXForCum = (target: number): number => {
      let lo = 0, hi = b;
      for (let it = 0; it < 100; it++) {
        const mid = (lo + hi) / 2;
        if (cumXArea(mid) < target) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    };
    const stripAreasX = (): number[] => {
      const n = parseInt(divInput || '2', 10);
      if (n < 2) return [];
      const xStops: number[] = [0];
      for (let i = 1; i <= n; i++) xStops.push(i * b / n);
      return xStops.slice(0, -1).map((xs, i) => {
        const xE = xStops[i + 1]; let aSum = 0;
        for (let j = 0; j < 100; j++) {
          const y = (j + 0.5) * (h / 100);
          const xL = x0 * (y / h), xR = b + (x0 + a - b) * (y / h);
          const sL = Math.max(xs, xL), sR = Math.min(xE, xR);
          if (sR > sL) aSum += (sR - sL) * (h / 100);
        }
        return aSum;
      });
    };

    if (divDir === 'x') {
      if (divMode === 'manual') {
        const vals = divInput.split(',').map(Number).filter((v) => v > 0);
        if (vals.length === 0) return;
        const total = vals.reduce((s, v) => s + v, 0);
        parts = vals.map((v) => (v / total) * area);
        let cum = 0;
        for (let i = 0; i < parts.length - 1; i++) {
          cum += parts[i];
          bounds.push(findXForCum(cum));
        }
      } else {
        parts = stripAreasX();
        if (parts.length < 2) return;
        const n = parseInt(divInput || '2', 10);
        for (let i = 1; i < n; i++) bounds.push(i * b / n);
      }
    } else {
      if (divMode === 'manual') {
        const vals = divInput.split(',').map(Number).filter((v) => v > 0);
        if (vals.length === 0) return;
        const total = vals.reduce((s, v) => s + v, 0);
        parts = vals.map((v) => (v / total) * area);
        let cum = 0;
        for (let i = 0; i < parts.length - 1; i++) {
          cum += parts[i];
          const target = cum;
          if (Math.abs(b - a) < 0.001) {
            bounds.push(target / a);
          } else {
            const A = (b - a) / (2 * h);
            const B = a;
            const C = -target;
            const disc = B * B - 4 * A * C;
            if (disc >= 0) bounds.push((-B + Math.sqrt(disc)) / (2 * A));
          }
        }
      } else {
        const n = parseInt(divInput || '2', 10);
        if (n < 2) return;
        const stripH = h / n;
        for (let i = 0; i < n; i++) {
          const y1 = i * stripH;
          const y2 = (i + 1) * stripH;
          const w1 = a + (b - a) * (y1 / h);
          const w2 = a + (b - a) * (y2 / h);
          parts.push(((w1 + w2) / 2) * stripH);
        }
        for (let i = 1; i < n; i++) bounds.push(i * stripH);
      }
    }
    const divLines = parts.map((p, i) => `الجزء ${i + 1}: ${formatArea(p)}`).join('\n');
    const divText = `${divLines}\nالمجموع: ${formatArea(parts.reduce((s, v) => s + v, 0))}`;
    setDivResult(divText);
    setDivBoundaries(bounds);
    const mainResult = result?.value || formatArea(trapData.area);
    const mainDetails = result?.details || `المساحة = ${mainResult} م²`;
    const combined = mainDetails + `\n\n--- تقسيم شبه المنحرف ---\n${divText}`;
    usePendingSave.getState().set({
      toolId: 'trapezoid',
      toolName: 'مساحة شبه المنحرف',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: mainResult,
      details: combined,
      unit: 'م²',
      image: capture(),
      timestamp: Date.now(),
    });
  };

  const handleSave = () => {
    if (!result) return;
    const extra = divResult ? `\n\n--- تقسيم شبه المنحرف ---\n${divResult}` : '';
    const data = {
      toolId: 'trapezoid',
      toolName: 'مساحة شبه المنحرف',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: result.value,
      details: result.details + extra,
      unit: 'م²',
      image: capture(),
      timestamp: Date.now(),
    };
    onSave(data);
    usePendingSave.getState().set(data);
  };

  const svgProps = useMemo(() => {
    const base = divBoundaries.length > 0 ? { divBoundaries, divDir } : { divDir };
    if (mode === 'sides') {
      if (!trapData) return { a: 4, b: 8, h: 4, x: 2, L1: 5, L2: 5, ...base };
      return { a: parsed.a, b: parsed.b, h: trapData.h, x: trapData.x, L1: parsed.L1, L2: parsed.L2, ...base };
    }
    if (!trapData) return { a: 4, b: 8, h: 4, x: 2, L1: 5, L2: 5, ...base };
    return { a: parsed.a, b: parsed.b, h: trapData.h, x: trapData.x, L1: trapData.L1, L2: trapData.L2, ...base };
  }, [mode, trapData, parsed, divBoundaries, divDir]);

  return (
    <div className="space-y-4">
      <Card>
        <div ref={shapeRef} className="mb-4 flex justify-center">
          <TrapSVG {...svgProps} />
        </div>

        <div className="mb-4 flex gap-2">
          <Button variant={mode === 'sides' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('sides')}>بالضلعين المائلين</Button>
          <Button variant={mode === 'height' ? 'primary' : 'secondary'} size="sm" onClick={() => setMode('height')}>بالارتفاع</Button>
        </div>

        <Input label="القاعدة الصغرى (a)" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} />
        <Input label="القاعدة الكبرى (b)" placeholder="مثلاً 8" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} />
        {mode === 'sides' ? (
          <>
            <Input label="الضلع المائل الأول (L₁)" placeholder="مثلاً 5" icon={<Minus className="h-4 w-4" />} suffix="م" value={inputs['L1'] || ''} onChange={(e) => handleInput('L1', e.target.value)} />
            <Input label="الضلع المائل الثاني (L₂)" placeholder="مثلاً 5" icon={<Minus className="h-4 w-4" />} suffix="م" value={inputs['L2'] || ''} onChange={(e) => handleInput('L2', e.target.value)} />
          </>
        ) : (
          <Input label="الارتفاع (h)" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['h'] || ''} onChange={(e) => handleInput('h', e.target.value)} />
        )}
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>

      {result && (
        <ResultCard
          title="النتيجة"
          result={result.value}
          details={result.details}
          rawValue={result.rawValue}
          unitType="area"
          onSave={handleSave}
          icon={<Calculator className="h-5 w-5" />}
        />
      )}

      {trapData && (
        <Card>
          <h3 className="mb-3 text-sm font-bold">تقسيم شبه المنحرف</h3>
          <div className="mb-2 flex gap-2">
            <Button variant={divDir === 'y' ? 'primary' : 'secondary'} size="sm" onClick={() => setDivDir('y')}> Y (أفقي)</Button>
            <Button variant={divDir === 'x' ? 'primary' : 'secondary'} size="sm" onClick={() => setDivDir('x')}> X (عمودي)</Button>
          </div>
          <div className="mb-3 flex gap-2">
            <Button variant={divMode === 'manual' ? 'primary' : 'secondary'} size="sm" onClick={() => setDivMode('manual')}>يدوي</Button>
            <Button variant={divMode === 'auto' ? 'primary' : 'secondary'} size="sm" onClick={() => setDivMode('auto')}>تلقائي</Button>
          </div>
          {divMode === 'manual' ? (
            <Input label="المساحات المطلوبة (مفصولة بفواصل)" placeholder="مثلاً 10,20,15" icon={<Divide className="h-4 w-4" />} suffix="م²" value={divInput} onChange={(e) => setDivInput(e.target.value)} />
          ) : (
            <Input label="عدد الأجزاء المتساوية" placeholder="مثلاً 3" icon={<Divide className="h-4 w-4" />} value={divInput} onChange={(e) => setDivInput(e.target.value)} />
          )}
          <Button onClick={handleDivision} variant="secondary" className="w-full">تقسيم</Button>
          {divResult && (
            <pre className="mt-3 whitespace-pre-line rounded-xl bg-black/3 p-3 text-sm dark:bg-white/5">{divResult}</pre>
          )}
        </Card>
      )}
    </div>
  );
}
