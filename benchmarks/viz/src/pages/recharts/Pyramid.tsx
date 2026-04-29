// P3 Pirámide poblacional — recharts BarChart layout vertical, valores
// negativos para hombres. Sin stack: Bars separadas, una negativa, una positiva.
import type { ReactNode } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { P3 } from '../../fixtures';
import { THEME } from '../../theme';

interface RowData {
  bin: string;
  hombres: number;
  mujeres: number;
}

function buildRows(): ReadonlyArray<RowData> {
  return [...P3.bins].reverse().map((b) => ({
    bin: b.bin,
    hombres: -b.men,
    mujeres: b.women,
  }));
}

function maxAbs(rows: ReadonlyArray<RowData>): number {
  return Math.max(...rows.map((r) => Math.max(Math.abs(r.hombres), Math.abs(r.mujeres))));
}

export function RechartsPyramid(): ReactNode {
  const rows = buildRows();
  const max = maxAbs(rows);
  const tick = Math.ceil(max / 4);
  const ticks = [-tick * 4, -tick * 2, 0, tick * 2, tick * 4];
  const totalH = P3.bins.reduce((a, b) => a + b.men, 0);
  const totalM = P3.bins.reduce((a, b) => a + b.women, 0);
  return (
    <section aria-labelledby="rc-pyramid-title">
      <h2 id="rc-pyramid-title" style={{ fontSize: 14, color: THEME.colors.text, margin: '8px 0' }}>
        P3 Pirámide poblacional (recharts) — n={P3.n} (H={totalH}, M={totalM})
      </h2>
      <div style={{ height: 380 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rows as RowData[]}
            layout="vertical"
            margin={{ top: 16, right: 24, bottom: 32, left: 56 }}
            barGap={0}
            barCategoryGap="10%"
          >
            <CartesianGrid stroke={THEME.colors.grid} strokeDasharray="3 3" />
            <XAxis
              type="number"
              domain={[-max, max]}
              ticks={ticks}
              tickFormatter={(v: number) => Math.abs(v).toString()}
              stroke={THEME.colors.textMuted}
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="bin"
              stroke={THEME.colors.textMuted}
              fontSize={11}
              width={48}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{
                background: THEME.colors.bgPanelAlt,
                border: `1px solid ${THEME.colors.grid}`,
                color: THEME.colors.text,
                fontSize: 12,
              }}
              formatter={
                ((value: unknown, name: unknown) => {
                  const numeric = typeof value === 'number' ? value : Number(value);
                  return [Math.abs(numeric).toString(), String(name)];
                }) as never
              }
            />
            <Legend wrapperStyle={{ fontSize: 11, color: THEME.colors.textMuted }} />
            <ReferenceLine x={0} stroke={THEME.colors.text} strokeWidth={1} />
            <Bar dataKey="hombres" name="Hombres" fill={THEME.colors.sex.H} isAnimationActive={false}>
              <LabelList
                dataKey="hombres"
                position="left"
                formatter={(v: unknown) => Math.abs(Number(v)).toString()}
                fill={THEME.colors.text}
                fontSize={10}
              />
            </Bar>
            <Bar dataKey="mujeres" name="Mujeres" fill={THEME.colors.sex.M} isAnimationActive={false}>
              <LabelList
                dataKey="mujeres"
                position="right"
                formatter={(v: unknown) => Math.abs(Number(v)).toString()}
                fill={THEME.colors.text}
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
