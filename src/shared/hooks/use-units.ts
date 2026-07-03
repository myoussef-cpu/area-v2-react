import { useAppStore } from '../store/app-store';
import { AREA_UNITS, VOLUME_UNITS } from '../lib/units';
import { formatFeddan } from '../lib/feddan';

export function useUnits() {
  const areaUnit = useAppStore((s) => s.areaUnit);
  const volumeUnit = useAppStore((s) => s.volumeUnit);
  const setAreaUnit = useAppStore((s) => s.setAreaUnit);
  const setVolumeUnit = useAppStore((s) => s.setVolumeUnit);

  const formatArea = (m2: number) => {
    if (areaUnit === 'feddan') return formatFeddan(m2);
    const unit = AREA_UNITS[areaUnit as keyof typeof AREA_UNITS];
    if (!unit) return `${m2.toFixed(2)} م²`;
    return `${(m2 * unit.factor).toFixed(4)} ${unit.label}`;
  };

  const formatVolume = (m3: number) => {
    const unit = VOLUME_UNITS[volumeUnit as keyof typeof VOLUME_UNITS];
    if (!unit) return `${m3.toFixed(2)} م³`;
    return `${(m3 * unit.factor).toFixed(4)} ${unit.label}`;
  };

  return { areaUnit, volumeUnit, setAreaUnit, setVolumeUnit, formatArea, formatVolume };
}
