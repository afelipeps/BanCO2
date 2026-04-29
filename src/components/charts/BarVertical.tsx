import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { THEME, COLORS } from '@/theme';
import type { BarVerticalIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: BarVerticalIndicator;
}

const BarVertical: React.FC<Props> = ({ indicator }) => {
  const { data, tooltipUnit } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{left: 0, right: 10}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={10} />
          <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{fontSize: 10}} />
          <Tooltip cursor={{fill: '#334155', opacity: 0.1}} content={<CustomTooltip unit={tooltipUnit || '%'} />} />
          <Bar dataKey="value" fill={THEME.colors.secondary} radius={[0, 4, 4, 0]} barSize={12}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarVertical;
