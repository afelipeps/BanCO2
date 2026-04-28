import React from 'react';
import { ScatterChart, Scatter as RScatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { COLORS } from '@/theme';
import type { ScatterIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: ScatterIndicator;
}

const Scatter: React.FC<Props> = ({ indicator }) => {
  const { data, xLabel, yLabel, tooltipUnit, title } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 30, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            stroke="#64748b"
            fontSize={10}
            unit=" Ha"
            padding={{ left: 10, right: 30 }} // UX FIX: Padding para evitar corte burbuja
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            stroke="#64748b"
            fontSize={10}
            unit=" Ha"
            padding={{ top: 20, bottom: 10 }} // UX FIX: Padding vertical
          />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip unit={tooltipUnit || ''} />} />
          <RScatter name={title} data={data} fill="#8884d8">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </RScatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Scatter;
