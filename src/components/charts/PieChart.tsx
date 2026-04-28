import React from 'react';
import { PieChart as RPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '@/theme';
import type { PieChartIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: PieChartIndicator;
}

const PieChart: React.FC<Props> = ({ indicator }) => {
  const { data, tooltipUnit } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || entry.fill || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip unit={tooltipUnit || '%'} />} />
          <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{fontSize: '10px', color: '#94a3b8'}} />
        </RPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
