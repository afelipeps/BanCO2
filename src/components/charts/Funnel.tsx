import React from 'react';
import { FunnelChart, Funnel as RFunnel, LabelList, Tooltip, ResponsiveContainer } from 'recharts';
import type { FunnelIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: FunnelIndicator;
}

const Funnel: React.FC<Props> = ({ indicator }) => {
  const { data, tooltipUnit } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip content={<CustomTooltip unit={tooltipUnit || '%'} />} cursor={{fill: 'transparent'}} />
          <RFunnel
            dataKey="value"
            data={data}
            isAnimationActive
            stroke="#0f172a"
            strokeWidth={4}
          >
            {/* UX FIX: Etiquetas externas claras y valor interno destacado */}
            <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="name" fontSize={11} />
            <LabelList position="center" fill="#ffffff" stroke="none" dataKey="value" fontSize={14} fontWeight="bold" formatter={(val: number) => `${val}%`} />
          </RFunnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Funnel;
