import { describe, it, expect } from 'vitest';
import { wilsonCI, median, iqr, mean, stdev, spearman } from './stats';

describe('wilsonCI', () => {
  it('p=0.5 n=80 → IC simétrico ~[0.393, 0.607] (replicable scipy)', () => {
    // statsmodels.stats.proportion.proportion_confint(40, 80, method='wilson')
    // → (0.39296, 0.60704)
    const { lower, upper } = wilsonCI(0.5, 80);
    expect(lower).toBeCloseTo(0.3930, 3);
    expect(upper).toBeCloseTo(0.6070, 3);
  });

  it('p=0 n=80 → límite inferior es 0', () => {
    const { lower, upper } = wilsonCI(0, 80);
    expect(lower).toBe(0);
    expect(upper).toBeGreaterThan(0);
    expect(upper).toBeLessThan(0.06);
  });

  it('p=1 n=80 → límite superior es 1', () => {
    const { lower, upper } = wilsonCI(1, 80);
    expect(upper).toBe(1);
    expect(lower).toBeGreaterThan(0.94);
    expect(lower).toBeLessThan(1);
  });

  it('IC más ancho para n=5 que n=80 (baja potencia)', () => {
    const small = wilsonCI(0.5, 5);
    const big = wilsonCI(0.5, 80);
    const widthSmall = small.upper - small.lower;
    const widthBig = big.upper - big.lower;
    expect(widthSmall).toBeGreaterThan(widthBig * 3);
  });

  it('alpha=0.10 produce IC más estrecho que alpha=0.05', () => {
    const ci90 = wilsonCI(0.5, 80, 0.10);
    const ci95 = wilsonCI(0.5, 80, 0.05);
    expect(ci90.upper - ci90.lower).toBeLessThan(ci95.upper - ci95.lower);
  });

  it('NaN en p lanza error', () => {
    expect(() => wilsonCI(NaN, 80)).toThrow('p must be in [0,1]');
  });

  it('p<0 o p>1 lanza error', () => {
    expect(() => wilsonCI(-0.1, 80)).toThrow('p must be in [0,1]');
    expect(() => wilsonCI(1.1, 80)).toThrow('p must be in [0,1]');
  });

  it('n=0 lanza error', () => {
    expect(() => wilsonCI(0.5, 0)).toThrow('n must be > 0');
  });
});

describe('median', () => {
  it('impar [1,2,3] → 2', () => {
    expect(median([1, 2, 3])).toBe(2);
  });

  it('par [1,2,3,4] → 2.5', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('singleton [5] → 5', () => {
    expect(median([5])).toBe(5);
  });

  it('empates Likert [3,3,3,3,5] → 3', () => {
    expect(median([3, 3, 3, 3, 5])).toBe(3);
  });

  it('ordering interno: input [3,1,2] → 2 (no usa orden de input)', () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it('array vacío lanza error', () => {
    expect(() => median([])).toThrow('median requires non-empty array');
  });

  it('NaN en input lanza error', () => {
    expect(() => median([1, NaN, 3])).toThrow('median input contains NaN');
  });
});

describe('iqr', () => {
  it('[1..100] → q1=25.75, q3=75.25 (interpolación tipo 7)', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i + 1);
    const { q1, q3 } = iqr(arr);
    expect(q1).toBeCloseTo(25.75, 2);
    expect(q3).toBeCloseTo(75.25, 2);
  });

  it('constantes [1,1,1,1,1] → q1=q3=1', () => {
    const { q1, q3 } = iqr([1, 1, 1, 1, 1]);
    expect(q1).toBe(1);
    expect(q3).toBe(1);
  });

  it('array vacío lanza error', () => {
    expect(() => iqr([])).toThrow('iqr requires non-empty array');
  });
});

describe('mean / stdev', () => {
  it('mean simple', () => {
    expect(mean([2, 4, 6, 8])).toBe(5);
  });

  it('mean array vacío lanza error', () => {
    expect(() => mean([])).toThrow('mean requires non-empty array');
  });

  it('stdev sample (default) ≈ poblacional con bessel', () => {
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 2);
  });

  it('stdev population (sample=false)', () => {
    expect(stdev([2, 4, 4, 4, 5, 5, 7, 9], { sample: false })).toBeCloseTo(2, 2);
  });

  it('stdev n<2 lanza error', () => {
    expect(() => stdev([1])).toThrow('stdev requires n >= 2');
  });
});

describe('spearman', () => {
  it('correlación perfecta positiva → ρ=1', () => {
    const { rho } = spearman([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]);
    expect(rho).toBe(1);
  });

  it('correlación perfecta negativa → ρ=-1', () => {
    const { rho } = spearman([1, 2, 3, 4, 5], [5, 4, 3, 2, 1]);
    expect(rho).toBe(-1);
  });

  it('varianza cero en x → ρ=NaN', () => {
    const { rho } = spearman([1, 1, 1, 1], [1, 2, 3, 4]);
    expect(rho).toBeNaN();
  });

  it('arrays de distinta longitud lanza error', () => {
    expect(() => spearman([1, 2, 3], [1, 2])).toThrow('arrays must have equal length');
  });

  it('n<3 lanza error', () => {
    expect(() => spearman([1], [2])).toThrow('spearman requires n >= 3');
  });

  it('empates con average rank — ρ replicable contra scipy default', () => {
    // x=[10,20,20,30,40,50], y=[1,2,2,3,4,5] — empates en posiciones 2-3 ambos.
    // scipy.stats.spearmanr → ρ = 1.0 exacto.
    const { rho } = spearman([10, 20, 20, 30, 40, 50], [1, 2, 2, 3, 4, 5]);
    expect(rho).toBeCloseTo(1.0, 5);
  });

  it('caso conocido — ρ=29/42 sobre dataset verificable a mano', () => {
    // x=[1..8], y=[2,1,5,3,8,6,4,7]. Sin empates.
    // Suma de cross-deviation = 29; var(rank) = 42.
    // ρ = 29/42 = 0.6904761904761905. Replicable scipy.stats.spearmanr.
    const x = [1, 2, 3, 4, 5, 6, 7, 8];
    const y = [2, 1, 5, 3, 8, 6, 4, 7];
    const { rho } = spearman(x, y);
    expect(rho).toBeCloseTo(29 / 42, 6);
  });
});
