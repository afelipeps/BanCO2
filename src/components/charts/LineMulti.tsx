import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { THEME } from '@/theme';
import type { LineMultiIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: LineMultiIndicator;
}

const LineMulti: React.FC<Props> = ({ indicator }) => {
  const { data } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 9}} />
          <YAxis stroke="#64748b" fontSize={10} unit="%" domain={[0, 100]} />
          <Tooltip content={<CustomTooltip unit="%" />} />
          <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
          <Line type="monotone" dataKey="bienestar" name="Bienestar Económico" stroke={THEME.colors.tertiary} strokeWidth={3} dot={{r: 4, fill: THEME.colors.tertiary}} />
          <Line type="monotone" dataKey="compromiso" name="Compromiso Cultural" stroke={THEME.colors.primary} strokeWidth={3} dot={{r: 4, fill: THEME.colors.primary}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineMulti;
