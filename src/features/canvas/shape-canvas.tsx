import { useRef, useEffect } from 'react';
import { Card } from '../../shared/ui/card';

interface ShapeCanvasProps {
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  width?: number;
  height?: number;
}

export function ShapeCanvas({ draw, width = 300, height = 250 }: ShapeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.classList.contains('dark');
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= width; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    draw(ctx, width, height);
  }, [draw, width, height]);

  return (
    <Card className="flex justify-center p-3">
      <canvas ref={canvasRef} className="max-w-full rounded-xl" />
    </Card>
  );
}
