// Cargas type-safe de fixtures committeados.
import e4Json from '../fixtures/e4-boxplot.json';
import st6Json from '../fixtures/st6-heatmap.json';
import p3Json from '../fixtures/p3-pyramid.json';

export interface E4Point {
  sex: 'H' | 'M';
  ingreso: number;
}
export interface E4Fixture {
  label: string;
  n: number;
  source: string;
  transformation: string;
  timeWindow: string;
  points: ReadonlyArray<E4Point>;
}

export interface St6Cell {
  x: number;
  y: number;
  count: number;
}
export interface St6Fixture {
  label: string;
  n: number;
  xAxis: { label: string; ticks: ReadonlyArray<number> };
  yAxis: { label: string; ticks: ReadonlyArray<number> };
  source: string;
  transformation: string;
  spearmanRho: number;
  spearmanPValue: number;
  matrix: ReadonlyArray<St6Cell>;
}

export interface P3Bin {
  bin: string;
  men: number;
  women: number;
}
export interface P3Fixture {
  label: string;
  n: number;
  source: string;
  transformation: string;
  bins: ReadonlyArray<P3Bin>;
}

export const E4: E4Fixture = e4Json as E4Fixture;
export const ST6: St6Fixture = st6Json as St6Fixture;
export const P3: P3Fixture = p3Json as P3Fixture;

// Boxplot stats helper — usado por ambos stacks.
export interface BoxStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: ReadonlyArray<number>;
}

export function computeBoxStats(values: ReadonlyArray<number>): BoxStats {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) {
    return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };
  }
  const quantile = (p: number): number => {
    const idx = (n - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    const a = sorted[lo];
    const b = sorted[hi];
    if (a === undefined || b === undefined) return 0;
    return a + (b - a) * (idx - lo);
  };
  const q1 = quantile(0.25);
  const median = quantile(0.5);
  const q3 = quantile(0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const inside = sorted.filter((v) => v >= lowerFence && v <= upperFence);
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);
  return {
    min: inside[0] ?? sorted[0] ?? 0,
    q1,
    median,
    q3,
    max: inside[inside.length - 1] ?? sorted[sorted.length - 1] ?? 0,
    outliers,
  };
}
