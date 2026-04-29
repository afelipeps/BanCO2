// E4 Brecha género ingreso — boxplot doble + scatter superpuesto en recharts.
// Recharts NO tiene boxplot nativo. Implementación: ReferenceArea para la caja
// Q1-Q3 + ReferenceLine para mediana y bigotes (usan coordenadas data,
// no hace falta acceder a scales). Scatter para puntos crudos jittered.
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
  ReferenceLine,
} from 'recharts';
import { E4, computeBoxStats, type BoxStats } from '../../fixtures';
import { THEME } from '../../theme';

const SEX_X: Record<'H' | 'M', number> = { H: 1, M: 2 };
const HALF = 0.32;

function formatCop(n: number): string {
  return n.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}

interface BoxData {
  sex: 'H' | 'M';
  cx: number;
  stats: BoxStats;
}

function buildBoxes(): ReadonlyArray<BoxData> {
  return (['H', 'M'] as const).map((sex) => ({
    sex,
    cx: SEX_X[sex],
    stats: computeBoxStats(E4.points.filter((p) => p.sex === sex).map((p) => p.ingreso)),
  }));
}

export function RechartsBoxplot(): ReactNode {
  const boxes = buildBoxes();
  const scatterData = E4.points.map((p) => ({
    x: SEX_X[p.sex] + (Math.random() - 0.5) * 0.4,
    y: p.ingreso,
    sex: p.sex,
  }));
  return (
    <section aria-labelledby="rc-boxplot-title">
      <h2 id="rc-boxplot-title" style={{ fontSize: 14, color: THEME.colors.text, margin: '8px 0' }}>
        E4 Brecha género ingreso (recharts custom) — n={E4.n}
      </h2>
      <div style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 64 }}>
            <CartesianGrid stroke={THEME.colors.grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0.4, 2.6]}
              ticks={[1, 2]}
              tickFormatter={(v: number) => (v === 1 ? 'Hombres' : v === 2 ? 'Mujeres' : '')}
              stroke={THEME.colors.textMuted}
              fontSize={12}
            />
            <YAxis
              type="number"
              dataKey="y"
              stroke={THEME.colors.textMuted}
              fontSize={11}
              tickFormatter={(v: number) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`
              }
              label={{
                value: 'COP/mes',
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
                ((value: unknown, _name: unknown, item: { payload?: { sex?: 'H' | 'M' } }) => {
                  const numeric = typeof value === 'number' ? value : Number(value);
                  const sex = item?.payload?.sex;
                  return [
                    `${formatCop(numeric)} COP`,
                    sex === 'H' ? 'Hombre' : sex === 'M' ? 'Mujer' : '',
                  ];
                }) as never
              }
            />
            {/* Boxes Q1-Q3 + median + whiskers en data coords. */}
            {boxes.map((b) => {
              const fill = THEME.colors.sex[b.sex];
              return (
                <g key={b.sex}>
                  <ReferenceArea
                    x1={b.cx - HALF}
                    x2={b.cx + HALF}
                    y1={b.stats.q1}
                    y2={b.stats.q3}
                    fill={fill}
                    fillOpacity={0.18}
                    stroke={fill}
                    strokeWidth={1.5}
                  />
                  <ReferenceLine
                    segment={[
                      { x: b.cx - HALF, y: b.stats.median },
                      { x: b.cx + HALF, y: b.stats.median },
                    ]}
                    stroke={fill}
                    strokeWidth={2.5}
                    ifOverflow="extendDomain"
                  />
                  <ReferenceLine
                    segment={[
                      { x: b.cx, y: b.stats.min },
                      { x: b.cx, y: b.stats.max },
                    ]}
                    stroke={fill}
                    strokeWidth={1.5}
                    ifOverflow="extendDomain"
                  />
                  <ReferenceLine
                    segment={[
                      { x: b.cx - HALF / 2, y: b.stats.min },
                      { x: b.cx + HALF / 2, y: b.stats.min },
                    ]}
                    stroke={fill}
                    strokeWidth={1.5}
                    ifOverflow="extendDomain"
                  />
                  <ReferenceLine
                    segment={[
                      { x: b.cx - HALF / 2, y: b.stats.max },
                      { x: b.cx + HALF / 2, y: b.stats.max },
                    ]}
                    stroke={fill}
                    strokeWidth={1.5}
                    ifOverflow="extendDomain"
                  />
                </g>
              );
            })}
            {/* Raw points (jittered) */}
            <Scatter
              data={scatterData.filter((p) => p.sex === 'H')}
              fill={THEME.colors.sex.H}
              fillOpacity={0.7}
              shape="circle"
              isAnimationActive={false}
            />
            <Scatter
              data={scatterData.filter((p) => p.sex === 'M')}
              fill={THEME.colors.sex.M}
              fillOpacity={0.7}
              shape="circle"
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
