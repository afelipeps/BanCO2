// P3 Pirámide poblacional ECharts — bars apiladas con valores negativos para hombres.
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { registerEcharts } from './registry';
import { P3 } from '../../fixtures';
import { THEME } from '../../theme';

registerEcharts();

function buildOption(): EChartsCoreOption {
  const bins = [...P3.bins].reverse();
  const labels = bins.map((b) => b.bin);
  const men = bins.map((b) => -b.men);
  const women = bins.map((b) => b.women);
  const max = Math.max(...bins.flatMap((b) => [b.men, b.women]));
  return {
    backgroundColor: 'transparent',
    grid: { left: 56, right: 24, top: 32, bottom: 32 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: THEME.colors.bgPanelAlt,
      borderColor: THEME.colors.grid,
      textStyle: { color: THEME.colors.text, fontSize: 12 },
      formatter: (params: Array<{ seriesName: string; value: number }>) =>
        params
          .map((p) => `${p.seriesName}: <b>${Math.abs(p.value)}</b>`)
          .join('<br/>'),
    },
    legend: {
      data: ['Hombres', 'Mujeres'],
      textStyle: { color: THEME.colors.textMuted, fontSize: 11 },
      top: 0,
    },
    xAxis: {
      type: 'value',
      min: -max,
      max,
      axisLine: { lineStyle: { color: THEME.colors.grid } },
      axisLabel: { color: THEME.colors.textMuted, formatter: (v: number) => Math.abs(v).toString() },
      splitLine: { lineStyle: { color: THEME.colors.grid, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: labels,
      axisLine: { lineStyle: { color: THEME.colors.grid } },
      axisLabel: { color: THEME.colors.text, fontSize: 11 },
    },
    series: [
      {
        name: 'Hombres',
        type: 'bar',
        stack: 'pyramid',
        data: men,
        itemStyle: { color: THEME.colors.sex.H },
        label: { show: true, formatter: (p: { value: number }) => Math.abs(p.value).toString(), color: THEME.colors.text, position: 'left', fontSize: 10 },
      },
      {
        name: 'Mujeres',
        type: 'bar',
        stack: 'pyramid',
        data: women,
        itemStyle: { color: THEME.colors.sex.M },
        label: { show: true, color: THEME.colors.text, position: 'right', fontSize: 10 },
      },
    ],
  };
}

export function EchartsPyramid(): ReactNode {
  const option = useMemo(buildOption, []);
  const totalH = P3.bins.reduce((a, b) => a + b.men, 0);
  const totalM = P3.bins.reduce((a, b) => a + b.women, 0);
  return (
    <section aria-labelledby="ec-pyramid-title">
      <h2 id="ec-pyramid-title" style={{ fontSize: 14, color: THEME.colors.text, margin: '8px 0' }}>
        P3 Pirámide poblacional (ECharts) — n={P3.n} (H={totalH}, M={totalM})
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
