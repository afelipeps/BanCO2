import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { BarStackedIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: BarStackedIndicator;
}

const BarStacked: React.FC<Props> = ({ indicator }) => {
  const { data, tooltipUnit, bars } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{left: 0, right: 20}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#64748b" hide />
          <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{fontSize: 10}} />
          <Tooltip cursor={{fill: '#334155', opacity: 0.1}} content={<CustomTooltip unit={tooltipUnit || '%'} />} />
          {bars.map((bar, i) => (
            <Bar key={bar.key} dataKey={bar.key} stackId="a" fill={bar.color} radius={i === bars.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]} barSize={20} />
          ))}
          <Legend iconSize={8} wrapperStyle={{fontSize: '10px', color: '#94a3b8'}} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarStacked;
