import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RRadar, Tooltip, ResponsiveContainer } from 'recharts';
import { THEME } from '@/theme';
import type { RadarIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: RadarIndicator;
}

const Radar: React.FC<Props> = ({ indicator }) => {
  const { data, tooltipUnit } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <RRadar name="Impacto" dataKey="A" stroke={THEME.colors.primary} fill={THEME.colors.primary} fillOpacity={0.4} />
          <Tooltip content={<CustomTooltip unit={tooltipUnit || '%'} />} cursor={{fill: 'transparent'}} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Radar;
