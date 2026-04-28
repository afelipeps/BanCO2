import React from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';
import type { KpiCardIndicator } from '@/types';

interface Props {
  indicator: KpiCardIndicator;
}

const KpiCard: React.FC<Props> = ({ indicator }) => {
  const { kpiValue, kpiUnit, icon: IconComponent, trend } = indicator;
  const isCritical = trend?.includes('Déficit') || trend?.includes('Riesgo') || trend?.includes('Atención');
  return (
    <div className="flex items-center gap-4 py-2">
      <div className={`p-3 rounded-full ${isCritical ? 'bg-red-400/20 text-red-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
        {IconComponent ? <IconComponent size={28} /> : <CheckCircle size={28} />}
      </div>
      <div>
        <div className="text-3xl font-bold text-white tracking-tight">{kpiValue}</div>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{kpiUnit}</div>
        {trend && (
          <div className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${isCritical ? 'border-red-400/30 text-red-300 bg-red-400/10' : 'border-slate-700 text-slate-400 bg-slate-800'}`}>
            <TrendingUp size={10} className="mr-1" /> {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
