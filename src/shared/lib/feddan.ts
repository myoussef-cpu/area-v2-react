import type { FeddanResult } from '../types';

const FEDDAN_M2 = 4200.833;
const QIRAT_M2 = 175.035;
const SAHM_M2 = 7.293;

export function convertToFeddans(areaInM2: number): FeddanResult {
  let remaining = areaInM2;
  const feddan = Math.floor(remaining / FEDDAN_M2);
  remaining %= FEDDAN_M2;
  const qirat = Math.floor(remaining / QIRAT_M2);
  remaining %= QIRAT_M2;
  const sahm = (remaining / SAHM_M2).toFixed(2);
  return { feddan, qirat, sahm };
}

export function formatFeddan(areaInM2: number): string {
  const f = convertToFeddans(areaInM2);
  return `${f.feddan} فدان، ${f.qirat} قيراط، ${f.sahm} سهم`;
}
