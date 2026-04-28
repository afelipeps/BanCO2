import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import { THEME } from '@/theme';
import type { ErosionIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: ErosionIndicator;
}

const Erosion: React.FC<Props> = ({ indicator }) => {
  const { data } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{top: 10, right: 10, left: -10, bottom: 0}}>
          <defs>
            <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={THEME.colors.critical} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={THEME.colors.critical} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 9}} />
          <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `$${val/1000}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />

          {/* LÍNEA DE REFERENCIA EN CERO: EL PUNTO DE EQUILIBRIO (Sin etiqueta) */}
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

          {/* SMLV: Referencia de Mercado */}
          <Line type="monotone" dataKey="smlv" name="Salario Mínimo (Ref)" stroke={THEME.colors.textMuted} strokeWidth={1} strokeDasharray="5 5" dot={false} />

          {/* DÉFICIT: ÁREA NEGATIVA CON GRADIENTE */}
          <Area type="monotone" dataKey="deficit" name="Déficit Real (Negativo)" stroke={THEME.colors.critical} fillOpacity={1} fill="url(#colorDeficit)" strokeWidth={2} />

          {/* Incentivo: La variable real */}
          <Line type="monotone" dataKey="incentivo" name="Incentivo PSA" stroke={THEME.colors.tertiary} strokeWidth={3} dot={{r: 4, fill: THEME.colors.tertiary}} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Erosion;
