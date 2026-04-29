// ST6 Heatmap 5x5 Confianza × Puntualidad — recharts custom.
// Recharts no tiene heatmap nativo. Implementación: ScatterChart con XAxis+YAxis
// numéricos + 25 ReferenceArea (una por celda) que toman coordenadas data
// directas. Los counts se rinden como Scatter labels.
import type { ReactNode } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from 'recharts';
import { ST6 } from '../../fixtures';
import { THEME } from '../../theme';

const PALETTE = THEME.colors.heatmap;

function colorForCount(count: number, maxCount: number): string {
  if (count === 0) return THEME.colors.bgPanel;
  const ratio = count / maxCount;
  const idx = Math.min(PALETTE.length - 1, Math.max(1, Math.floor(ratio * PALETTE.length)));
  return PALETTE[idx] ?? PALETTE[PALETTE.length - 1] ?? '#10b981';
}

export function RechartsHeatmap(): ReactNode {
  const maxCount = Math.max(...ST6.matrix.map((c) => c.count));
  return (
    <section aria-labelledby="rc-heatmap-title">
      <h2 id="rc-heatmap-title" style={{ fontSize: 14, color: THEME.colors.text, margin: '8px 0' }}>
        ST6 Confianza × Puntualidad (recharts custom) — n={ST6.n}, ρ=
        {ST6.spearmanRho.toFixed(3)}
      </h2>
      <div style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 24, bottom: 48, left: 56 }}>
            <CartesianGrid stroke={THEME.colors.grid} strokeDasharray="2 2" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              stroke={THEME.colors.textMuted}
              fontSize={11}
              label={{
                value: ST6.xAxis.label,
                position: 'insideBottom',
                offset: -8,
                fill: THEME.colors.textMuted,
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              stroke={THEME.colors.textMuted}
              fontSize={11}
              label={{
                value: ST6.yAxis.label,
                angle: -90,
                position: 'insideLeft',
                fill: THEME.colors.textMuted,
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                background: THEME.colors.bgPanelAlt,
                border: `1px solid ${THEME.colors.grid}`,
                color: THEME.colors.text,
                fontSize: 12,
              }}
              formatter={
                ((_v: unknown, _n: unknown, item: { payload?: { x: number; y: number; count: number } }) => {
                  const d = item?.payload;
                  if (!d) return ['', ''];
                  return [
                    `${d.count} familia${d.count === 1 ? '' : 's'}`,
                    `Conf ${d.y} × Punt ${d.x}`,
                  ];
                }) as never
              }
            />
            {ST6.matrix.map((c) => (
              <ReferenceArea
                key={`${c.x}-${c.y}`}
                x1={c.x - 0.5}
                x2={c.x + 0.5}
                y1={c.y - 0.5}
                y2={c.y + 0.5}
                fill={colorForCount(c.count, maxCount)}
                fillOpacity={c.count === 0 ? 0.6 : 1}
                stroke={c.count === 0 ? THEME.colors.grid : THEME.colors.bgPanel}
                strokeOpacity={0.6}
                strokeWidth={1}
                strokeDasharray={c.count === 0 ? '2 2' : undefined}
                label={{
                  value: c.count === 0 ? '' : c.count.toString(),
                  fill: THEME.colors.text,
                  fontSize: 11,
                  fontWeight: 600,
                  position: 'center',
                }}
              />
            ))}
            {/* Scatter "ghost" para que el tooltip pueda mostrar info por celda. */}
            <Scatter
              data={ST6.matrix.filter((c) => c.count > 0)}
              fill="transparent"
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
