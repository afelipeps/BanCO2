import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import type { SroiEvidenceTableIndicator } from '@/types';

interface Props {
  indicator: SroiEvidenceTableIndicator;
}

const SroiEvidenceTable: React.FC<Props> = ({ indicator }) => {
  const { data } = indicator;
  return (
    <div className="w-full mt-2 overflow-x-auto rounded-lg border border-slate-700 scrollbar-thin scrollbar-thumb-slate-700">
      <table className="w-full text-xs text-left text-slate-300 min-w-[600px]">
        <thead className="text-[10px] text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
          <tr>
            <th className="px-4 py-3 font-bold w-1/4">Grupo de Interés</th>
            <th className="px-4 py-3 font-bold w-1/4">Indicador / Proxy</th>
            <th className="px-4 py-3 font-bold w-1/4 text-center">Rigor (Atribución)</th>
            <th className="px-4 py-3 font-bold text-right w-1/4">Valor Neto (COP)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-4 py-3 font-medium text-white align-top">
                <div className="flex items-start gap-2">
                  {row.icon && <row.icon size={14} className={`mt-0.5 ${row.color}`} />}
                  <span>{row.group}</span>
                </div>
              </td>
              <td className="px-4 py-3 align-top">
                <div className="font-medium text-slate-200 mb-1 leading-snug">{row.indicator}</div>
                <div className="flex items-center gap-1 text-[9px] text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded w-fit border border-slate-800">
                  <LinkIcon size={9} />
                  {row.source}
                </div>
              </td>
              {/* FIX: Mejorado diseño de la columna Rigor con Grid para alineación perfecta */}
              <td className="px-4 py-3 align-top">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px]">
                  <span className="text-slate-500 text-right">Bruto:</span>
                  <span className="font-mono text-slate-400 text-right">${row.grossValue}</span>

                  <span className="text-slate-500 text-right">Atribución:</span>
                  <span className="font-mono text-amber-400 text-right">{row.attribution}</span>

                  {row.displacement && (
                    <>
                      <span className="text-slate-500 text-right">Desplaz.:</span>
                      <span className="font-mono text-red-400 text-right">{row.displacement}</span>
                    </>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right font-bold font-mono text-emerald-400 align-top text-sm">
                ${row.netValue}
              </td>
            </tr>
          ))}
          {/* Fila de Totales */}
          <tr className="bg-slate-900/80 font-bold border-t-2 border-slate-600">
            <td colSpan={3} className="px-4 py-3 text-right text-slate-400 uppercase tracking-wider text-[10px]">Valor Presente Neto Total</td>
            <td className="px-4 py-3 text-right text-emerald-400 text-sm">$3.926.103.128</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SroiEvidenceTable;
