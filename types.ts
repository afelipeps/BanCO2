import { LucideIcon } from 'lucide-react';

export interface Story {
  title: string;
  text: string;
  type?: 'info' | 'alert' | 'success' | string;
}

export interface BarConfig {
  key: string;
  name: string;
  color: string;
}

export interface Indicator {
  id: string;
  title: string;
  type: string;
  subtitle?: string;
  description?: string;
  tooltipUnit?: string;
  data?: any; // Flexible data structure for various charts
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
  regressionPoints?: any[];
}

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  indicators: Indicator[];
}

export interface DataSource {
  [key: string]: Category;
}