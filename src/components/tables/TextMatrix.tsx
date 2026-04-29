import React from 'react';
import type { TextMatrixIndicator } from '@/types';

interface Props {
  indicator: TextMatrixIndicator;
}

const TextMatrix: React.FC<Props> = ({ indicator }) => {
  const { data } = indicator;
  return (
    <div className="grid grid-cols-2 gap-2 mt-2 h-48">
      <div className="bg-emerald-400/10 border border-emerald-400/20 p-2 rounded flex flex-col justify-center text-center">
        <h5 className="text-emerald-400 font-bold text-xs uppercase mb-1">{data.q1.title}</h5>
        <p className="text-slate-300 text-xs">{data.q1.text}</p>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded flex flex-col justify-center text-center">
        <h5 className="text-blue-500 font-bold text-xs uppercase mb-1">{data.q2.title}</h5>
        <p className="text-slate-300 text-xs">{data.q2.text}</p>
      </div>
      <div className="bg-amber-400/10 border border-amber-400/20 p-2 rounded flex flex-col justify-center text-center">
        <h5 className="text-amber-400 font-bold text-xs uppercase mb-1">{data.q3.title}</h5>
        <p className="text-slate-300 text-xs">{data.q3.text}</p>
      </div>
      <div className="bg-red-400/10 border border-red-400/20 p-2 rounded flex flex-col justify-center text-center">
        <h5 className="text-red-400 font-bold text-xs uppercase mb-1">{data.q4.title}</h5>
        <p className="text-slate-300 text-xs">{data.q4.text}</p>
      </div>
    </div>
  );
};

export default TextMatrix;
