// Registro tree-shake-friendly de ECharts: solo importamos charts/components
// que efectivamente usamos en los 3 canarios. Nunca `import * from 'echarts'`.
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BoxplotChart, ScatterChart, HeatmapChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  MarkLineComponent,
} from 'echarts/components';

let registered = false;
export function registerEcharts(): void {
  if (registered) return;
  use([
    CanvasRenderer,
    BoxplotChart,
    ScatterChart,
    HeatmapChart,
    BarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    VisualMapComponent,
    MarkLineComponent,
  ]);
  registered = true;
}
