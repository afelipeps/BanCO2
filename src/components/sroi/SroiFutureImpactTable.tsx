import React from 'react';
import { Info } from 'lucide-react';
import type { SroiFutureImpactTableIndicator } from '@/types';

interface Props {
  indicator: SroiFutureImpactTableIndicator;
}

const SroiFutureImpactTable: React.FC<Props> = ({ indicator }) => {
  const { data } = indicator;
  return (
    <div className="w-full mt-2">
      <div className="overflow-x-auto rounded-t-lg border border-slate-700 scrollbar-thin scrollbar-thumb-slate-700">
        <table className="w-full text-xs text-left text-slate-300 min-w-[500px]">
          <thead className="text-[10px] text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 font-bold w-1/3">Outcome Latente</th>
              <th className="px-4 py-3 font-bold w-1/3">Ruta de Monetización Propuesta</th>
              <th className="px-4 py-3 font-bold text-center w-1/3">Riesgo de Brecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3 align-top">
                  <div className="flex items-start gap-2">
                    {row.icon && <row.icon size={14} className={`mt-0.5 ${row.color}`} />}
                    <span className="font-medium text-slate-200">{row.outcome}</span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-slate-400 leading-snug">
                  {row.methodology}
                </td>
                <td className="px-4 py-3 align-middle text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border ${
                    row.impact.includes('Aumenta') ? 'bg-red-400/20 text-red-300 border-red-400/30' :
                    row.impact.includes('Reduce') ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30' :
                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {row.impact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-900/50 border-x border-b border-slate-700 rounded-b-lg p-3 text-[10px] text-slate-500 flex gap-2 items-start">
        <Info size={14} className="min-w-[14px] mt-0.5 text-slate-400" />
        <p className="italic">
          <strong>Análisis de Disparidad:</strong> La monetización de estos outcomes (particularmente los ambientales) es técnicamente viable y aumentaría el ratio SROI.
          Sin embargo, su inclusión sin corregir los flujos de ingreso familiar incrementaría matemáticamente la brecha entre el valor público generado y el valor privado apropiado por los campesinos.
        </p>
      </div>
    </div>
  );
};

export default SroiFutureImpactTable;
