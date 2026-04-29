import { THEME } from './tokens';

// Paleta secuencial para gráficos sin asignación semántica.
// Single source of truth: THEME.chartColors. Re-export bajo
// nombres alternativos para consumers existentes.
export const chartColors = THEME.chartColors;

// Alias retro-compatible — current consumers usan `COLORS`.
export const COLORS = THEME.chartColors;

// Paleta SROI — extraída de IndicatorRenderer (sroi_balance_chart).
// Inputs en escala azul (institucional); Outcomes con semántica estricta
// (ambiental=primary, económico=tertiary, brecha=critical).
// Re-export desde @/theme para que componente SR1 (commit 8) la consuma.
export const sroiPalette: Record<string, string> = {
  Masbosques: '#2563eb',    // Blue 600
  Municipios: '#3b82f6',    // Blue 500
  CORNARE: '#60a5fa',       // Blue 400
  Medioambiente: '#34d399', // Emerald 400 — Primary
  Estado: '#3b82f6',        // Blue 500 — Institutional Benefit
  Familias: '#fbbf24',      // Amber 400 — Economic
  Mujeres: '#f87171',       // Red 400 — Critical Gap
};
