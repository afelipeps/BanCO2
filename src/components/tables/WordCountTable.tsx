import React from 'react';
import type { WordCountTableIndicator } from '@/types';

interface Props {
  indicator: WordCountTableIndicator;
}

const WordCountTable: React.FC<Props> = ({ indicator }) => {
  return (
    <div className="w-full mt-2 overflow-hidden rounded-lg border border-slate-700">
      <table className="w-full text-xs text-left text-slate-300">
        <thead className="text-[10px] text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
          <tr>
            <th scope="col" className="px-3 py-2 font-bold w-1/4">Categoría</th>
            <th scope="col" className="px-3 py-2 font-bold">Especies (Frecuencia)</th>
            <th scope="col" className="px-3 py-2 font-bold w-16 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {indicator.data.map((row, index) => (
            <tr key={index} className={`border-b border-slate-800 hover:bg-slate-800/50 ${row.isTotal ? 'bg-slate-900 font-bold text-white border-t-2 border-slate-600' : ''}`}>
              <td className="px-3 py-2 font-medium flex items-center gap-2">
                {row.icon && <row.icon size={14} className={row.color} />}
                {row.category}
              </td>
              <td className="px-3 py-2 leading-relaxed text-slate-400">
                {row.species}
              </td>
              <td className="px-3 py-2 text-right font-mono text-emerald-400">
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WordCountTable;
