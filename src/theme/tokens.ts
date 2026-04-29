// Tokens cromáticos del dashboard. Mapeo semántico → color.
// Cualquier cambio acá se propaga a todos los componentes.
export const THEME = {
  colors: {
    primary: '#34d399',   // Emerald 400 — Ambiental / Variable Principal / Éxito
    secondary: '#3b82f6', // Blue 500 — Institucional / Estructural / Social
    tertiary: '#fbbf24',  // Amber 400 — Económico / Ingresos / Destacado
    critical: '#f87171',  // Red 400 — Brechas / Alertas / Déficit / Mujeres
    neutral: '#64748b',   // Slate 500 — Contexto
    darkBg: '#020617',    // Slate 950 — Fondo Global
    cardBg: '#0f172a',    // Slate 900 — Tarjetas
    textMain: '#f8fafc',  // Slate 50
    textMuted: '#94a3b8', // Slate 400
  },
  // Paleta secuencial — preserved as THEME.chartColors para no romper
  // IndicatorRenderer existente (line 126). Se duplica como named export
  // `chartColors` y alias `COLORS` desde palette.ts.
  chartColors: ['#34d399', '#3b82f6', '#fbbf24', '#f87171'] as const,
} as const;

export type ThemeColors = typeof THEME.colors;
