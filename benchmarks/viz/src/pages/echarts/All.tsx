import type { ReactNode } from 'react';
import { EchartsBoxplot } from './Boxplot';
import { EchartsHeatmap } from './Heatmap';
import { EchartsPyramid } from './Pyramid';

export function EchartsAll(): ReactNode {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <EchartsBoxplot />
      <EchartsHeatmap />
      <EchartsPyramid />
    </div>
  );
}
