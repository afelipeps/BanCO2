import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { THEME, COLORS } from '@/theme';
import type { BarHorizontalIndicator } from '@/types';
import CustomTooltip from '../CustomTooltip';

interface Props {
  indicator: BarHorizontalIndicator;
}

const BarHorizontal: React.FC<Props> = ({ indicator }) => {
  const { data, tooltipUnit } = indicator;
  return (
    <div className="h-64 lg:h-56 w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{left: 0, right: 20}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#64748b" hide />
          {/* AUMENTADO EL WIDTH A 150 PARA QUE QUEPAN LAS ETIQUETAS LARGAS */}
          <YAxis dataKey="name" type="category" width={150} stroke="#94a3b8" tick={{fontSize: 10}} />
          <Tooltip cursor={{fill: '#334155', opacity: 0.1}} content={<CustomTooltip unit={tooltipUnit || '%'} />} />
          {/* Agregado minPointSize y LabelList para destacar valores pequeños como el de Mujeres */}
          <Bar dataKey="value" fill={THEME.colors.primary} radius={[0, 4, 4, 0]} barSize={20} minPointSize={3}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || entry.fill || COLORS[index % COLORS.length]} />
            ))}
            <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} formatter={(val: number | string) => typeof val === 'number' ? (val < 1000 ? val : `$${(val).toLocaleString()}`) : val} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarHorizontal;
