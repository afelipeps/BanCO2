import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { KpiRatingIndicator } from '@/types';

interface Props {
  indicator: KpiRatingIndicator;
}

const KpiRating: React.FC<Props> = ({ indicator }) => {
  const { value, max, isAlert } = indicator;
  const percentage = (value / max) * 100;
  return (
    <div className="py-4 w-full">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-baseline gap-1">
           <span className="text-4xl font-bold text-white">{value}</span>
           <span className="text-slate-500 text-xs font-medium">/ {max}.0</span>
        </div>
        {isAlert && <span className="text-red-400 text-[10px] font-bold uppercase flex items-center bg-red-400/30 px-2 py-0.5 rounded border border-red-400/50"><AlertTriangle size={10} className="mr-1"/> Crítico</span>}
      </div>
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
        <div className={`h-full ${isAlert ? 'bg-red-400' : 'bg-emerald-400'} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(52,211,153,0.2)]`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default KpiRating;
