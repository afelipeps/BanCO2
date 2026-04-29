import React from 'react';
import { TrendingUp, CheckCircle } from 'lucide-react';
import type { KpiCardIndicator } from '@/types';

interface Props {
  indicator: KpiCardIndicator;
}

const KpiCard: React.FC<Props> = ({ indicator }) => {
  const { kpiValue, kpiUnit, icon: IconComponent, trend } = indicator;
  // Preservar lógica byte-a-byte del monolito original: el icon background
  // se vuelve crítico con 3 keywords (Déficit/Riesgo/Atención), pero el
  // trend badge solo con 2 (Déficit/Riesgo). Esto significa que un trend
  // con 'Atención' produce icon rojo + badge gris (intencional). Si F4/F5
  // unifica los criterios, hacerlo explícito en una refactorización
  // declarada con visual diff actualizado.
  const isIconCritical = trend?.includes('Déficit') || trend?.includes('Riesgo') || trend?.includes('Atención');
  const isBadgeCritical = trend?.includes('Déficit') || trend?.includes('Riesgo');
  return (
    <div className="flex items-center gap-4 py-2">
      <div className={`p-3 rounded-full ${isIconCritical ? 'bg-red-400/20 text-red-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
        {IconComponent ? <IconComponent size={28} /> : <CheckCircle size={28} />}
      </div>
      <div>
        <div className="text-3xl font-bold text-white tracking-tight">{kpiValue}</div>
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{kpiUnit}</div>
        {trend && (
          <div className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${isBadgeCritical ? 'border-red-400/30 text-red-300 bg-red-400/10' : 'border-slate-700 text-slate-400 bg-slate-800'}`}>
            <TrendingUp size={10} className="mr-1" /> {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
