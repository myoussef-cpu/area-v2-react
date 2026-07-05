import { useState, useRef, useEffect, useCallback } from 'react';
import { toFixed } from './geometry';

type Pt = [number, number];

class TForm {
  s: number;
  ox: number;
  oy: number;
  ch: number;
  constructor(cw: number, ch: number, pts: Pt[], pad = 40) {
    this.ch = ch;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const mnX = Math.min(...xs), mxX = Math.max(...xs);
    const mnY = Math.min(...ys), mxY = Math.max(...ys);
    const sw = Math.max(mxX - mnX, 1), sh = Math.max(mxY - mnY, 1);
    const dw = cw - pad * 2, dh = ch - pad * 2;
    this.s = Math.min(dw / sw, dh / sh);
    const scW = sw * this.s, scH = sh * this.s;
    this.ox = pad + (dw - scW) / 2 - mnX * this.s;
    this.oy = pad + (dh - scH) / 2 - mnY * this.s;
  }
  x(p: Pt): number { return this.ox + p[0] * this.s; }
  y(p: Pt): number { return this.ch - (this.oy + p[1] * this.s); }
  xy(p: Pt): [number, number] { return [this.x(p), this.y(p)]; }
  scale() { return this.s; }
}

const PAL = {
  light: { prim: '#2563eb', dim: '#ca8a04', grn: '#16a34a', txt: '#1c1c1e', fill: 'rgba(37,99,235,0.08)', wire: 'rgba(0,0,0,0.1)' },
  dark: { prim: '#60a5fa', dim: '#facc15', grn: '#4ade80', txt: '#e5e7eb', fill: 'rgba(96,165,250,0.12)', wire: 'rgba(255,255,255,0.12)' },
};

function isDark() { return document.documentElement.classList.contains('dark'); }

function dist(a: Pt, b: Pt) {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
}

// ---------- Canvas hook ----------
function useShape(drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number, p: typeof PAL.light) => void) {
  const cRef = useRef<HTMLDivElement>(null);
  const nRef = useRef<HTMLCanvasElement>(null);
  const paintRef = useRef<() => void>();

  useEffect(() => {
    const c = cRef.current, n = nRef.current;
    if (!c || !n) return;
    const ctx = n.getContext('2d')!;

    function paint() {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth, h = c.clientHeight;
      if (w === 0 || h === 0) return;
      n.width = w * dpr;
      n.height = h * dpr;
      n.style.width = w + 'px';
      n.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      drawFn(ctx, w, h, isDark() ? PAL.dark : PAL.light);
    }

    paintRef.current = paint;
    paint();

    const ro = new ResizeObserver(paint);
    ro.observe(c);
    const mo = new MutationObserver(paint);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => { ro.disconnect(); mo.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawFn]);

  return { cRef, nRef };
}

// ---------- helpers ----------
function poly(ctx: CanvasRenderingContext2D, pts: Pt[], t: TForm) {
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(...t.xy(p)) : ctx.lineTo(...t.xy(p)));
  ctx.closePath();
}

function lbl(t: TForm, p1: Pt, p2: Pt, off: number): [number, number] {
  const [x1, y1] = t.xy(p1), [x2, y2] = t.xy(p2);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return [mx + (-dy / len) * off, my + (dx / len) * off];
}

function fontSize(s: number): number {
  return Math.max(13, Math.min(18, Math.round(14 * Math.min(1, 240 / (s * 100 || 1)))));
}

