// E4 Boxplot ECharts — usa serie nativa boxplot + scatter superpuesto.
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { registerEcharts } from './registry';
import { E4, computeBoxStats } from '../../fixtures';
import { THEME } from '../../theme';

registerEcharts();

function buildOption(): EChartsCoreOption {
  const groups = (['H', 'M'] as const).map((sex) => ({
    sex,
    values: E4.points.filter((p) => p.sex === sex).map((p) => p.ingreso),
  }));
  const boxData = groups.map((g) => {
    const s = computeBoxStats(g.values);
    return [s.min, s.q1, s.median, s.q3, s.max];
  });
  // Scatter superpuesto con jitter horizontal para puntos crudos.
  const scatter = E4.points.map((p) => {
    const groupIdx = p.sex === 'H' ? 0 : 1;
    const jitter = (Math.random() - 0.5) * 0.4;
    return {
      value: [groupIdx + jitter, p.ingreso],
      itemStyle: { color: THEME.colors.sex[p.sex], opacity: 0.7 },
    };
  });
  // Outliers
  const outliers: Array<[number, number]> = [];
  groups.forEach((g, i) => {
    const s = computeBoxStats(g.values);
    s.outliers.forEach((v) => outliers.push([i, v]));
  });
  return {
    backgroundColor: 'transparent',
    grid: { left: 72, right: 24, top: 32, bottom: 48 },
    xAxis: {
      type: 'category',
      data: ['Hombres', 'Mujeres'],
      axisLine: { lineStyle: { color: THEME.colors.grid } },
      axisLabel: { color: THEME.colors.text, fontSize: 12 },
      splitArea: { show: false },
    },
    yAxis: {
      type: 'value',
      name: 'COP/mes',
      nameTextStyle: { color: THEME.colors.textMuted, fontSize: 11 },
      axisLine: { lineStyle: { color: THEME.colors.grid } },
      axisLabel: {
        color: THEME.colors.textMuted,
        fontSize: 11,
        formatter: (v: number) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`),
      },
      splitLine: { lineStyle: { color: THEME.colors.grid, type: 'dashed' } },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: THEME.colors.bgPanelAlt,
      borderColor: THEME.colors.grid,
      textStyle: { color: THEME.colors.text, fontSize: 12 },
    },
    series: [
      {
        name: 'Boxplot ingreso',
        type: 'boxplot',
        data: boxData,
        itemStyle: {
          color: 'rgba(59,130,246,0.25)',
          borderColor: THEME.colors.sex.H,
        },
      },
      {
        name: 'Scatter datos crudos',
        type: 'scatter',
        symbolSize: 8,
        data: scatter,
        // Mapear coordenadas categóricas reales (H=0, M=1) con jitter aplicado.
        // En ECharts, cuando xAxis es categoría, la posición numérica funciona como índice.
      },
      {
        name: 'Outliers',
        type: 'scatter',
        symbolSize: 10,
        symbol: 'diamond',
        data: outliers.map((o) => ({
          value: o,
          itemStyle: { color: THEME.colors.danger, borderColor: THEME.colors.text },
          label: { show: true, formatter: (params: { value: [number, number] }) => `${(params.value[1] / 1_000_000).toFixed(1)}M`, color: THEME.colors.text, fontSize: 10, position: 'right' },
        })),
      },
    ],
  };
}

export function EchartsBoxplot(): ReactNode {
  const option = useMemo(buildOption, []);
  return (
    <section aria-labelledby="ec-boxplot-title">
      <h2 id="ec-boxplot-title" style={{ fontSize: 14, color: THEME.colors.text, margin: '8px 0' }}>
        E4 Brecha género ingreso (ECharts) — n={E4.n}
      </h2>
      <div style={{ height: 380 }}>
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </section>
  );
}
