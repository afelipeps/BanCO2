// Estadística canónica del dashboard. Se aplican las reglas de
// statistical_rules de CLAUDE.md: Wilson para proporciones (no
// normal-approx), mediana + IQR por defecto, Spearman para Likert.

const Z_95 = 1.959963984540054;

export interface WilsonCI {
  lower: number;
  upper: number;
  z: number;
}

export function wilsonCI(p: number, n: number, alpha = 0.05): WilsonCI {
  if (Number.isNaN(p)) throw new Error('p must be in [0,1]');
  if (p < 0 || p > 1) throw new Error('p must be in [0,1]');
  if (n <= 0) throw new Error('n must be > 0');
  const z = alpha === 0.05 ? Z_95 : invNormal(1 - alpha / 2);
  const z2 = z * z;
  const denom = n + z2;
  // Special-case bounds: p=1 → upper=1 exact; p=0 → lower=0 exact.
  // Sin esto el aritmético FP devuelve 0.9999... por imprecisión en sqrt(z²/4).
  if (p === 1) return { lower: n / denom, upper: 1, z };
  if (p === 0) return { lower: 0, upper: z2 / denom, z };
  const center = (n * p + z2 / 2) / denom;
  const margin = (z * Math.sqrt(n * p * (1 - p) + z2 / 4)) / denom;
  return {
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin),
    z,
  };
}

export function median(arr: readonly number[]): number {
  if (arr.length === 0) throw new Error('median requires non-empty array');
  for (const v of arr) {
    if (Number.isNaN(v)) throw new Error('median input contains NaN');
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? (sorted[mid] as number)
    : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
}

export function iqr(arr: readonly number[]): { q1: number; q3: number } {
  if (arr.length === 0) throw new Error('iqr requires non-empty array');
  const sorted = [...arr].sort((a, b) => a - b);
  return {
    q1: percentile(sorted, 0.25),
    q3: percentile(sorted, 0.75),
  };
}

function percentile(sorted: readonly number[], p: number): number {
  // Método tipo 7 (default numpy/R): interpolación lineal sobre (n-1)*p.
  const n = sorted.length;
  const idx = (n - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo] as number;
  const frac = idx - lo;
  return (sorted[lo] as number) * (1 - frac) + (sorted[hi] as number) * frac;
}

export function mean(arr: readonly number[]): number {
  if (arr.length === 0) throw new Error('mean requires non-empty array');
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function stdev(arr: readonly number[], opts: { sample?: boolean } = {}): number {
  if (arr.length < 2) throw new Error('stdev requires n >= 2');
  const m = mean(arr);
  const sq = arr.reduce((acc, v) => acc + (v - m) * (v - m), 0);
  const denom = opts.sample === false ? arr.length : arr.length - 1;
  return Math.sqrt(sq / denom);
}

export interface SpearmanResult {
  rho: number;
  t: number;
  n: number;
}

// método empates: average ranks (compatible con scipy.stats.spearmanr default).
export function spearman(x: readonly number[], y: readonly number[]): SpearmanResult {
  if (x.length !== y.length) throw new Error('arrays must have equal length');
  if (x.length < 3) throw new Error('spearman requires n >= 3');
  const rx = rankAverage(x);
  const ry = rankAverage(y);
  const rho = pearson(rx, ry);
  const n = x.length;
  if (Number.isNaN(rho)) return { rho: NaN, t: NaN, n };
  const t = rho * Math.sqrt((n - 2) / (1 - rho * rho));
  return { rho, t, n };
}

function rankAverage(arr: readonly number[]): number[] {
  const indexed = arr.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);
  const ranks = new Array<number>(arr.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length - 1 && indexed[j + 1]!.v === indexed[i]!.v) j++;
    const avgRank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[indexed[k]!.i] = avgRank;
    i = j + 1;
  }
  return ranks;
}

function pearson(x: readonly number[], y: readonly number[]): number {
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const ax = (x[i] as number) - mx;
    const ay = (y[i] as number) - my;
    num += ax * ay;
    dx += ax * ax;
    dy += ay * ay;
  }
  if (dx === 0 || dy === 0) return NaN;
  return num / Math.sqrt(dx * dy);
}

// Inversa CDF normal estándar — aproximación Beasley-Springer-Moro.
// Solo se usa si alpha != 0.05 (para 0.05 usamos la constante exacta).
function invNormal(p: number): number {
  if (p <= 0 || p >= 1) throw new Error('invNormal requires 0 < p < 1');
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q: number;
  let r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) /
      ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0]! * r + a[1]!) * r + a[2]!) * r + a[3]!) * r + a[4]!) * r + a[5]!) * q) /
      (((((b[0]! * r + b[1]!) * r + b[2]!) * r + b[3]!) * r + b[4]!) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return (
    -(((((c[0]! * q + c[1]!) * q + c[2]!) * q + c[3]!) * q + c[4]!) * q + c[5]!) /
    ((((d[0]! * q + d[1]!) * q + d[2]!) * q + d[3]!) * q + 1)
  );
}
