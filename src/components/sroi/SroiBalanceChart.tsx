import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator } from 'lucide-react';
import { THEME, sroiPalette } from '@/theme';
import type { SroiBalanceChartIndicator } from '@/types';

interface Props {
  indicator: SroiBalanceChartIndicator;
}

const SroiBalanceChart: React.FC<Props> = ({ indicator }) => {
  const { data } = indicator;

  // Recolectar las keys dinámicas de cada barra (Masbosques, CORNARE, etc.)
  // excluyendo las keys reservadas (name, total, totalFormatted).
  const allKeys: string[] = data.reduce((keys: string[], item) => {
    Object.keys(item).forEach((key) => {
      if (key !== 'name' && key !== 'total' && key !== 'totalFormatted' && !keys.includes(key)) {
        keys.push(key);
      }
    });
    return keys;
  }, [] as string[]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* KPI Header - Centered & Scientific Layout */}
      <div className="flex flex-col items-center justify-center bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

        <div className="mb-6 p-3 rounded-full bg-emerald-400/5 text-emerald-400 border border-emerald-400/20 shadow-[0_0_20px_rgba(52,211,153,0.1)]">
          <Calculator size={28} />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 lg:gap-24 w-full z-10">
          <div className="flex flex-col items-center group">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2 group-hover:text-emerald-400 transition-colors">Ratio SROI</div>
            <div className="text-5xl lg:text-6xl font-bold text-white tracking-tighter flex items-baseline filter drop-shadow-lg">
              2.22 <span className="text-2xl text-emerald-500 font-light ml-2 opacity-80">x</span>
            </div>
          </div>

          {/* Scientific Divider - Vertical for Desktop/Tablet */}
          <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>

          {/* Horizontal Divider for Mobile - Visible below MD */}
          <div className="md:hidden w-16 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent my-2"></div>

          <div className="flex flex-col items-center group">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mb-2 group-hover:text-emerald-400 transition-colors">Valor Neto Social</div>
            <div className="text-3xl lg:text-4xl font-mono font-bold text-emerald-400 tracking-tight filter drop-shadow-lg">$3.926 MM</div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="h-64 lg:h-48 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {/* MARGEN DERECHO AMPLIADO A 110px PARA EVITAR COLISIÓN CON ETIQUETAS */}
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 110, left: 0, bottom: 0 }} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
            <XAxis type="number" hide />

            {/* YAxis: Width suficiente para textos, sin líneas visuales para limpieza */}
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              stroke="#94a3b8"
              tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl min-w-[180px] z-50 relative">
                      <p className="text-white font-bold text-xs mb-2 pb-1 border-b border-slate-700">{payload[0].payload.name}</p>
                      {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-xs mb-1">
                          <span style={{ color: entry.color }}>{entry.name}:</span>
                          <span className="font-mono text-slate-200">${entry.value.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-700 mt-2 pt-2 flex justify-between text-xs font-bold text-white">
                        <span>Total:</span>
                        <span>${payload[0].payload.totalFormatted}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Generar barras dinámicamente usando allKeys y la paleta personalizada */}
            {allKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="a"
                fill={sroiPalette[key] || THEME.chartColors[index % THEME.chartColors.length]}
                radius={[0, 2, 2, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Labels de Total superpuestas pero alineadas en el margen derecho reservado */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around py-4 pointer-events-none w-[110px] pr-2">
          {data.map((d, i) => (
            <div key={i} className="flex justify-end items-center">
              <span className="text-[11px] font-bold text-slate-300 bg-slate-900/90 border border-slate-700 px-2 py-1 rounded shadow-sm whitespace-nowrap backdrop-blur-sm">
                ${(d.total / 1000000).toLocaleString('es-CO', { maximumFractionDigits: 0 })} MM
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SroiBalanceChart;
