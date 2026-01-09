import React from 'react';
import { Info, AlertTriangle, CheckCircle, LucideIcon } from 'lucide-react';
import { Story } from '../types';

interface StoryBoxProps extends Story {}

const StoryBox: React.FC<StoryBoxProps> = ({ title, text, type = "info" }) => {
  let styles = {
    // Info -> Secondary (Blue)
    info: { border: "border-l-blue-500", bg: "bg-blue-500/10", text: "text-blue-200", title: "text-blue-100", icon: Info },
    // Alert -> Critical (Red)
    alert: { border: "border-l-red-400", bg: "bg-red-400/10", text: "text-red-200", title: "text-red-100", icon: AlertTriangle },
    // Success -> Primary (Emerald)
    success: { border: "border-l-emerald-400", bg: "bg-emerald-400/10", text: "text-emerald-200", title: "text-emerald-100", icon: CheckCircle },
  };
    
  let derivedType: 'info' | 'alert' | 'success' = type as any;
  // Auto-detect type based on keywords if generic type provided
  if (!['info', 'alert', 'success'].includes(type)) {
      derivedType = 'info';
      if (title.includes("DOLOR") || title.includes("Riesgo") || title.includes("Déficit") || title.includes("Alerta") || title.includes("Amenaza") || title.includes("Debilidad") || title.includes("Desacople") || title.includes("Erosión") || title.includes("Divergencia") || title.includes("Impuntualidad") || title.includes("Justicia") || title.includes("Alta Fricción") || title.includes("Dependencia") || title.includes("Fragilidad") || title.includes("Equidad") || title.includes("Brecha") || title.includes("Estancamiento") || title.includes("Subsidiada") || title.includes("Tensión") || title.includes("Disparidad")) derivedType = "alert";
      if (title.includes("VICTORIA") || title.includes("Logrado") || title.includes("Fortaleza") || title.includes("Minimo") || title.includes("Estratégico") || title.includes("Semilla") || title.includes("Orgullo") || title.includes("Expansión") || title.includes("Salto") || title.includes("Embudo") || title.includes("Consolidación") || title.includes("Rentabilidad") || title.includes("Potencial") || title.includes("Capital")) derivedType = "success";
  }

  const currentStyle = styles[derivedType] || styles.info;
  const IconComponent: LucideIcon = currentStyle.icon;

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