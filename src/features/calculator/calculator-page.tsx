import { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react';
import { History, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../shared/lib/cn';

type Op = '+' | '-' | '×' | '÷' | null;

const SCI_BTNS = [
  { label: 'sin', fn: (x: number) => Math.sin(x * Math.PI / 180) },
  { label: 'cos', fn: (x: number) => Math.cos(x * Math.PI / 180) },
  { label: 'tan', fn: (x: number) => Math.tan(x * Math.PI / 180) },
  { label: '√', fn: (x: number) => Math.sqrt(x) },
  { label: 'x²', fn: (x: number) => x * x },
  { label: '1/x', fn: (x: number) => 1 / x },
  { label: 'x³', fn: (x: number) => x * x * x },
  { label: 'π', fn: () => Math.PI },
  { label: 'e', fn: () => Math.E },
];

const KEYS = [
  ['AC', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
] as const;

const HISTORY_KEY = 'calc-history';

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [waiting, setWaiting] = useState(false);
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>(() => {
    try { return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showSci, setShowSci] = useState(true);
  const displayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = document.getElementById('main-content');
    if (!el) return;
    const prevOverflow = el.style.overflow;
    const prevPb = el.style.paddingBottom;
    const prevPt = el.style.paddingTop;
    el.style.overflow = 'hidden';
    el.style.paddingBottom = '0';
    el.style.paddingTop = '0';
    return () => {
      el.style.overflow = prevOverflow;
      el.style.paddingBottom = prevPb;
      el.style.paddingTop = prevPt;
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [display]);

  const formatNum = (n: number) => {
    const s = String(n);
    if (s.length > 12) return n.toExponential(6);
    return s;
  };

  const inputDigit = useCallback((d: string) => {
    if (waiting) { setDisplay(d); setWaiting(false); setExpression(''); }
    else setDisplay((s) => (s === '0' && d !== '.') ? d : s + d);
  }, [waiting]);

  const inputDot = useCallback(() => {
    if (waiting) { setDisplay('0.'); setWaiting(false); setExpression(''); return; }
    if (!display.includes('.')) setDisplay((s) => s + '.');
  }, [waiting, display]);

  const clear = useCallback(() => {
    setDisplay('0'); setPrev(null); setOp(null); setWaiting(false); setExpression('');
  }, []);

  const backspace = useCallback(() => {
    if (waiting) return;
    setDisplay((s) => s.length > 1 ? s.slice(0, -1) : '0');
  }, [waiting]);

  const toggleSign = useCallback(() => {
    setDisplay((s) => s.startsWith('-') ? s.slice(1) : '-' + s);
  }, []);

  const percent = useCallback(() => {
    setDisplay(formatNum(parseFloat(display) / 100)); setWaiting(true);
  }, [display]);

  const performOp = useCallback((nextOp: Op) => {
    const cur = parseFloat(display);
    if (prev === null) { setPrev(cur); setExpression(`${cur} ${nextOp}`); }
    else if (op) {
      const res = op === '+' ? prev + cur : op === '−' ? prev - cur : op === '×' ? prev * cur : cur !== 0 ? prev / cur : 0;
      setDisplay(formatNum(res)); setPrev(res); setExpression(`${formatNum(res)} ${nextOp}`);
    }
    setOp(nextOp); setWaiting(true);
  }, [display, prev, op]);

  const calculate = useCallback(() => {
    if (prev === null || op === null) return;
    const cur = parseFloat(display);
    let res = op === '+' ? prev + cur : op === '−' ? prev - cur : op === '×' ? prev * cur : cur !== 0 ? prev / cur : 0;
    const expr = `${prev} ${op} ${cur} = ${formatNum(res)}`;
    setHistory((h) => [expr, ...h].slice(0, 50));
    setDisplay(formatNum(res)); setExpression(expr);
    setPrev(null); setOp(null); setWaiting(true);
  }, [display, prev, op]);

  const sciFn = useCallback((fn: (x: number) => number) => {
    const cur = parseFloat(display);
    const res = fn(cur);
    setDisplay(formatNum(res)); setWaiting(true);
  }, [display]);

  const handleKey = useCallback((k: string) => {
    if (k === 'AC') clear();
    else if (k === '⌫') backspace();
    else if (k === '±') toggleSign();
    else if (k === '%') percent();
    else if (['+', '−', '×', '÷'].includes(k)) performOp(k as Op);
    else if (k === '=') calculate();
    else if (k === '.') inputDot();
    else inputDigit(k);
  }, [clear, backspace, toggleSign, percent, performOp, calculate, inputDot, inputDigit]);

  const isOperator = (k: string) => ['+', '−', '×', '÷'].includes(k);
  const displayValue = display;
  const isSmall = displayValue.length > 9;

  return (
    <div className="flex h-full flex-col">
      {/* History overlay */}
      {showHistory && (
        <div className="absolute inset-0 z-10 flex items-end">
          <div
            className="absolute inset-0 bg-black/20 motion-safe:animate-[fade-in_200ms_ease-out]"
            onClick={() => setShowHistory(false)}
          />
          <div
            className="relative w-full rounded-t-3xl bg-white/95 p-5 pb-8 shadow-2xl backdrop-blur-2xl motion-safe:animate-[slide-up_300ms_cubic-bezier(0.25,1,0.5,1)]
                       dark:bg-[#1c1c1e]/95"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-bold">السجل</h3>
              <div className="flex items-center gap-1">
                {history.length > 0 && (
                  <button onClick={() => setHistory([])} className="flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10">
                    <Trash2 className="h-3.5 w-3.5" /> مسح
                  </button>
                )}
                <button onClick={() => setShowHistory(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-[#8e8e93] transition-colors hover:bg-black/10 dark:hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {history.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#8e8e93]">لا يوجد سجل</div>
            ) : (
              <div className="max-h-64 space-y-0.5 overflow-y-auto">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2.5 text-left font-mono text-sm text-[#8e8e93] transition-colors hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/5"
                    dir="ltr"
                  >
                    {h}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Display */}
      <div className="flex shrink-0 flex-col justify-end px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSci(!showSci)}
              className="flex h-8 items-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold text-[#8e8e93] transition-all hover:bg-black/5 dark:hover:bg-white/10"
            >
              {showSci ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              علومي
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="flex h-8 items-center gap-1.5 rounded-xl px-3 text-[11px] font-semibold text-[#8e8e93] transition-all hover:bg-black/5 dark:hover:bg-white/10"
            >
              <History className="h-3.5 w-3.5" />
              {history.length > 0 ? `السجل (${history.length})` : 'السجل'}
            </button>
          </div>
          <div
            className={cn(
              'overflow-hidden text-left font-mono text-[11px] text-[#8e8e93]/70 transition-all dark:text-white/40',
              expression.includes('=') ? 'opacity-100' : 'opacity-0'
            )}
            dir="ltr"
          >
            {expression || '\u00A0'}
          </div>
        </div>

        <div className="mt-2 overflow-hidden rounded-2xl bg-white/50 px-5 py-4 backdrop-blur-md dark:bg-black/30">
          <div
            ref={displayRef}
            className={cn(
              'overflow-x-auto whitespace-nowrap text-left font-bold tracking-tight text-[#1c1c1e] dark:text-white scrollbar-none motion-safe:transition-[font-size] motion-safe:duration-150',
              isSmall ? 'text-[clamp(1.6rem,7.5vw,3rem)]' : 'text-[clamp(2rem,9.5vw,4rem)]'
            )}
            dir="ltr"
          >
            {displayValue}
          </div>
        </div>
      </div>

      {/* Scientific row */}
      <div
        className={cn(
          'grid shrink-0 overflow-hidden motion-safe:transition-all motion-safe:duration-250 motion-safe:ease-out-quart',
          showSci ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="min-h-0 px-4 pt-2">
          <div className="grid grid-cols-5 gap-[clamp(0.25rem,0.8vw,0.5rem)]">
            {SCI_BTNS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => sciFn(s.fn)}
                className={cn(
                  'flex h-[clamp(2.25rem,5.5vw,3rem)] items-center justify-center rounded-[clamp(0.55rem,1.6vw,0.875rem)] bg-primary/8 text-[clamp(0.7rem,2.4vw,1rem)] font-semibold text-primary/80 transition-all hover:bg-primary/15 active:scale-90',
                  showSci && 'motion-safe:animate-[fade-in_250ms_ease-out_both]'
                )}
                style={showSci ? { animationDelay: `${i * 30}ms` } : undefined}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <div className="flex flex-1 flex-col justify-center px-3 pb-2 pt-1">
        <div className="grid h-full grid-cols-4 gap-[clamp(0.5rem,1.6vw,1rem)]">
          {KEYS.flat().map((k, idx) => {
            if (!k) return null;

            let variant = 'num';
            if (k === 'AC') variant = 'clear';
            else if (k === '⌫') variant = 'clear';
            else if (k === '=') variant = 'equals';
            else if (isOperator(k)) variant = 'op';

            const cls = variant === 'clear' ? 'bg-red-500/12 text-red-500 hover:bg-red-500/20 dark:text-red-400' :
                        variant === 'op' ? 'bg-primary/12 text-primary hover:bg-primary/20' :
                        variant === 'equals' ? 'bg-primary text-white hover:bg-primary-dark' :
                        k === '0' ? 'col-span-2' : '';

            return (
              <button
                key={idx}
                onClick={() => handleKey(k)}
                className={cn(
                  'flex min-h-0 flex-1 items-center justify-center rounded-[clamp(0.85rem,2.8vw,1.5rem)] font-semibold transition-all active:scale-90',
                  'text-[clamp(1.15rem,5.5vw,2rem)] bg-white/60 text-[#1c1c1e] backdrop-blur-md hover:bg-white/90',
                  'dark:bg-white/8 dark:text-white dark:hover:bg-white/15',
                  cls,
                  variant !== 'num' && variant !== 'clear' ? 'shadow-none' : '',
                  k === '0' && 'justify-start pr-6'
                )}
              >
                {k === '×' ? <span className="text-[clamp(1.3rem,6.5vw,2.3rem)]">×</span> :
                 k === '÷' ? <span className="text-[clamp(1.3rem,6.5vw,2.3rem)]">÷</span> :
                 k === '⌫' ? <X className="h-[clamp(1.15rem,5vw,1.75rem)] w-[clamp(1.15rem,5vw,1.75rem)]" /> :
                 k}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
