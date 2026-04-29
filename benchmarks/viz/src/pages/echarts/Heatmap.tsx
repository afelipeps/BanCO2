// ST6 Heatmap ECharts — serie heatmap nativa con visualMap.
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { registerEcharts } from './registry';
import { ST6 } from '../../fixtures';
import { THEME } from '../../theme';

registerEcharts();

function buildOption(): EChartsCoreOption {
  const max = Math.max(...ST6.matrix.map((c) => c.count));
  const data = ST6.matrix.map((c) => [c.x - 1, c.y - 1, c.count]);
  return {
    backgroundColor: 'transparent',
    grid: { left: 72, right: 96, top: 32, bottom: 56 },
    tooltip: {
      position: 'top',
      backgroundColor: THEME.colors.bgPanelAlt,
      borderColor: THEME.colors.grid,
      textStyle: { color: THEME.colors.text, fontSize: 12 },
      formatter: (p: { data: [number, number, number] }) => {
        const [x, y, count] = p.data;
        return `Conf ${y + 1} × Punt ${x + 1}: <b>${count}</b>`;
      },
    },
    xAxis: {
      type: 'category',
      data: ['1', '2', '3', '4', '5'],
      name: ST6.xAxis.label,
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: THEME.colors.textMuted, fontSize: 11 },
      axisLine: { lineStyle: { color: THEME.colors.grid } },
      axisLabel: { color: THEME.colors.text },
      splitArea: { show: true, areaStyle: { color: ['transparent', 'transparent'] } },
    },
    yAxis: {
      type: 'category',
      data: ['1', '2', '3', '4', '5'],
      name: ST6.yAxis.label,
      nameLocation: 'middle',
      nameGap: 36,
      nameRotate: 90,
      nameTextStyle: { color: THEME.colors.textMuted, fontSize: 11 },
      axisLine: { lineStyle: { color: THEME.colors.grid } },
      axisLabel: { color: THEME.colors.text },
    },
    visualMap: {
      min: 0,
      max,
      calculable: true,
      orient: 'vertical',
      right: 8,
      top: 'middle',
      textStyle: { color: THEME.colors.textMuted },
      inRange: { color: THEME.colors.heatmap as unknown as string[] },
    },
    series: [
      {
        name: 'Conteo',
        type: 'heatmap',
        data,
        label: { show: true, color: THEME.colors.text, fontSize: 11 },
        itemStyle: { borderColor: THEME.colors.bgPanel, borderWidth: 1 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      },
    ],
  };
}

export function EchartsHeatmap(): ReactNode {
  const option = useMemo(buildOption, []);
  return (
    <section aria-labelledby="ec-heatmap-title">
      <h2 id="ec-heatmap-title" style={{ fontSize: 14, color: THEME.colors.text, margin: '8px 0' }}>
        ST6 Confianza × Puntualidad (ECharts) — n={ST6.n}, ρ={ST6.spearmanRho.toFixed(3)}
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
