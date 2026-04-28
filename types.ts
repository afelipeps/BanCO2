// SHIM TRANSICIONAL — F2 commit 3. Eliminado en commit 7.
//
// Re-exporta los tipos estrictos de src/types bajo nombres canónicos,
// EXCEPTO `Indicator` y `Category` que permanecen apuntando a sus
// versiones legacy (permisivas) para no romper data.tsx + componentes
// raíz hasta que commit 6/7 los migren.

export type {
  Disclosure,
  IndicatorValue,
  Story,
  StoryType,
  BarConfig,
  IndicatorBase,
  KpiCardIndicator,
  KpiRatingIndicator,
  PieDatum,
  PieChartIndicator,
  BarDatum,
  BarHorizontalIndicator,
  BarVerticalIndicator,
  BarStackedIndicator,
  ScatterDatum,
  ScatterIndicator,
  RadarDatum,
  RadarIndicator,
  LineMultiDatum,
  LineMultiIndicator,
  ComboDatum,
  ComboIndicator,
  ErosionDatum,
  ErosionIndicator,
  FunnelDatum,
  FunnelIndicator,
  CorrelationDatum,
  CorrelationIndicator,
  WordCountRow,
  WordCountTableIndicator,
  TextQuadrant,
  TextMatrixData,
  TextMatrixIndicator,
  SroiBalanceRow,
  SroiBalanceChartIndicator,
  SroiEvidenceRow,
  SroiEvidenceTableIndicator,
  SroiFutureImpactRow,
  SroiFutureImpactTableIndicator,
  IndicatorType,
  Section,
  DataSource,
  SectionKey,
} from './src/types';

// La unión estricta queda accesible bajo el nombre transicional `IndicatorStrict`.
// En commit 7 se promociona a `Indicator` y se elimina el alias legacy.
export type { Indicator as IndicatorStrict } from './src/types';

// Legacy permisivo — preserva contrato pre-F2 con consumers raíz.
export type { IndicatorLegacy as Indicator, CategoryLegacy as Category } from './src/types';
