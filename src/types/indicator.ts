import type { LucideIcon } from 'lucide-react';
import type { Story } from './story';
import type { Disclosure } from './disclosure';
import type { BarConfig } from './viz';

export interface IndicatorBase {
  id: string;
  title: string;
  story: Story;
  disclosure?: Disclosure;
  tooltipUnit?: string;
  isAlert?: boolean;
}

// ── Cards ─────────────────────────────────────────────────────────────────
export interface KpiCardIndicator extends IndicatorBase {
  type: 'kpi_card';
  kpiValue: string | number;
  kpiUnit: string;
  icon?: LucideIcon;
  trend: string;
}

export interface KpiRatingIndicator extends IndicatorBase {
  type: 'kpi_rating';
  value: number;
  max: number;
}

// ── Charts simples ────────────────────────────────────────────────────────
export interface PieDatum {
  name: string;
  value: number;
  color?: string;
  fill?: string;
}
export interface PieChartIndicator extends IndicatorBase {
  type: 'chart_pie';
  data: PieDatum[];
}

export interface BarDatum {
  name: string;
  value: number;
  color?: string;
  fill?: string;
}
export interface BarHorizontalIndicator extends IndicatorBase {
  type: 'chart_bar_horizontal';
  data: BarDatum[];
}
export interface BarVerticalIndicator extends IndicatorBase {
  type: 'chart_bar_vertical';
  data: BarDatum[];
}

// ── Charts con keys dinámicas / multi-serie ───────────────────────────────
export interface BarStackedIndicator extends IndicatorBase {
  type: 'chart_bar_stacked';
  data: Array<Record<string, string | number>>;
  bars: BarConfig[];
}

export interface ScatterDatum {
  x: number;
  y: number;
  z?: number;
  name?: string;
  fill?: string;
}
export interface ScatterIndicator extends IndicatorBase {
  type: 'chart_scatter';
  data: ScatterDatum[];
  xLabel?: string;
  yLabel?: string;
}

export interface RadarDatum {
  subject: string;
  A: number;
  fullMark: number;
}
export interface RadarIndicator extends IndicatorBase {
  type: 'chart_radar';
  data: RadarDatum[];
}

// chart_line_multi: keys hardcoded en IndicatorRenderer (bienestar, compromiso).
// Shape literal preservado byte-a-byte. Si F4 generaliza, migrar a series config.
export interface LineMultiDatum {
  name: string;
  bienestar: number;
  compromiso: number;
}
export interface LineMultiIndicator extends IndicatorBase {
  type: 'chart_line_multi';
  data: LineMultiDatum[];
}

// chart_combo: keys hardcoded (percentage, income).
export interface ComboDatum {
  name: string;
  percentage: number;
  income: number;
}
export interface ComboIndicator extends IndicatorBase {
  type: 'chart_combo';
  data: ComboDatum[];
}

// chart_erosion: keys hardcoded (smlv, incentivo, deficit, cobertura).
export interface ErosionDatum {
  name: string;
  smlv: number;
  incentivo: number;
  deficit: number;
  cobertura: number;
}
export interface ErosionIndicator extends IndicatorBase {
  type: 'chart_erosion';
  data: ErosionDatum[];
}

export interface FunnelDatum {
  name: string;
  value: number;
  fill?: string;
}
export interface FunnelIndicator extends IndicatorBase {
  type: 'chart_funnel';
  data: FunnelDatum[];
}

export interface CorrelationDatum {
  x: number;
  y: number;
  z?: number;
  name?: string;
}
export interface CorrelationIndicator extends IndicatorBase {
  type: 'chart_correlation';
  data: CorrelationDatum[];
  regressionPoints: Array<{ x: number; y: number }>;
  xLabel?: string;
  yLabel?: string;
  rho?: number;
  pValue?: number;
}

// ── Tablas ────────────────────────────────────────────────────────────────
// Shape real en data.tsx: category/species/total (no word/count como decía plan).
export interface WordCountRow {
  category: string;
  species: string;
  total: number;
  icon?: LucideIcon;
  color?: string;
  isTotal?: boolean;
}
export interface WordCountTableIndicator extends IndicatorBase {
  type: 'word_count_table';
  data: WordCountRow[];
}

export interface TextQuadrant {
  title: string;
  text: string;
}
export interface TextMatrixData {
  q1: TextQuadrant;
  q2: TextQuadrant;
  q3: TextQuadrant;
  q4: TextQuadrant;
}
export interface TextMatrixIndicator extends IndicatorBase {
  type: 'text_matrix';
  data: TextMatrixData;
}

// ── SROI custom ───────────────────────────────────────────────────────────
// SR1: index signature porque keys son dinámicas (Masbosques, CORNARE, etc.)
export interface SroiBalanceRow {
  name: string;
  total: number;
  totalFormatted: string;
  [key: string]: string | number;
}
export interface SroiBalanceChartIndicator extends IndicatorBase {
  type: 'sroi_balance_chart';
  data: SroiBalanceRow[];
}

export interface SroiEvidenceRow {
  group: string;
  indicator: string;
  source: string;
  grossValue: string;
  attribution: string;
  displacement: string | null;
  netValue: string;
  icon?: LucideIcon;
  color?: string;
}
export interface SroiEvidenceTableIndicator extends IndicatorBase {
  type: 'sroi_evidence_table';
  data: SroiEvidenceRow[];
}

export interface SroiFutureImpactRow {
  outcome: string;
  methodology: string;
  impact: string;
  icon?: LucideIcon;
  color?: string;
}
export interface SroiFutureImpactTableIndicator extends IndicatorBase {
  type: 'sroi_future_impact_table';
  data: SroiFutureImpactRow[];
}

// ── Union final (16 variants — sin cards_grid/kpi_sroi_master/chart_treemap) ──
export type Indicator =
  | KpiCardIndicator
  | KpiRatingIndicator
  | PieChartIndicator
  | BarHorizontalIndicator
  | BarVerticalIndicator
  | BarStackedIndicator
  | ScatterIndicator
  | RadarIndicator
  | LineMultiIndicator
  | ComboIndicator
  | ErosionIndicator
  | FunnelIndicator
  | CorrelationIndicator
  | WordCountTableIndicator
  | TextMatrixIndicator
  | SroiBalanceChartIndicator
  | SroiEvidenceTableIndicator
  | SroiFutureImpactTableIndicator;

export type IndicatorType = Indicator['type'];

export interface Section {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  indicators: Indicator[];
  disclosure?: Disclosure;
}

export type SectionKey =
  | 'geografia'
  | 'poblacion'
  | 'ambiental'
  | 'social'
  | 'economica'
  | 'gobernanza'
  | 'sostenibilidad'
  | 'sroi';

export type DataSource = Record<SectionKey, Section>;
