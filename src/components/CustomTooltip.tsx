import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unit?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl bg-opacity-95 backdrop-blur-sm min-w-[140px] z-50">
        <p className="text-slate-400 text-[10px] font-bold mb-2 border-b border-slate-800 pb-1 uppercase tracking-wider">
          {label || payload[0].name}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}></span>
              <span className="text-xs font-medium text-slate-200">
                 {/* Manejo especial para nombres */}
                 {entry.name === 'x' || entry.name === 'y' || entry.name === 'z' ? entry.dataKey : entry.name}:
              </span>
            </div>
            <span className="text-sm font-bold text-white tabular-nums font-mono">
              {/* Formateo de moneda o unidad estándar */}
              {typeof entry.value === 'number' && (entry.dataKey === 'income' || Math.abs(entry.value) > 1000)
                ? `$${entry.value.toLocaleString()}` 
                : `${entry.value}${unit ? ` ${unit}` : ''}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;