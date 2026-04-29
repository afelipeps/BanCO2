// Plotly smoke test — 1 boxplot mínimo. Solo medimos bundle, no UX.
// Usamos plotly.js-basic-dist-min (no la versión completa con MathJax/3D).
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-basic-dist-min';
import { E4 } from '../../fixtures';
import { THEME } from '../../theme';

// react-plotly.js factory acepta Plotly. plotly.js-basic-dist-min es compatible.
// Tipos: react-plotly.js no exporta el tipo de createPlotlyComponent argument bien.
// Casting controlado: aceptable en sub-app aislada de benchmark.
const Plot = createPlotlyComponent(Plotly as unknown as Parameters<typeof createPlotlyComponent>[0]);

export function PlotlySmoke(): ReactNode {
  const data = useMemo(
    () => [
      {
        type: 'box' as const,
        name: 'Hombres',
        y: E4.points.filter((p) => p.sex === 'H').map((p) => p.ingreso),
        boxpoints: 'all' as const,
        jitter: 0.4,
        pointpos: 0,
        marker: { color: THEME.colors.sex.H, opacity: 0.7 },
        line: { color: THEME.colors.sex.H },
      },
      {
        type: 'box' as const,
        name: 'Mujeres',
        y: E4.points.filter((p) => p.sex === 'M').map((p) => p.ingreso),
        boxpoints: 'all' as const,
        jitter: 0.4,
        pointpos: 0,
        marker: { color: THEME.colors.sex.M, opacity: 0.7 },
        line: { color: THEME.colors.sex.M },
      },
    ],
    [],
  );
  const layout = useMemo(
    () => ({
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: THEME.colors.text, size: 12 },
      margin: { l: 72, r: 24, t: 32, b: 48 },
      yaxis: {
        title: { text: 'COP/mes' },
        gridcolor: THEME.colors.grid,
        zerolinecolor: THEME.colors.grid,
      },
      xaxis: { gridcolor: 'transparent' },
      showlegend: false,
    }),
    [],
  );
  return (
    <section aria-labelledby="pl-boxplot-title">
      <h2 id="pl-boxplot-title" style={{ fontSize: 14, color: THEME.colors.text, margin: '8px 0' }}>
        E4 Brecha género ingreso (Plotly smoke) — n={E4.n}
      </h2>
      <div style={{ height: 380 }}>
        <Plot
          data={data as unknown as never[]}
          layout={layout as unknown as Record<string, unknown>}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false, responsive: true }}
          useResizeHandler
        />
      </div>
    </section>
  );
}
