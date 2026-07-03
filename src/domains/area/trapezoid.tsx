import { useState, useMemo } from 'react';
import { Ruler, Divide, Minus, Calculator } from 'lucide-react';
import { Card } from '../../shared/ui/card';
import { Input } from '../../shared/ui/input';
import { Button } from '../../shared/ui/button';
import { ResultCard } from '../../shared/ui/result-card';
import { useUnits } from '../../shared/hooks/use-units';
import { toFixed } from '../../shared/lib/geometry';
import type { ToolProps, CalculationData } from '../../shared/types';

function computeTrapezoid(a: number, b: number, L1: number, L2: number) {
  if (a <= 0 || b <= 0 || L1 <= 0 || L2 <= 0) return null;
  const diff = b - a;
  if (diff === 0) {
    const h = Math.sqrt(L1 * L1 - (diff / 2) * (diff / 2) || 0);
    const area = ((a + b) / 2) * h;
    const p = a + b + L1 + L2;
    return {
      height: L1,
      area,
      perimeter: p,
      diag1: Math.sqrt(a * a + L1 * L1),
      diag2: Math.sqrt(b * b + L2 * L2),
      x: 0, h: L1,
    };
  }
  const x = (diff * diff + L1 * L1 - L2 * L2) / (2 * diff);
  const hSq = L1 * L1 - x * x;
  if (hSq <= 0) return null;
  const h = Math.sqrt(hSq);
  const area = ((a + b) / 2) * h;
  const perimeter = a + b + L1 + L2;
  const diag1 = Math.sqrt((x + a) * (x + a) + h * h);
  const diag2 = Math.sqrt((b - x) * (b - x) + h * h);
  return { height: h, area, perimeter, diag1, diag2, x, h };
}

export default function Trapezoid({ onSave }: ToolProps) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ value: string; details: string } | null>(null);
  const [divMode, setDivMode] = useState<'manual' | 'auto'>('manual');
  const [divInput, setDivInput] = useState('');
  const [divResult, setDivResult] = useState<string | null>(null);
  const { formatArea } = useUnits();

  const handleInput = (key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const parsed = useMemo(() => {
    const a = parseFloat(inputs['a'] || '0');
    const b = parseFloat(inputs['b'] || '0');
    const L1 = parseFloat(inputs['L1'] || '0');
    const L2 = parseFloat(inputs['L2'] || '0');
    return { a, b, L1, L2 };
  }, [inputs]);

  const trapData = useMemo(() => computeTrapezoid(parsed.a, parsed.b, parsed.L1, parsed.L2), [parsed]);

  const calculate = () => {
    if (!trapData) return;
    const { a, b, L1, L2 } = parsed;
    const { area, perimeter, height, diag1, diag2 } = trapData;
    const details = [
      `الارتفاع (h) = ${toFixed(height)}`,
      `المساحة = ½ × (${a} + ${b}) × ${toFixed(height)} = ${toFixed(area)} م²`,
      `المحيط = ${toFixed(a)} + ${toFixed(b)} + ${toFixed(L1)} + ${toFixed(L2)} = ${toFixed(perimeter)}`,
      `القطر الأول (d₁) = ${toFixed(diag1)}`,
      `القطر الثاني (d₂) = ${toFixed(diag2)}`,
    ].join('\n');
    setResult({ value: formatArea(area), details });
    setDivResult(null);
  };

  const handleDivision = () => {
    if (!trapData) return;
    const { area, h } = trapData;
    const { a, b } = parsed;
    let parts: number[] = [];
    if (divMode === 'manual') {
      const vals = divInput.split(',').map(Number).filter((v) => v > 0);
      if (vals.length === 0) return;
      const total = vals.reduce((s, v) => s + v, 0);
      parts = vals.map((v) => (v / total) * area);
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
    }
    const lines = parts.map((p, i) => `الجزء ${i + 1}: ${formatArea(p)}`).join('\n');
    setDivResult(`${lines}\nالمجموع: ${formatArea(parts.reduce((s, v) => s + v, 0))}`);
  };

  const handleSave = () => {
    if (!result) return;
    onSave({
      toolId: 'trapezoid',
      toolName: 'مساحة شبه المنحرف',
      inputs: Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, parseFloat(v || '0')])),
      result: result.value,
      details: result.details,
      unit: 'م²',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex justify-center">
          <svg viewBox="0 0 200 120" className="h-32 w-full max-w-xs">
            {trapData ? (
              <>
                <polygon
                  points={`${40 + trapData.x},20 ${40 + trapData.x + parsed.a},20 160,100 40,100`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary"
                />
                <line x1={`${40 + trapData.x}`} y1="20" x2={`${40 + trapData.x}`} y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="4" className="text-yellow-500" />
                <text x={`${40 + trapData.x - 12}`} y="65" fontSize="11" fill="currentColor" className="fill-yellow-500">h</text>
                <text x="90" y="117" fontSize="11" fill="currentColor" textAnchor="middle">a = {parsed.a}</text>
                <text x="90" y="14" fontSize="11" fill="currentColor" textAnchor="middle">b = {parsed.b}</text>
                <text x={`${40 + trapData.x + parsed.a + 8}`} y="55" fontSize="10" fill="currentColor">L₂</text>
                <text x={`${40 + trapData.x - 12}`} y="55" fontSize="10" fill="currentColor">L₁</text>
              </>
            ) : (
              <>
                <polygon points="50,30 130,30 170,100 30,100" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30" />
                <text x="100" y="65" fontSize="12" fill="currentColor" textAnchor="middle" className="fill-white/40">أدخل القيم</text>
              </>
            )}
          </svg>
        </div>

        <Input label="القاعدة الصغرى (a)" placeholder="مثلاً 4" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['a'] || ''} onChange={(e) => handleInput('a', e.target.value)} />
        <Input label="القاعدة الكبرى (b)" placeholder="مثلاً 8" icon={<Ruler className="h-4 w-4" />} suffix="م" value={inputs['b'] || ''} onChange={(e) => handleInput('b', e.target.value)} />
        <Input label="الضلع المائل الأول (L₁)" placeholder="مثلاً 5" icon={<Minus className="h-4 w-4" />} suffix="م" value={inputs['L1'] || ''} onChange={(e) => handleInput('L1', e.target.value)} />
        <Input label="الضلع المائل الثاني (L₂)" placeholder="مثلاً 5" icon={<Minus className="h-4 w-4" />} suffix="م" value={inputs['L2'] || ''} onChange={(e) => handleInput('L2', e.target.value)} />
        <Button onClick={calculate} className="w-full mt-4">حساب</Button>
      </Card>

      {result && (
        <ResultCard
          title="النتيجة"
          result={result.value}
          details={result.details}
          onSave={handleSave}
          icon={<Calculator className="h-5 w-5" />}
        />
      )}

      {trapData && (
        <Card>
          <h3 className="mb-3 text-sm font-bold">تقسيم شبه المنحرف</h3>
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
