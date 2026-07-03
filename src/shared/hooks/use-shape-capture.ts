import { useRef, useCallback } from 'react';

export function useShapeCapture() {
  const ref = useRef<HTMLDivElement>(null);
  const capture = useCallback(() => {
    const canvas = ref.current?.querySelector('canvas');
    if (!canvas) return undefined;
    try { return canvas.toDataURL('image/png'); } catch { return undefined; }
  }, []);
  return { shapeRef: ref, capture };
}
