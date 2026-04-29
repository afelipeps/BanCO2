// Stress page: 3 charts ECharts juntos en una página, para LCP real con Lighthouse.
// Usamos ECharts porque en F3 es la candidata más probable de migrar; recharts
// tiene su propia stress page implícita en /recharts.
import type { ReactNode } from 'react';
import { EchartsBoxplot } from '../echarts/Boxplot';
import { EchartsHeatmap } from '../echarts/Heatmap';
import { EchartsPyramid } from '../echarts/Pyramid';

export function Stress(): ReactNode {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <p style={{ color: '#94a3b8', fontSize: 12 }}>
        Stress page para LCP en Lighthouse (3 charts ECharts simultáneos, mismo viewport).
      </p>
      <EchartsBoxplot />
      <EchartsHeatmap />
      <EchartsPyramid />
    </div>
  );
}
