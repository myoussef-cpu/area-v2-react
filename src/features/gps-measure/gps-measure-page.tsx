import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Crosshair, Undo2, RotateCcw, Ruler, Satellite, ShieldCheck, ShieldAlert, Activity } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { useUnits } from '../../shared/hooks/use-units';

interface GeoPoint { lat: number; lng: number; }

function polyArea(points: GeoPoint[]): number {
  const n = points.length;
  if (n < 3) return 0;
  const avgLatRad = points.reduce((s, p) => s + p.lat, 0) / n * Math.PI / 180;
  const mLat = 111320, mLng = 111320 * Math.cos(avgLatRad);
  let area = 0;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; area += points[i].lng * mLng * points[j].lat * mLat - points[j].lng * mLng * points[i].lat * mLat; }
  return Math.abs(area) / 2;
}

function geoDist(a: GeoPoint, b: GeoPoint): number {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const aa = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

class KF1D {
  private x = 0;
  private p = 1;
  private q = 1;
  constructor(v: number, q = 1e-6) { this.x = v; this.q = q; }
  update(m: number, r: number): number {
    this.p += this.q;
    const k = this.p / (this.p + Math.max(r, 0.01));
    this.x += k * (m - this.x);
    this.p = (1 - k) * this.p;
    return this.x;
  }
  get value() { return this.x; }
}

class KalmanPos {
  kLat: KF1D; kLng: KF1D;
  constructor(lat: number, lng: number) { this.kLat = new KF1D(lat); this.kLng = new KF1D(lng); }
  update(lat: number, lng: number, acc: number): GeoPoint {
    const r = (acc / 10) ** 2;
    return { lat: this.kLat.update(lat, r), lng: this.kLng.update(lng, r) };
  }
  get pos(): GeoPoint { return { lat: this.kLat.value, lng: this.kLng.value }; }
}

interface AccRec { pos: GeoPoint; acc: number; }
const MAX_READINGS = 80;

const SAT_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SAT_ATT = '© Esri, Maxar, Earthstar Geographics';

function pointIcon(n: number): L.DivIcon {
  return L.divIcon({
    className: '', html: `<div style="background:#2563eb;color:#fff;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;border:2.5px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.4)">${n}</div>`,
    iconSize: [34, 34], iconAnchor: [17, 17],
  });
}
const curIcon = L.divIcon({
  className: '', html: '<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 3px rgba(37,99,235,0.4),0 2px 6px rgba(0,0,0,0.3)"></div>',
  iconSize: [14, 14], iconAnchor: [7, 7],
});

export default function GpsMeasurePage() {
  const [points, setPoints] = useState<GeoPoint[]>([]);
  const [area, setArea] = useState<number | null>(null);
  const [currentPos, setCurrentPos] = useState<GeoPoint | null>(null);
  const [accuracy, setAccuracy] = useState(999);
  const [bestAccuracy, setBestAccuracy] = useState(999);
  const [isLocating, setIsLocating] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readCount, setReadCount] = useState(0);
  const { formatArea } = useUnits();

  const mapRef = useRef<L.Map | null>(null);
  const contRef = useRef<HTMLDivElement>(null);
  const ptLayerRef = useRef<L.LayerGroup>(null!);
  const curLayerRef = useRef<L.LayerGroup>(null!);
  const polyRef = useRef<L.Polygon | null>(null);
  const watchRef = useRef<number | null>(null);
  const kfRef = useRef<KalmanPos | null>(null);
  const histRef = useRef<AccRec[]>([]);
  const bestAccRef = useRef(999);

  useEffect(() => {
    if (!contRef.current || mapRef.current) return;
    const map = L.map(contRef.current, { zoomControl: false, attributionControl: false }).setView([30.0444, 31.2357], 18);
    L.tileLayer(SAT_URL, { maxZoom: 20, attribution: SAT_ATT }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    ptLayerRef.current = L.layerGroup().addTo(map);
    curLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { setError('GPS غير متاح'); return; }
    setIsLocating(true); setReady(false); setError(null); bestAccRef.current = 999;
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    histRef.current = [];
    kfRef.current = null;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: rawAcc } = pos.coords;
        if (rawAcc > 100) return;
        if (!kfRef.current) kfRef.current = new KalmanPos(latitude, longitude);
        const filtered = kfRef.current.update(latitude, longitude, rawAcc);
        const acc = Math.max(rawAcc, 0.1);
        setCurrentPos(filtered);
        setAccuracy(acc);

        histRef.current = [...histRef.current.slice(-(MAX_READINGS - 1)), { pos: filtered, acc }];
        setReadCount(histRef.current.length);

        if (acc < bestAccRef.current) { bestAccRef.current = acc; setBestAccuracy(acc); }

        const h = histRef.current;
        const best = bestAccRef.current;
        const recentStable = h.length >= 20 && h.slice(-20).every(r => r.acc <= best * 1.25);
        const posStable = (() => {
          if (h.length < 15) return false;
          const ref = h[h.length - 1].pos;
          return h.slice(-15).every(r => geoDist(r.pos, ref) < 0.6);
        })();
        setReady(h.length >= 15 && recentStable && posStable && best < 15);

        curLayerRef.current.clearLayers();
        L.circle([filtered.lat, filtered.lng], {
          radius: Math.max(acc * 0.7, 0.3),
          color: ready ? '#16a34a' : acc < 2 ? '#16a34a' : acc < 5 ? '#ca8a04' : '#dc2626',
          fillColor: ready ? 'rgba(22,163,74,0.12)' : acc < 2 ? 'rgba(22,163,74,0.08)' : acc < 5 ? 'rgba(202,138,4,0.08)' : 'rgba(220,38,38,0.08)',
          weight: 1.5, fillOpacity: 1, interactive: false,
        }).addTo(curLayerRef.current);
        L.marker([filtered.lat, filtered.lng], { icon: curIcon, interactive: false }).addTo(curLayerRef.current);

        if (mapRef.current) mapRef.current.setView([filtered.lat, filtered.lng], 19);
      },
      (err) => { setError(`GPS: ${err.message}`); setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 3000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    return () => { if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current); };
  }, []);

  const markPoint = useCallback(() => {
    const h = histRef.current;
    if (h.length < 5) { if (currentPos) setPoints((p) => [...p, currentPos]); return; }
    const bestIdx = h.reduce((bi, r, i, a) => r.acc < a[bi].acc ? i : bi, 0);
    setPoints((p) => [...p, h[bestIdx].pos]);
  }, [currentPos]);

  const undoPoint = useCallback(() => setPoints((prev) => prev.slice(0, -1)), []);
  const clearAll = useCallback(() => { setPoints([]); setArea(null); setError(null); }, []);

  useEffect(() => {
    ptLayerRef.current?.clearLayers();
    polyRef.current?.remove(); polyRef.current = null;
    if (points.length === 0) return;
    points.forEach((p, i) => L.marker([p.lat, p.lng], { icon: pointIcon(i + 1) }).addTo(ptLayerRef.current));
    if (points.length >= 3) {
      const segs = points.map((p) => [p.lat, p.lng] as [number, number]);
      const poly = L.polygon(segs, { color: '#2563eb', fillColor: 'rgba(37,99,235,0.1)', weight: 3 }).addTo(mapRef.current!);
      polyRef.current = poly;
      mapRef.current?.fitBounds(poly.getBounds().pad(0.15));
      setArea(polyArea(points));
    } else {
      if (points.length === 1 && mapRef.current) mapRef.current.setView([points[0].lat, points[0].lng], 19);
      setArea(null);
    }
  }, [points]);

  const grade = bestAccuracy < 1.5 ? 'ممتازة' : bestAccuracy < 3 ? 'جيدة جداً' : bestAccuracy < 6 ? 'جيدة' : bestAccuracy < 15 ? 'متوسطة' : 'ضعيفة';
  const gradeCls = bestAccuracy < 1.5 ? 'text-green-600' : bestAccuracy < 3 ? 'text-emerald-600' : bestAccuracy < 6 ? 'text-yellow-600' : bestAccuracy < 15 ? 'text-orange-600' : 'text-red-600';
  const dotCls = bestAccuracy < 1.5 ? 'bg-green-500' : bestAccuracy < 3 ? 'bg-emerald-500' : bestAccuracy < 6 ? 'bg-yellow-500' : bestAccuracy < 15 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="animate-ios-slide-up py-2 space-y-4">
      <Card>
        <div className="flex items-center gap-2 mb-1">
          <Satellite className="h-5 w-5 shrink-0 text-primary" />
          <h2 className="text-sm font-bold">قياس الأرض بالأقمار الصناعية</h2>
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          انتظر حتى يتحول المؤشر للأخضر ⚡ — التطبيق لا يقبل تثبيت النقطة إلا بأعلى دقة واستقرار للموقع.
        </p>

        <div ref={contRef} className="h-80 w-full rounded-xl overflow-hidden mb-2 border border-black/5 dark:border-white/5" />

        <div className="mb-2 flex items-center justify-between rounded-lg bg-black/3 px-3 py-2 text-[11px] dark:bg-white/5">
          <span className="flex items-center gap-1.5 text-gray-500">
            {isLocating ? (
              <><span className={`inline-block h-2 w-2 rounded-full ${dotCls} ${ready ? 'animate-ping' : ''}`} />
                <span className={`font-bold ${gradeCls}`}>±{bestAccuracy.toFixed(2)}م</span>
                <span className="text-gray-400">{grade}</span>
                <span className="text-gray-400">| {readCount}</span>
                {ready && <ShieldCheck className="h-3 w-3 text-green-600" />}</>
            ) : 'GPS متوقف'}
          </span>
          {points.length > 0 && <span className="font-bold text-primary">{points.length} ن</span>}
          {points.length >= 2 && (() => {
            const d = geoDist(points[points.length - 2], points[points.length - 1]);
            return <span className="text-gray-500">{d.toFixed(2)}م</span>;
          })()}
        </div>

        <div className="flex gap-2 mb-2">
          <Button onClick={startTracking} variant={isLocating ? 'primary' : 'secondary'} size="sm" className="flex-1">
            <Crosshair className="h-4 w-4 ml-1 shrink-0" />{isLocating ? 'تتبع' : 'تشغيل GPS'}
          </Button>
          <Button onClick={markPoint} disabled={!ready || points.length >= 50} size="sm" className="flex-1">
            {ready ? <ShieldCheck className="h-4 w-4 ml-1 shrink-0" /> : <ShieldAlert className="h-4 w-4 ml-1 shrink-0" />}
            {ready ? 'تثبيت نقطة' : 'انتظر...'}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={undoPoint} disabled={points.length === 0} variant="secondary" size="sm" className="flex-1">
            <Undo2 className="h-4 w-4 ml-1 shrink-0" />تراجع
          </Button>
          <Button onClick={clearAll} disabled={points.length === 0} variant="secondary" size="sm" className="flex-1">
            <RotateCcw className="h-4 w-4 ml-1 shrink-0" />مسح
          </Button>
        </div>

        {error && <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">{error}</div>}

        {isLocating && !ready && bestAccuracy < 999 && (
          <div className="mt-2 rounded-xl bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <Activity className="inline h-3 w-3 ml-1" />
            أفضل دقة وصلنا لها: ±{bestAccuracy.toFixed(1)}م. ننتظر استقرار القراءات... ابقَ ثابتاً في مكانك.
          </div>
        )}
        {ready && (
          <div className="mt-2 rounded-xl bg-green-50 p-2.5 text-[11px] text-green-700 dark:bg-green-950/30 dark:text-green-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>أعلى دقة واستقرار — يمكنك تثبيت النقطة الآن</span>
          </div>
        )}
      </Card>

      {points.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-bold">النقاط المثبتة</h3>
          <div className="space-y-1">
            {points.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-black/3 px-3 py-2 text-xs dark:bg-white/5">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{i + 1}</span>
                  {i > 0 && <span className="text-gray-400">← {geoDist(points[i - 1], p).toFixed(2)}م</span>}
                </span>
                <span className="font-mono text-gray-500" dir="ltr">{p.lat.toFixed(8)}, {p.lng.toFixed(8)}</span>
              </div>
            ))}
          </div>
          {points.length < 3 && (
            <div className="mt-2 text-center text-xs text-gray-400">بقي {3 - points.length} نقاط لإكمال المضلع</div>
          )}
        </Card>
      )}

      {area !== null && (
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Ruler className="h-5 w-5 text-primary shrink-0" />
            <h3 className="text-sm font-bold">المساحة</h3>
          </div>
          <p className="text-2xl font-bold text-primary">{formatArea(area)}</p>
          <p className="text-xs text-gray-500">{area.toFixed(4)} م²</p>
          {(() => {
            const perim = points.reduce((s, p, i) => i > 0 ? s + geoDist(points[i - 1], p) : 0, 0) + (points.length >= 3 ? geoDist(points[points.length - 1], points[0]) : 0);
            return <p className="text-xs text-gray-400 mt-1">المحيط: {perim.toFixed(3)} م</p>;
          })()}
        </Card>
      )}
    </div>
  );
}
