import type { ReactNode } from 'react';
import { RechartsBoxplot } from './Boxplot';
import { RechartsHeatmap } from './Heatmap';
import { RechartsPyramid } from './Pyramid';

export function RechartsAll(): ReactNode {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <RechartsBoxplot />
      <RechartsHeatmap />
      <RechartsPyramid />
    </div>
  );
}
