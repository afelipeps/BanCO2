// Tipos transicionales — mantienen la shape permisiva pre-F2 mientras
// commits 3-6 migran consumers. Eliminados en commit 7.
import type { LucideIcon } from 'lucide-react';
import type { Story } from './story';
import type { Disclosure } from './disclosure';
import type { BarConfig } from './viz';

export interface IndicatorLegacy {
  id: string;
  title: string;
  type: string;
  subtitle?: string;
  description?: string;
  tooltipUnit?: string;
  data?: unknown;
  kpiValue?: string | number;
  kpiUnit?: string;
  icon?: LucideIcon;
  trend?: string;
  value?: number;
  max?: number;
  isAlert?: boolean;
  xLabel?: string;
  yLabel?: string;
  bars?: BarConfig[];
  story: Story;
  regressionPoints?: unknown;
  disclosure?: Disclosure;
}

export interface CategoryLegacy {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  indicators: IndicatorLegacy[];
  disclosure?: Disclosure;
}
