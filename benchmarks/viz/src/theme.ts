// Subset del THEME del proyecto principal — solo lo que necesitan los benchmarks.
// Mantener sincronizado con src/theme.ts si cambia (no automático en F3).
export const THEME = {
  colors: {
    primary: '#10b981',
    secondary: '#f59e0b',
    danger: '#ef4444',
    grid: '#334155',
    text: '#e2e8f0',
    textMuted: '#94a3b8',
    bgPanel: '#0f172a',
    bgPanelAlt: '#1e293b',
    sex: { H: '#3b82f6', M: '#ec4899' },
    heatmap: ['#0f172a', '#1e3a5f', '#2563eb', '#10b981', '#f59e0b'],
  },
} as const;
