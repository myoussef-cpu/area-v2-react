import React, { useCallback, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getToolById } from '../domains/registry';
import { useResults } from '../shared/hooks/use-results';
import { usePendingSave } from '../shared/store/pending-save-store';
import type { CalculationData } from '../shared/types';

const TOOL_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType<{ onSave: (d: CalculationData) => void; initialValues?: Record<string, number> }>>> = {
  trapezoid: React.lazy(() => import('../domains/area/trapezoid')),
  triangle: React.lazy(() => import('../domains/area/triangle')),
  'circle-sector': React.lazy(() => import('../domains/area/circle-sector')),
  'regular-polygon': React.lazy(() => import('../domains/area/regular-polygon')),
  square: React.lazy(() => import('../domains/area/square')),
  rectangle: React.lazy(() => import('../domains/area/rectangle')),
  parallelogram: React.lazy(() => import('../domains/area/parallelogram')),
  rhombus: React.lazy(() => import('../domains/area/rhombus')),
  kite: React.lazy(() => import('../domains/area/kite')),
  annulus: React.lazy(() => import('../domains/area/annulus')),
  'cyclic-quadrilateral': React.lazy(() => import('../domains/area/cyclic-quadrilateral')),
  'irregular-quadrilateral': React.lazy(() => import('../domains/area/irregular-quadrilateral')),
  'volumes-3d': React.lazy(() => import('../domains/volumes/volumes-3d')),
  cube: React.lazy(() => import('../domains/volumes/cube')),
  pyramid: React.lazy(() => import('../domains/volumes/pyramid')),
  'frustum-cone': React.lazy(() => import('../domains/volumes/frustum-cone')),
  capsule: React.lazy(() => import('../domains/volumes/capsule')),
  ellipsoid: React.lazy(() => import('../domains/volumes/ellipsoid')),
  'concrete-calc': React.lazy(() => import('../domains/construction/concrete-calc')),
  'land-leveling': React.lazy(() => import('../domains/construction/land-leveling')),
  'bricks-calc': React.lazy(() => import('../domains/construction/bricks-calc')),
  'tiles-calc': React.lazy(() => import('../domains/construction/tiles-calc')),
  'paint-calc': React.lazy(() => import('../domains/construction/paint-calc')),
  'steel-weight': React.lazy(() => import('../domains/construction/steel-weight')),
  'steel-plate': React.lazy(() => import('../domains/construction/steel-plate')),
  excavation: React.lazy(() => import('../domains/construction/excavation')),
  plastering: React.lazy(() => import('../domains/construction/plastering')),
  'divide-area': React.lazy(() => import('../domains/conversion/divide-area')),
  'length-conversion': React.lazy(() => import('../domains/conversion/length-conversion')),
  'weight-conversion': React.lazy(() => import('../domains/conversion/weight-conversion')),
  'temp-conversion': React.lazy(() => import('../domains/conversion/temp-conversion')),
  'pressure-conversion': React.lazy(() => import('../domains/conversion/pressure-conversion')),
  'power-conversion': React.lazy(() => import('../domains/conversion/power-conversion')),
  'ohms-law': React.lazy(() => import('../domains/electrical/ohms-law')),
  'elec-power': React.lazy(() => import('../domains/electrical/elec-power')),
  'volt-drop': React.lazy(() => import('../domains/electrical/volt-drop')),
  'wire-size': React.lazy(() => import('../domains/electrical/wire-size')),
  'speed-dist': React.lazy(() => import('../domains/physics/speed-dist')),
  'force-calc': React.lazy(() => import('../domains/physics/force-calc')),
  'torque-calc': React.lazy(() => import('../domains/physics/torque-calc')),
  'hydraulic-force': React.lazy(() => import('../domains/physics/hydraulic-force')),
  percentage: React.lazy(() => import('../domains/math/percentage')),
  quadratic: React.lazy(() => import('../domains/math/quadratic')),
  pythagoras: React.lazy(() => import('../domains/math/pythagoras')),
  trigonometry: React.lazy(() => import('../domains/math/trigonometry')),
  'scale-map': React.lazy(() => import('../domains/math/scale-map')),
  'avg-calc': React.lazy(() => import('../domains/math/avg-calc')),
  'slope-deg': React.lazy(() => import('../domains/math/slope-deg')),
  'ratio-calc': React.lazy(() => import('../domains/math/ratio-calc')),
  'unit-price': React.lazy(() => import('../domains/math/unit-price')),
};

export default function ToolPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const initialValues = (location.state as { initialValues?: Record<string, number> })?.initialValues;
  const { saveResult } = useResults();
  const toolDef = id ? getToolById(id) : undefined;

  const handleSave = useCallback(
    (data: CalculationData) => {
      saveResult(data);
    },
    [saveResult]
  );

  if (!id || !toolDef) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-bold">الأداة غير موجودة</p>
        <p className="mt-2 text-sm text-[#8e8e93]">هذه الأداة غير متوفرة حالياً</p>
      </div>
    );
  }

  const ToolComponent = TOOL_COMPONENTS[id];
  if (!ToolComponent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-bold">الأداة قيد التطوير</p>
        <p className="mt-2 text-sm text-[#8e8e93]">{toolDef.name} سيتم إضافتها قريباً</p>
      </div>
    );
  }

  useEffect(() => {
    return () => { usePendingSave.getState().clear(); };
  }, []);

  return (
    <div className="animate-ios-slide-up py-2">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <toolDef.icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold">{toolDef.name}</h1>
          <p className="text-sm text-[#8e8e93]">{toolDef.description}</p>
        </div>
      </div>
      <ToolComponent onSave={handleSave} initialValues={initialValues} />
    </div>
  );
}
