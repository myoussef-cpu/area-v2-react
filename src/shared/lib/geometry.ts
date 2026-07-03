export const Geometry = {
  circleArea: (r: number) => Math.PI * r * r,
  circlePerimeter: (r: number) => 2 * Math.PI * r,
  sectorArea: (r: number, angle: number) => (angle / 360) * Math.PI * r * r,
  ellipseArea: (a: number, b: number) => Math.PI * a * b,
  regularPolygonArea: (n: number, side: number) =>
    (n * side * side) / (4 * Math.tan(Math.PI / n)),
  cylinderVolume: (r: number, h: number) => Math.PI * r * r * h,
  sphereVolume: (r: number) => (4 / 3) * Math.PI * r * r * r,
  coneVolume: (r: number, h: number) => (1 / 3) * Math.PI * r * r * h,
  trapezoidArea: (a: number, b: number, h: number) => ((a + b) / 2) * h,
  triangleArea: (base: number, height: number) => 0.5 * base * height,
  triangleHeron: (a: number, b: number, c: number) => {
    const s = (a + b + c) / 2;
    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
  },
  pythagoreanHyp: (a: number, b: number) => Math.sqrt(a * a + b * b),
  pythagoreanLeg: (hyp: number, leg: number) => Math.sqrt(Math.abs(hyp * hyp - leg * leg)),
  frustumVolume: (r1: number, r2: number, h: number) =>
    (Math.PI * h / 3) * (r1 * r1 + r2 * r2 + r1 * r2),
  capsuleVolume: (r: number, h: number) =>
    Math.PI * r * r * (h + (4 / 3) * r),
  ellipsoidVolume: (a: number, b: number, c: number) =>
    (4 / 3) * Math.PI * a * b * c,
  cubeVolume: (side: number) => side * side * side,
  cubeSurface: (side: number) => 6 * side * side,
  pyramidVolume: (baseArea: number, height: number) =>
    (1 / 3) * baseArea * height,
  annulusArea: (R: number, r: number) => Math.PI * (R * R - r * r),
  kiteArea: (d1: number, d2: number) => 0.5 * d1 * d2,
  rhombusArea: (d1: number, d2: number) => 0.5 * d1 * d2,
  parallelogramArea: (base: number, height: number) => base * height,
  rectangleArea: (w: number, h: number) => w * h,
  squareArea: (side: number) => side * side,
};

export const toFixed = (v: number, d: number = 2) => Number(v.toFixed(d));
