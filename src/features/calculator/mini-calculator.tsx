import { useState, useRef, useCallback, useEffect } from 'react';
import { Calculator, X, GripHorizontal } from 'lucide-react';
import { cn } from '../../shared/lib/cn';

type Op = '+' | '-' | '×' | '÷' | null;

const KEYS = [
  ['AC', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
] as const;

export function MiniCalculator() {
  const [showPanel, setShowPanel] = useState(false);
  const [closing, setClosing] = useState(false);
  const [fabHidden, setFabHidden] = useState(false);
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [waiting, setWaiting] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 160 });
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const fabDragRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const mountedRef = useRef(false);

  useEffect(() => {
    const y = window.innerHeight - 200;
    setPosition((p) => ({ ...p, y }));
    mountedRef.current = true;
  }, []);

  const applyPos = (el: HTMLElement, x: number, y: number) => {
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  };

  const openPanel = useCallback(() => {
    setFabHidden(true);
    setTimeout(() => setShowPanel(true), 180);
  }, []);

  const closePanel = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setShowPanel(false);
      setClosing(false);
      setFabHidden(false);
    }, 250);
  }, []);

  const inputDigit = useCallback((d: string) => {
    if (waiting) { setDisplay(d); setWaiting(false); }
    else setDisplay((s) => (s === '0' ? d : s + d));
  }, [waiting]);

  const inputDot = useCallback(() => {
    if (waiting) { setDisplay('0.'); setWaiting(false); return; }
    if (!display.includes('.')) setDisplay((s) => s + '.');
  }, [waiting, display]);

  const clear = useCallback(() => {
    setDisplay('0'); setPrev(null); setOp(null); setWaiting(false);
  }, []);

  const backspace = useCallback(() => {
    if (waiting) return;
    setDisplay((s) => s.length > 1 ? s.slice(0, -1) : '0');
  }, [waiting]);

  const performOp = useCallback((nextOp: Op) => {
    const cur = parseFloat(display);
    if (prev === null) { setPrev(cur); }
    else if (op) {
      const res = op === '+' ? prev + cur : op === '-' ? prev - cur : op === '×' ? prev * cur : op === '÷' ? (cur !== 0 ? prev / cur : 0) : cur;
      setDisplay(String(res)); setPrev(res);
    }
    setOp(nextOp); setWaiting(true);
  }, [display, prev, op]);

  const calculate = useCallback(() => {
    if (prev === null || op === null) return;
    const cur = parseFloat(display);
    let res = op === '+' ? prev + cur : op === '-' ? prev - cur : op === '×' ? prev * cur : op === '÷' ? (cur !== 0 ? prev / cur : 0) : cur;
    setDisplay(String(res)); setPrev(null); setOp(null); setWaiting(true);
  }, [display, prev, op]);

  const handleKey = useCallback((k: string) => {
    if (k === 'AC') clear();
    else if (k === '⌫') backspace();
    else if (['+', '-', '×', '÷'].includes(k)) performOp(k as Op);
    else if (k === '=') calculate();
    else if (k === '.') inputDot();
    else inputDigit(k);
  }, [clear, backspace, performOp, calculate, inputDot, inputDigit]);

  const onDragDown = (el: HTMLElement, cx: number, cy: number) => {
    const rect = el.getBoundingClientRect();
    offsetRef.current = { x: cx - rect.left, y: cy - rect.top };
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      applyPos(el, cx - offsetRef.current.x, cy - offsetRef.current.y);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      const s = getComputedStyle(el);
      setPosition({ x: parseFloat(s.left), y: parseFloat(s.top) });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onUp);
  };

  const onFabDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingRef.current = false;
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { x: cx, y: cy };
    const el = fabDragRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    offsetRef.current = { x: cx - rect.left, y: cy - rect.top };
    const onMove = (ev: MouseEvent | TouchEvent) => {
      const mx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      const my = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      const dx = mx - dragStartRef.current.x;
      const dy = my - dragStartRef.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDraggingRef.current = true;
      applyPos(el, mx - offsetRef.current.x, my - offsetRef.current.y);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
      const s = getComputedStyle(el);
      setPosition({ x: parseFloat(s.left), y: parseFloat(s.top) });
      if (!isDraggingRef.current) openPanel();
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onUp);
  };

  const isOperator = (k: string) => ['+', '-', '×', '÷'].includes(k);

  return (
    <>
      {/* FAB */}
      <div
        ref={fabDragRef}
        onMouseDown={onFabDown}
        onTouchStart={onFabDown}
        className={cn(
          'fixed z-40 cursor-grab active:cursor-grabbing',
          mountedRef.current && (fabHidden ? 'animate-fab-hide pointer-events-none' : 'animate-fab-show')
        )}
        style={{ left: position.x, top: position.y, touchAction: 'none' }}
      >
        <button className="pointer-events-none flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
          <Calculator className="h-5 w-5" />
        </button>
      </div>

      {/* Panel */}
      {showPanel && (
        <div
          ref={dragRef}
          onMouseDown={(e) => { if (e.target === dragRef.current || (e.target as HTMLElement).closest('.drag-handle')) return; }}
          className={cn(
            'fixed z-50 w-64 origin-top-right select-none rounded-3xl border border-white/30 bg-[rgba(255,255,255,0.9)] p-4 shadow-2xl backdrop-blur-2xl',
            'dark:border-white/8 dark:bg-[rgba(24,24,27,0.92)]',
            closing ? 'animate-calc-close pointer-events-none' : 'animate-calc-open'
          )}
          style={{ left: position.x, top: position.y, touchAction: 'none' }}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={closePanel}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8e8e93] transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <span />
            <div
              onMouseDown={(e) => { e.stopPropagation(); onDragDown(dragRef.current!, e.clientX, e.clientY); }}
              onTouchStart={(e) => { e.stopPropagation(); onDragDown(dragRef.current!, e.touches[0].clientX, e.touches[0].clientY); }}
              className="drag-handle flex h-7 w-7 cursor-grab items-center justify-center rounded-lg text-[#8e8e93] hover:bg-black/10 dark:hover:bg-white/10 active:cursor-grabbing"
            >
              <GripHorizontal className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mb-3 overflow-hidden rounded-2xl bg-white/60 px-4 py-3 dark:bg-black/40">
            <div className="text-left font-mono text-2xl font-bold dark:text-white" dir="ltr">
              {display}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {KEYS.flat().map((k, idx) => {
              if (!k) return null;
              let variant = 'num';
              if (k === 'AC') variant = 'clear';
              else if (k === '⌫') variant = 'clear';
              else if (k === '=') variant = 'equals';
              else if (isOperator(k)) variant = 'op';
              const cls = variant === 'clear' ? 'bg-red-500/15 text-red-500 hover:bg-red-500/25 dark:text-red-400' :
                          variant === 'op' ? 'bg-primary/15 text-primary hover:bg-primary/25' :
                          variant === 'equals' ? 'bg-primary text-white' :
                          k === '0' ? 'col-span-2' : '';
              return (
                <button
                  key={idx}
                  onClick={() => handleKey(k)}
                  className={cn(
                    'flex h-12 items-center justify-center rounded-xl text-base font-semibold transition-all active:scale-90',
                    'bg-white/60 text-[#1c1c1e] backdrop-blur-md hover:bg-white/85',
                    'dark:bg-white/8 dark:text-white dark:hover:bg-white/15',
                    cls
                  )}
                >
                  {k === '×' ? <span className="text-lg">×</span> :
                   k === '÷' ? <span className="text-lg">÷</span> :
                   k === '⌫' ? <X className="h-4 w-4" /> : k}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
