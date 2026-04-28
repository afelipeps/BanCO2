import React from 'react';
import type { Indicator } from '@/types';
import KpiCard from './cards/KpiCard';
import KpiRating from './cards/KpiRating';
import PieChart from './charts/PieChart';
import BarHorizontal from './charts/BarHorizontal';
import BarVertical from './charts/BarVertical';
import BarStacked from './charts/BarStacked';
import Scatter from './charts/Scatter';
import Radar from './charts/Radar';
import LineMulti from './charts/LineMulti';
import Combo from './charts/Combo';
import Erosion from './charts/Erosion';
import Funnel from './charts/Funnel';
import Correlation from './charts/Correlation';
import WordCountTable from './tables/WordCountTable';
import TextMatrix from './tables/TextMatrix';
import SroiBalanceChart from './sroi/SroiBalanceChart';
import SroiEvidenceTable from './sroi/SroiEvidenceTable';
import SroiFutureImpactTable from './sroi/SroiFutureImpactTable';

interface Props {
  indicator: Indicator;
}

const IndicatorRenderer: React.FC<Props> = ({ indicator }) => {
  switch (indicator.type) {
    case 'kpi_card': return <KpiCard indicator={indicator} />;
    case 'kpi_rating': return <KpiRating indicator={indicator} />;
    case 'chart_pie': return <PieChart indicator={indicator} />;
    case 'chart_bar_horizontal': return <BarHorizontal indicator={indicator} />;
    case 'chart_bar_vertical': return <BarVertical indicator={indicator} />;
    case 'chart_bar_stacked': return <BarStacked indicator={indicator} />;
    case 'chart_scatter': return <Scatter indicator={indicator} />;
    case 'chart_radar': return <Radar indicator={indicator} />;
    case 'chart_line_multi': return <LineMulti indicator={indicator} />;
    case 'chart_combo': return <Combo indicator={indicator} />;
    case 'chart_erosion': return <Erosion indicator={indicator} />;
    case 'chart_funnel': return <Funnel indicator={indicator} />;
    case 'chart_correlation': return <Correlation indicator={indicator} />;
    case 'word_count_table': return <WordCountTable indicator={indicator} />;
    case 'text_matrix': return <TextMatrix indicator={indicator} />;
    case 'sroi_balance_chart': return <SroiBalanceChart indicator={indicator} />;
    case 'sroi_evidence_table': return <SroiEvidenceTable indicator={indicator} />;
    case 'sroi_future_impact_table': return <SroiFutureImpactTable indicator={indicator} />;
    default: {
      // Exhaustive: si se agrega un type al union sin case, tsc rompe acá.
      const _exhaustive: never = indicator;
      return null;
    }
  }
};

export default IndicatorRenderer;
