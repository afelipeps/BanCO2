import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { THEME } from '@/theme';
import type { ComboIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: ComboIndicator;
}

const Combo: React.FC<Props> = ({ indicator }) => {
  const { data } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 9}} interval={0} />
          <YAxis yAxisId="left" stroke="#64748b" fontSize={10} unit="%" />
          <YAxis yAxisId="right" orientation="right" stroke="#34d399" fontSize={10} tickFormatter={(val) => `$${val/1000000}M`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
          <Bar yAxisId="left" dataKey="percentage" name="Distribución (%)" fill={THEME.colors.secondary} barSize={20} radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="income" name="Ingreso (Mediana)" stroke={THEME.colors.tertiary} strokeWidth={2} dot={{r: 4, fill: THEME.colors.tertiary}} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Combo;
