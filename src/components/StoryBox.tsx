import React from 'react';
import { Info, AlertTriangle, CheckCircle, LucideIcon } from 'lucide-react';
import type { Story, StoryType } from '@/types';

const styles: Record<StoryType, { border: string; bg: string; text: string; title: string; icon: LucideIcon }> = {
  // Info → Secondary (Blue)
  info: { border: 'border-l-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-200', title: 'text-blue-100', icon: Info },
  // Alert → Critical (Red)
  alert: { border: 'border-l-red-400', bg: 'bg-red-400/10', text: 'text-red-200', title: 'text-red-100', icon: AlertTriangle },
  // Success → Primary (Emerald)
  success: { border: 'border-l-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-200', title: 'text-emerald-100', icon: CheckCircle },
};

const StoryBox: React.FC<Story> = ({ title, text, type = 'info' }) => {
  const currentStyle = styles[type];
  const IconComponent = currentStyle.icon;

  return (
    <div className={`relative p-4 mt-4 rounded-r-lg border-l-4 ${currentStyle.border} ${currentStyle.bg} transition-all`}>
      <div className="flex gap-3">
        <IconComponent className={`mt-0.5 min-w-[18px] ${currentStyle.text}`} size={18} />
        <div>
          <h4 className={`font-bold text-xs uppercase tracking-wide mb-1 ${currentStyle.title}`}>{title}</h4>
          <p className="text-slate-300 text-sm leading-snug italic opacity-90">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default StoryBox;