// ---------- ZoomableShape ----------
export function ZoomableShape({ children }: { children: React.ReactNode }) {
  const [z, setZ] = useState(1);
  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-black/5 px-4 py-2 dark:bg-white/10">
        <button onClick={() => setZ(v => Math.min(v + 0.25, 3))} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base font-bold text-[#1c1c1e] shadow-sm transition-all active:scale-90 hover:bg-white/90 dark:bg-white/25 dark:text-white dark:hover:bg-white/35" title="تكبير">+</button>
        <span className="min-w-[3.5rem] text-center text-sm font-semibold text-[#8e8e93] dark:text-white/60">{Math.round(z * 100)}%</span>
        <button onClick={() => setZ(v => Math.max(v - 0.25, 0.5))} className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base font-bold text-[#1c1c1e] shadow-sm transition-all active:scale-90 hover:bg-white/90 dark:bg-white/25 dark:text-white dark:hover:bg-white/35" title="تصغير">−</button>
        <button onClick={() => setZ(1)} className="flex h-9 items-center justify-center rounded-xl bg-white px-3 text-sm font-semibold text-[#1c1c1e] shadow-sm transition-all active:scale-90 hover:bg-white/90 dark:bg-white/25 dark:text-white dark:hover:bg-white/35" title="إعادة">1:1</button>
      </div>
      <div className="w-full flex justify-center" style={{ transform: `scale(${z})`, transformOrigin: 'top center' }}>
        {children}
      </div>
    </div>
  );
}

// ---------- Triangle ----------
interface TriangleSVGProps { base: number; height?: number; sideA?: number; sideB?: number; sideC?: number; apexX?: number; apexY?: number; showHeight?: boolean; }

export function TriangleSVG({ base, height, sideA, sideB, sideC, apexX, apexY, showHeight }: TriangleSVGProps) {
  let b = Math.max(base, 1);
  let ax: number, ay: number;
  if (apexX != null && apexY != null) { ax = apexX; ay = Math.max(apexY, 1); }
  else if (sideA != null && sideB != null && sideC != null) {
    const sc = Math.max(sideC, 1);
    const cosB = (b * b + sc * sc - sideB! * sideB!) / (2 * b * sc);
    const cb = Math.max(Math.min(cosB, 1), -1);
    ax = sc * cb; ay = sc * Math.sin(Math.acos(cb));
    if (ay < 0.01) ay = 1;
  } else { const h = Math.max(height ?? b * 0.6, 1); ax = b / 2; ay = h; }

  const hVal = height ?? ay;
  const p0: Pt = [0, 0], p1: Pt = [b, 0], p2: Pt = [ax, ay];
  const pts = [p0, p1, p2];
  const sA = sideA ?? dist(p0, p2), sB = sideB ?? dist(p1, p2);
  const vh = b > 20 ? 10 : 6;

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, pal: typeof PAL.light) => {
    const t = new TForm(w, h, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    if (showHeight) {
      const [hx, hy] = t.xy([ax, 0]), [, hy2] = t.xy([ax, ay]);
      ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx, hy2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textBaseline = 'middle';
      ctx.fillText('h = ' + toFixed(hVal), hx + vh, (hy + hy2) / 2);
    }

    ctx.fillStyle = pal.txt; ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const [bx] = t.xy([b / 2, 0]); const [, by2] = t.xy([ax, ay]);
    ctx.fillText('القاعدة = ' + toFixed(b), bx, by2 + (ay > 20 ? 22 : 16));
    const [lx, ly] = lbl(t, p0, p2, 20); ctx.fillText(toFixed(sA), lx, ly);
    const [rx, ry] = lbl(t, p1, p2, 20); ctx.fillText(toFixed(sB), rx, ry);
  }, [b, ax, ay, hVal, showHeight, sA, sB, vh]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Rectangle ----------
interface RectSVGProps { w: number; h: number; }

export function RectSVG({ w, h }: RectSVGProps) {
  const ww = Math.max(w, 1), hh = Math.max(h, 1);
  const pts: Pt[] = [[0, 0], [ww, 0], [ww, hh], [0, hh]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    const [mx, my] = t.xy([ww / 2, hh / 2]);
    const [lx] = t.xy([0, 0]), [rx] = t.xy([ww, 0]);
    const [, ty] = t.xy([0, 0]), [, by] = t.xy([0, hh]);

    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, my); ctx.lineTo(rx, my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, ty); ctx.lineTo(mx, by); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = pal.txt; ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('العرض = ' + toFixed(w), mx, my - 10);
    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`;
    ctx.fillText('الارتفاع = ' + toFixed(h), mx + 10, my + 6);
  }, [ww, hh]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Square ----------
interface SquareSVGProps { side: number; }

export function SquareSVG({ side }: SquareSVGProps) {
  const s = Math.max(side, 1);
  const pts: Pt[] = [[0, 0], [s, 0], [s, s], [0, s]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale());

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    const [mx, my] = t.xy([s / 2, s / 2]);
    const [lx] = t.xy([0, 0]), [rx] = t.xy([s, 0]);

    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, my); ctx.lineTo(rx, my); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = pal.txt; ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('الضلع = ' + toFixed(s), mx, my - 10);
  }, [s]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Circle ----------
interface CircleSVGProps { r: number; }

export function CircleSVG({ r }: CircleSVGProps) {
  const rr = Math.max(r, 1);
  const pts: Pt[] = [[-rr, -rr], [rr, rr]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);
    const [cx, cy] = t.xy([0, 0]);
    const rpx = Math.abs(t.x([rr, 0]) - t.x([0, 0]));

    ctx.beginPath(); ctx.arc(cx, cy, rpx, 0, Math.PI * 2);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.stroke();

    const [rx] = t.x([rr, 0]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx, cy); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('r = ' + toFixed(r), (cx + rx) / 2, cy + 22);
  }, [rr]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Sector ----------
interface SectorSVGProps { r: number; angle: number; }

export function SectorSVG({ r, angle }: SectorSVGProps) {
  const rr = Math.max(r, 1), a = Math.max(Math.min(angle, 360), 1);
  const rad = (a * Math.PI) / 180;
  const endX = rr * Math.sin(rad), endY = rr * Math.cos(rad);
  const pts: Pt[] = [[0, 0], [0, rr], [endX, endY]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);
    const [cx, cy] = t.xy([0, 0]);
    const rpx = Math.abs(t.y([0, 0]) - t.y([0, rr]));

    // dashed guide circle
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.wire; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, rpx, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);

    // sector arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + rad;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rpx, -Math.PI / 2, -Math.PI / 2 + rad);
    ctx.closePath();
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.stroke();

    const [rx] = t.x([rr, 0]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx, cy); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('r = ' + toFixed(r), (cx + rx) / 2, cy + 22);

    ctx.fillStyle = pal.txt; ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(a + '°', cx, cy - rpx - 12);
  }, [rr, a, rad]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Ellipse ----------
interface EllipseSVGProps { a: number; b: number; }

export function EllipseSVG({ a, b }: EllipseSVGProps) {
  const aa = Math.max(a, 1), bb = Math.max(b, 1);
  const pts: Pt[] = [[-aa, -bb], [aa, bb]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);
    const [cx, cy] = t.xy([0, 0]);
    const rx = Math.abs(t.x([aa, 0]) - t.x([0, 0]));
    const ry = Math.abs(t.y([0, 0]) - t.y([0, bb]));

    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.stroke();

    const [lx] = t.x([-aa, 0]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, cy); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('a = ' + toFixed(a), (cx + lx) / 2, cy + 22);

    const [, ty] = t.y([0, bb]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.grn; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.grn; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`;
    ctx.fillText('b = ' + toFixed(b), cx + 12, (cy + ty) / 2);
  }, [aa, bb]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Trapezoid ----------
interface TrapSVGProps { a: number; b: number; h: number; x: number; L1?: number; L2?: number; divBoundaries?: number[]; divDir?: 'x' | 'y'; }

export function TrapSVG({ a, b, h, x, L1, L2, divBoundaries, divDir = 'y' }: TrapSVGProps) {
  const aa = Math.max(a, 1), bb = Math.max(b, 1), hh = Math.max(h, 1);
  const pts: Pt[] = [[0, 0], [bb, 0], [x + aa, -hh], [x, -hh]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    const [hx1] = t.xy([x, 0]), [, hy2] = t.xy([x, -hh]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hx1, t.y([x, 0])); ctx.lineTo(hx1, hy2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textBaseline = 'middle';
    ctx.fillText('h = ' + toFixed(h), hx1 - 18, (t.y([x, 0]) + hy2) / 2);

    ctx.fillStyle = pal.txt; ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const [bt] = t.xy([x + aa / 2, -hh]); ctx.fillText('أ = ' + toFixed(a), bt, t.y([x + aa / 2, -hh]) - 18);
    const [bbx] = t.xy([bb / 2, 0]); ctx.fillText('ب = ' + toFixed(b), bbx, t.y([bb / 2, 0]) + 18);

    if (L1 != null) { ctx.textAlign = 'start'; ctx.fillText('L₁ = ' + toFixed(L1), hx1 - 18, (t.y([x, 0]) + hy2) / 2 + 18); }
    if (L2 != null) { ctx.textAlign = 'start'; ctx.fillText('L₂ = ' + toFixed(L2), t.x([x + aa, 0]) + 12, (t.y([x, 0]) + hy2) / 2 + 18); }

    if (divBoundaries && divBoundaries.length > 0) {
      ctx.strokeStyle = pal.grn; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
      if (divDir === 'x') {
        for (const X of divBoundaries) {
          if (X <= 0 || X >= bb) continue;
          const bot = t.xy([X, 0]);
          let topY: number;
          if (X >= x && X <= x + aa) {
            topY = -hh;
          } else if (X < x) {
            if (x > 0) topY = -hh * X / x; else continue;
          } else {
            const den = bb - x - aa;
            if (den > 0) topY = -hh * (bb - X) / den; else continue;
          }
          const top = t.xy([X, topY]);
          ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(bot[0], bot[1]); ctx.stroke();
        }
      } else {
        for (const y1 of divBoundaries) {
          const svgY = y1 - hh;
          const xL = x * (1 - y1 / hh);
          const xR = bb + (x + aa - bb) * (1 - y1 / hh);
          ctx.beginPath();
          ctx.moveTo(t.x([xL, svgY]), t.y([xL, svgY]));
          ctx.lineTo(t.x([xR, svgY]), t.y([xR, svgY]));
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }
  }, [aa, bb, hh, x, L1, L2, divBoundaries, divDir]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Parallelogram ----------
interface ParaSVGProps { base: number; height: number; skew: number; }

export function ParaSVG({ base, height, skew }: ParaSVGProps) {
  const b = Math.max(base, 1), h = Math.max(height, 1), s = Math.max(skew, 1);
  const pts: Pt[] = [[0, 0], [b, 0], [b + s, -h], [s, -h]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    const [hx] = t.xy([s, 0]); const hy1 = t.y([s, 0]), hy2 = t.y([s, -h]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(hx, hy1); ctx.lineTo(hx, hy2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textBaseline = 'middle';
    ctx.fillText('h = ' + toFixed(height), hx - 18, (hy1 + hy2) / 2);

    ctx.fillStyle = pal.txt; ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const [bx] = t.xy([b / 2, 0]);
    ctx.fillText('القاعدة = ' + toFixed(base), bx, t.y([b / 2, 0]) + 18);
  }, [b, h, s]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Rhombus ----------
interface RhombusSVGProps { d1: number; d2: number; }

export function RhombusSVG({ d1, d2 }: RhombusSVGProps) {
  const dd1 = Math.max(d1, 1) / 2, dd2 = Math.max(d2, 1) / 2;
  const pts: Pt[] = [[0, -dd1], [dd2, 0], [0, dd1], [-dd2, 0]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    const [, cy] = t.xy([0, 0]);
    const [lx] = t.xy([-dd2, 0]), [rx] = t.xy([dd2, 0]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, cy); ctx.lineTo(rx, cy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('d₁ = ' + toFixed(d1), 0, cy + 20 + dfs);

    const [, ty] = t.xy([0, -dd1]), [, by] = t.xy([0, dd1]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.grn; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(t.x([0, -dd1]), ty); ctx.lineTo(t.x([0, dd1]), by); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.grn;
    ctx.fillText('d₂ = ' + toFixed(d2), 18 + dfs, (ty + by) / 2);
  }, [dd1, dd2]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Kite ----------
interface KiteSVGProps { d1: number; d2: number; }

export function KiteSVG({ d1, d2 }: KiteSVGProps) {
  const dd1 = Math.max(d1, 1), dd2 = Math.max(d2, 1);
  const ratio = 0.35, topY = -dd1 * ratio, botY = dd1 * (1 - ratio);
  const pts: Pt[] = [[0, -dd1], [dd2 / 2, topY], [0, botY], [-dd2 / 2, topY]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    const [lx] = t.xy([-dd2 / 2, topY]), [rx] = t.xy([dd2 / 2, topY]);
    const [, topYC] = t.xy([0, topY]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(lx, topYC); ctx.lineTo(rx, topYC); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('d₁ = ' + toFixed(d1), 0, topYC + 16 + dfs);

    const [, ty] = t.xy([0, -dd1]), [, by] = t.xy([0, botY]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.grn; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(t.x([0, -dd1]), ty); ctx.lineTo(t.x([0, botY]), by); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.grn;
    ctx.fillText('d₂ = ' + toFixed(d2), 18 + dfs, (ty + by) / 2);
  }, [dd1, dd2, ratio, topY, botY]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Annulus ----------
interface AnnulusSVGProps { R: number; r: number; }

export function AnnulusSVG({ R, r }: AnnulusSVGProps) {
  const RR = Math.max(R, 1), rr = Math.min(Math.max(r, 1), RR * 0.95);
  const pts: Pt[] = [[-RR, -RR], [RR, RR]];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const dfs = Math.max(11, Math.round(14 * Math.min(1, 240 / (t.scale() * 100 || 1))) - 2);
    const [cx, cy] = t.xy([0, 0]);
    const rpx = Math.abs(t.x([RR, 0]) - t.x([0, 0]));
    const rpx2 = rpx * (rr / RR);

    ctx.beginPath(); ctx.arc(cx, cy, rpx, 0, Math.PI * 2);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.stroke();

    ctx.beginPath(); ctx.arc(cx, cy, rpx2, 0, Math.PI * 2);
    ctx.strokeStyle = pal.dim; ctx.lineWidth = 4; ctx.stroke();

    const [rx] = t.x([RR, 0]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.grn; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx, cy); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = pal.grn; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('R = ' + toFixed(R), (cx + rx) / 2, cy + 22);

    const [rx2] = t.x([rr, 0]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.grn; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx2, cy); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillText('r = ' + toFixed(r), (cx + rx2) / 2, cy - 10);
  }, [RR, rr]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Irregular Quadrilateral ----------
interface IrregQuadSVGProps { sides: [number, number, number, number]; diag?: number; }

export function IrregQuadSVG({ sides, diag }: IrregQuadSVGProps) {
  const [a, b_s, c, d_s] = sides.map(s => Math.max(s, 1));
  const d = diag ?? Math.sqrt(a * a + b_s * b_s);
  const p0: Pt = [0, 0], p1: Pt = [a, 0], p3: Pt = [d * 0.6, d * 0.5], p2: Pt = [p3[0] + b_s * 0.7, p3[1] + b_s * 0.3];
  const pts: Pt[] = [p0, p1, p2, p3];

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    const [dx1, dy1] = t.xy(p0), [dx2, dy2] = t.xy(p2);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(dx1, dy1); ctx.lineTo(dx2, dy2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const [dlx, dly] = lbl(t, p0, p2, 14);
    ctx.fillText('d = ' + toFixed(d), dlx, dly);

    ctx.fillStyle = pal.txt; ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`; ctx.textBaseline = 'middle';
    const labelSide = (p1: Pt, p2: Pt, val: number) => {
      const [lx, ly] = lbl(t, p1, p2, -20);
      ctx.fillText(toFixed(val), lx, ly);
    };
    labelSide(p0, p1, a); labelSide(p1, p2, b_s); labelSide(p2, p3, c); labelSide(p3, p0, d_s);
  }, [a, b_s, c, d_s, d, p0, p1, p2, p3]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Regular Polygon ----------
interface RegPolySVGProps { n: number; r: number; }

export function RegPolySVG({ n, r }: RegPolySVGProps) {
  const nn = Math.max(Math.round(n), 3), rr = Math.max(r, 1);
  const pts: Pt[] = [];
  for (let i = 0; i < nn; i++) {
    const theta = (i / nn) * 2 * Math.PI - Math.PI / 2;
    pts.push([rr * Math.cos(theta), rr * Math.sin(theta)]);
  }
  const sideLen = 2 * rr * Math.sin(Math.PI / nn);

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale()), dfs = Math.max(11, fs - 2);

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    const [cx, cy] = t.xy([0, 0]);
    const [px, py] = t.xy(pts[0]);
    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.dim; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = pal.dim; ctx.font = `700 ${dfs}px system-ui, -apple-system, sans-serif`; ctx.textBaseline = 'middle';
    ctx.fillText('r = ' + toFixed(r), cx + 10, cy + 6);

    ctx.fillStyle = pal.txt; ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const [, edgeY] = t.xy([0, rr]);
    ctx.fillText(nn + ' أضلاع', cx, edgeY + 24);

    if (nn < 9) {
      const [lx, ly] = lbl(t, pts[0], pts[1], -20);
      ctx.fillText(toFixed(sideLen), lx, ly);
    }
  }, [nn, rr, sideLen, pts]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}

// ---------- Cyclic Quadrilateral ----------
interface CyclicQuadSVGProps { sides: [number, number, number, number]; }

export function CyclicQuadSVG({ sides }: CyclicQuadSVGProps) {
  const [a, b, c, d] = sides.map(s => Math.max(s, 1));
  const total = a + b + c + d;
  const angles = [0, (a / total) * 2 * Math.PI, ((a + b) / total) * 2 * Math.PI, ((a + b + c) / total) * 2 * Math.PI];
  const cr = 80;
  const pts: Pt[] = angles.map(theta => [cr * Math.cos(theta - Math.PI / 2), cr * Math.sin(theta - Math.PI / 2)]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, cw: number, ch: number, pal: typeof PAL.light) => {
    const t = new TForm(cw, ch, pts, 40);
    const fs = fontSize(t.scale());
    const [cx, cy] = t.xy([0, 0]);
    const rpx = Math.abs(t.x([cr, 0]) - t.x([0, 0]));

    ctx.setLineDash([6, 4]); ctx.strokeStyle = pal.wire; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, rpx, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);

    poly(ctx, pts, t);
    ctx.fillStyle = pal.fill; ctx.fill();
    ctx.strokeStyle = pal.prim; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.stroke();

    ctx.fillStyle = pal.txt; ctx.font = `700 ${fs}px system-ui, -apple-system, sans-serif`; ctx.textBaseline = 'middle';
    const labelSide = (p1: Pt, p2: Pt, val: number) => {
      const [lx, ly] = lbl(t, p1, p2, -20);
      ctx.fillText(toFixed(val), lx, ly);
    };
    labelSide(pts[0], pts[1], a); labelSide(pts[1], pts[2], b);
    labelSide(pts[2], pts[3], c); labelSide(pts[3], pts[0], d);
  }, [a, b, c, d, pts]);

  const { cRef, nRef } = useShape(draw);
  return <ZoomableShape><div ref={cRef} className="h-64 w-full max-w-lg mx-auto"><canvas ref={nRef} className="w-full h-full" /></div></ZoomableShape>;
}
