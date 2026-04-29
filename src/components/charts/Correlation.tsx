import React from 'react';
import { ComposedChart, Scatter, Line, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { THEME } from '@/theme';
import type { CorrelationIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: CorrelationIndicator;
}

const Correlation: React.FC<Props> = ({ indicator }) => {
  const { data, regressionPoints } = indicator;
  return (
    <div className="h-80 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart margin={{ top: 10, right: 30, bottom: 50, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          {/* UX FIX: Eje X Discreto (Likert) */}
          <XAxis
            type="number"
            dataKey="x"
            name="Puntualidad"
            stroke="#64748b"
            fontSize={10}
            domain={[2, 6]} // Aumentado rango para equilibrar visualmente con altura y Y
            ticks={[2, 3, 4, 5, 6]} // Forzar todos los enteros
            allowDecimals={false} // Evitar decimales
            label={{ value: 'Puntualidad de Pagos', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 10 }}
          />
          {/* UX FIX: Eje Y Discreto (Likert) */}
          <YAxis
            type="number"
            dataKey="y"
            name="Confianza"
            stroke="#64748b"
            fontSize={10}
            domain={[2.5, 5.5]} // Mantener rango de datos focalizado
            ticks={[3, 4, 5]} // Forzar solo enteros relevantes
            allowDecimals={false} // Evitar decimales
            label={{ value: 'Confianza Institucional', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, dy: 60 }}
            interval={0}
          />
          {/* UX FIX: Rango Z equilibrado */}
          <ZAxis type="number" dataKey="z" range={[40, 300]} name="Cant. Familias" />

          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />

          {/* UX FIX: Leyenda con margen superior para separar del Eje X */}
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '30px' }}
            verticalAlign="bottom"
            align="center"
            height={36}
          />

          {/* Regresión Lineal */}
          <Line
            data={regressionPoints}
            type="monotone"
            dataKey="y"
            name="Tendencia (r=0.54)"
            stroke={THEME.colors.secondary}
            strokeWidth={3}
            dot={false}
            activeDot={false}
            strokeDasharray="5 5"
          />

          {/* Datos Dispersos (Burbujas) - Nombre limpio */}
          <Scatter
            data={data}
            name="Confianza institucional familias"
            fill={THEME.colors.primary}
            shape="circle"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={THEME.colors.primary} fillOpacity={0.6} />
            ))}
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Correlation;
