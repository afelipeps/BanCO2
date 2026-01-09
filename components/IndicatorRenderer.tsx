import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ScatterChart, Scatter, ZAxis, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  FunnelChart, Funnel, LabelList, ComposedChart, Line, LineChart, Area
} from 'recharts';
import { 
  TrendingUp, AlertTriangle, CheckCircle, Calculator, Link as LinkIcon, Info
} from 'lucide-react';
import { THEME, COLORS } from '../theme';
import { Indicator } from '../types';
import CustomTooltip from './CustomTooltip';

interface IndicatorRendererProps {
  indicator: Indicator;
}

const IndicatorRenderer: React.FC<IndicatorRendererProps> = ({ indicator }) => {
  const { type, data, kpiValue, kpiUnit, value, max, isAlert, icon: IconComponent } = indicator;

  // NUEVO: Visualización de Balance SROI (Chart) con PALETA OPCIÓN 3
  if (type === 'sroi_balance_chart') {
    const allKeys = data.reduce((keys: string[], item: any) => {
        Object.keys(item).forEach(key => {
            if (key !== 'name' && key !== 'total' && key !== 'totalFormatted' && !keys.includes(key)) {
                keys.push(key);
            }
        });
        return keys;
    }, [] as string[]);

    // Paleta 3: Equilibrio Natural
    const sroiPalette: Record<string, string> = {
        // Inputs: Escala Azul (Institucional)
        'Masbosques': '#2563eb',   // Blue 600
        'Municipios': '#3b82f6',   // Blue 500
        'CORNARE': '#60a5fa',      // Blue 400
        
        // Outcomes: Semántica Estricta
        'Medioambiente': '#34d399', // Emerald 400 (Primary)
        'Estado': '#3b82f6',        // Blue 500 (Institutional Benefit)
        'Familias': '#fbbf24',      // Amber 400 (Economic)
        'Mujeres': '#f87171',       // Red 400 (Critical Gap)
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* KPI Header */}
            <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                        <Calculator size={32} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ratio SROI</div>
                        <div className="text-4xl font-bold text-white tracking-tight flex items-baseline gap-2">
                            2.22 <span className="text-lg text-emerald-400 font-normal">x</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium uppercase mb-1">Valor Neto Social</div>
                    <div className="text-2xl font-mono font-bold text-emerald-400">$3.926 MM</div>
                </div>
            </div>

            {/* Comparison Chart */}
            <div className="h-40 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={data} margin={{ top: 0, right: 60, left: 20, bottom: 0 }} barSize={35}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{fontSize: 11, fontWeight: 'bold'}} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                return (
                                    <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl min-w-[180px]">
                                        <p className="text-white font-bold text-xs mb-2 pb-1 border-b border-slate-700">{payload[0].payload.name}</p>
                                        {payload.map((entry, index) => (
                                            <div key={index} className="flex items-center justify-between gap-4 text-xs mb-1">
                                                <span style={{color: entry.color}}>{entry.name}:</span>
                                                <span className="font-mono text-slate-200">${entry.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-slate-700 mt-2 pt-2 flex justify-between text-xs font-bold text-white">
                                            <span>Total:</span>
                                            <span>${payload[0].payload.totalFormatted}</span>
                                        </div>
                                    </div>
                                );
                                }
                                return null;
                            }}
                        />
                        {/* Generar barras dinámicamente usando allKeys y la paleta personalizada */}
                        {allKeys.map((key, index) => (
                            <Bar 
                                key={key} 
                                dataKey={key} 
                                stackId="a" 
                                fill={sroiPalette[key] || THEME.chartColors[index % THEME.chartColors.length]} 
                                radius={[0, 2, 2, 0]} 
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
                {/* Labels de Total al final de las barras */}
                <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-around py-4 pointer-events-none">
                     {data.map((d: any, i: number) => (
                         <span key={i} className="text-xs font-bold text-slate-400 bg-slate-900/80 border border-slate-700 px-2 py-0.5 rounded shadow-sm">${(d.total / 1000000000).toFixed(2)}B</span>
                     ))}
                </div>
            </div>
        </div>
    );
  }

  // NUEVO: Matriz de Evidencia (Tabla Detallada)
  if (type === 'sroi_evidence_table') {
      return (
          <div className="w-full mt-2 overflow-x-auto rounded-lg border border-slate-700 scrollbar-thin scrollbar-thumb-slate-700">
              <table className="w-full text-xs text-left text-slate-300 min-w-[600px]">
                  <thead className="text-[10px] text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
                      <tr>
                          <th className="px-4 py-3 font-bold w-1/4">Grupo de Interés</th>
                          <th className="px-4 py-3 font-bold w-1/4">Indicador / Proxy</th>
                          <th className="px-4 py-3 font-bold w-1/4 text-center">Rigor (Atribución)</th>
                          <th className="px-4 py-3 font-bold text-right w-1/4">Valor Neto (COP)</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {data.map((row: any, index: number) => (
                          <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-white align-top">
                                  <div className="flex items-start gap-2">
                                      {row.icon && <row.icon size={14} className={`mt-0.5 ${row.color}`} />}
                                      <span>{row.group}</span>
                                  </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                  <div className="font-medium text-slate-200 mb-1 leading-snug">{row.indicator}</div>
                                  <div className="flex items-center gap-1 text-[9px] text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded w-fit border border-slate-800">
                                      <LinkIcon size={9} />
                                      {row.source}
                                  </div>
                              </td>
                              {/* FIX: Mejorado diseño de la columna Rigor con Grid para alineación perfecta */}
                              <td className="px-4 py-3 align-top">
                                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px]">
                                      <span className="text-slate-500 text-right">Bruto:</span>
                                      <span className="font-mono text-slate-400 text-right">${row.grossValue}</span>
                                      
                                      <span className="text-slate-500 text-right">Atribución:</span>
                                      <span className="font-mono text-amber-400 text-right">{row.attribution}</span>
                                      
                                      {row.displacement && (
                                          <>
                                            <span className="text-slate-500 text-right">Desplaz.:</span>
                                            <span className="font-mono text-red-400 text-right">{row.displacement}</span>
                                          </>
                                      )}
                                  </div>
                              </td>
                              <td className="px-4 py-3 text-right font-bold font-mono text-emerald-400 align-top text-sm">
                                  ${row.netValue}
                              </td>
                          </tr>
                      ))}
                      {/* Fila de Totales */}
                      <tr className="bg-slate-900/80 font-bold border-t-2 border-slate-600">
                          <td colSpan={3} className="px-4 py-3 text-right text-slate-400 uppercase tracking-wider text-[10px]">Valor Presente Neto Total</td>
                          <td className="px-4 py-3 text-right text-emerald-400 text-sm">$3.926.103.128</td>
                      </tr>
                  </tbody>
              </table>
          </div>
      );
  }

  // NUEVO: Tabla de Impacto Futuro (Outcomes No Monetizados)
  if (type === 'sroi_future_impact_table') {
    return (
      <div className="w-full mt-2">
        <div className="overflow-x-auto rounded-t-lg border border-slate-700 scrollbar-thin scrollbar-thumb-slate-700">
          <table className="w-full text-xs text-left text-slate-300 min-w-[500px]">
            <thead className="text-[10px] text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="px-4 py-3 font-bold w-1/3">Outcome Latente</th>
                <th className="px-4 py-3 font-bold w-1/3">Ruta de Monetización Propuesta</th>
                <th className="px-4 py-3 font-bold text-center w-1/3">Riesgo de Brecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.map((row: any, index: number) => (
                <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start gap-2">
                      {row.icon && <row.icon size={14} className={`mt-0.5 ${row.color}`} />}
                      <span className="font-medium text-slate-200">{row.outcome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-400 leading-snug">
                    {row.methodology}
                  </td>
                  <td className="px-4 py-3 align-middle text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold border ${
                        row.impact.includes('Aumenta') ? 'bg-red-400/20 text-red-300 border-red-400/30' :
                        row.impact.includes('Reduce') ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {row.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-900/50 border-x border-b border-slate-700 rounded-b-lg p-3 text-[10px] text-slate-500 flex gap-2 items-start">
            <Info size={14} className="min-w-[14px] mt-0.5 text-slate-400" />
            <p className="italic">
                <strong>Análisis de Disparidad:</strong> La monetización de estos outcomes (particularmente los ambientales) es técnicamente viable y aumentaría el ratio SROI. 
                Sin embargo, su inclusión sin corregir los flujos de ingreso familiar incrementaría matemáticamente la brecha entre el valor público generado y el valor privado apropiado por los campesinos.
            </p>
        </div>
      </div>
    );
  }

  // --- Renderizadores Existentes (Sin cambios) ---
  if (type === 'kpi_sroi_master') return null; // Deprecated by new sroi_balance_chart
  
  if (type === 'cards_grid') {
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              {data.map((card: any, idx: number) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col items-center text-center hover:border-slate-700 transition-colors">
                        <div className={`p-2 rounded-full mb-2 ${card.colorClass}`}>
                            <card.icon size={20} />
                        </div>
                        <h4 className="text-white font-bold text-sm mb-1">{card.title}</h4>
                        <p className="text-slate-400 text-xs leading-snug">{card.desc}</p>
                        <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full">{card.impact}</span>
                  </div>
              ))}
          </div>
      )
  }

  if (type === 'chart_treemap') return null; // Deprecated

  if (type === 'kpi_card') {
    return (
      <div className="flex items-center gap-4 py-2">
        <div className={`p-3 rounded-full ${indicator.trend?.includes('Déficit') || indicator.trend?.includes('Riesgo') || indicator.trend?.includes('Atención') ? 'bg-red-400/20 text-red-400' : 'bg-emerald-400/10 text-emerald-400'}`}>
          {IconComponent ? <IconComponent size={28} /> : <CheckCircle size={28} />}
        </div>
        <div>
          <div className="text-3xl font-bold text-white tracking-tight">{kpiValue}</div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{kpiUnit}</div>
          {indicator.trend && (
            <div className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${indicator.trend?.includes('Déficit') || indicator.trend?.includes('Riesgo') ? 'border-red-400/30 text-red-300 bg-red-400/10' : 'border-slate-700 text-slate-400 bg-slate-800'}`}>
              <TrendingUp size={10} className="mr-1" /> {indicator.trend}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'kpi_rating') {
    const percentage = ((value || 0) / (max || 1)) * 100;
    return (
      <div className="py-4 w-full">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-baseline gap-1">
             <span className="text-4xl font-bold text-white">{value}</span>
             <span className="text-slate-500 text-xs font-medium">/ {max}.0</span>
          </div>
          {isAlert && <span className="text-red-400 text-[10px] font-bold uppercase flex items-center bg-red-400/30 px-2 py-0.5 rounded border border-red-400/50"><AlertTriangle size={10} className="mr-1"/> Crítico</span>}
        </div>
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div className={`h-full ${isAlert ? 'bg-red-400' : 'bg-emerald-400'} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(52,211,153,0.2)]`} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    );
  }

  if (type === 'text_matrix') {
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
  }

  if (type === 'word_count_table') {
    return (
      <div className="w-full mt-2 overflow-hidden rounded-lg border border-slate-700">
        <table className="w-full text-xs text-left text-slate-300">
          <thead className="text-[10px] text-slate-400 uppercase bg-slate-800 border-b border-slate-700">
            <tr>
              <th scope="col" className="px-3 py-2 font-bold w-1/4">Categoría</th>
              <th scope="col" className="px-3 py-2 font-bold">Especies (Frecuencia)</th>
              <th scope="col" className="px-3 py-2 font-bold w-16 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, index: number) => (
              <tr key={index} className={`border-b border-slate-800 hover:bg-slate-800/50 ${row.isTotal ? 'bg-slate-900 font-bold text-white border-t-2 border-slate-600' : ''}`}>
                <td className="px-3 py-2 font-medium flex items-center gap-2">
                  {row.icon && <row.icon size={14} className={row.color} />}
                  {row.category}
                </td>
                <td className="px-3 py-2 leading-relaxed text-slate-400">
                  {row.species}
                </td>
                <td className="px-3 py-2 text-right font-mono text-emerald-400">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type.startsWith('chart')) {
    // Aumentar altura para gráficos de correlación para mejorar proporción visual (cuadrado)
    const containerHeight = type === 'chart_correlation' ? 'h-80' : 'h-48';

    return (
      <div className={`${containerHeight} w-full mt-2`}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'chart_combo' ? (
             <ComposedChart data={data} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 9}} interval={0} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={10} unit="%" />
                <YAxis yAxisId="right" orientation="right" stroke="#34d399" fontSize={10} tickFormatter={(val) => `$${val/1000000}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                <Bar yAxisId="left" dataKey="percentage" name="Distribución (%)" fill={THEME.colors.secondary} barSize={20} radius={[4,4,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="income" name="Ingreso (Mediana)" stroke={THEME.colors.tertiary} strokeWidth={2} dot={{r: 4, fill: THEME.colors.tertiary}} />
             </ComposedChart>
          ) : type === 'chart_line_multi' ? (
             <LineChart data={data} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 9}} />
                <YAxis stroke="#64748b" fontSize={10} unit="%" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                <Line type="monotone" dataKey="bienestar" name="Bienestar Económico" stroke={THEME.colors.tertiary} strokeWidth={3} dot={{r: 4, fill: THEME.colors.tertiary}} />
                <Line type="monotone" dataKey="compromiso" name="Compromiso Cultural" stroke={THEME.colors.primary} strokeWidth={3} dot={{r: 4, fill: THEME.colors.primary}} />
             </LineChart>
          ) : type === 'chart_erosion' ? (
             <ComposedChart data={data} margin={{top: 10, right: 10, left: -10, bottom: 0}}>
                <defs>
                  <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.colors.critical} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={THEME.colors.critical} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 9}} />
                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                
                {/* LÍNEA DE REFERENCIA EN CERO: EL PUNTO DE EQUILIBRIO (Sin etiqueta) */}
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />

                {/* SMLV: Referencia de Mercado */}
                <Line type="monotone" dataKey="smlv" name="Salario Mínimo (Ref)" stroke={THEME.colors.textMuted} strokeWidth={1} strokeDasharray="5 5" dot={false} />
                
                {/* DÉFICIT: ÁREA NEGATIVA CON GRADIENTE */}
                <Area type="monotone" dataKey="deficit" name="Déficit Real (Negativo)" stroke={THEME.colors.critical} fillOpacity={1} fill="url(#colorDeficit)" strokeWidth={2} />
                
                {/* Incentivo: La variable real */}
                <Line type="monotone" dataKey="incentivo" name="Incentivo PSA" stroke={THEME.colors.tertiary} strokeWidth={3} dot={{r: 4, fill: THEME.colors.tertiary}} />
             </ComposedChart>
          ) : type === 'chart_correlation' ? (
            <ComposedChart margin={{ top: 10, right: 30, bottom: 50, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              {/* UX FIX: Eje X Discreto (Likert) */}
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Puntualidad" 
                stroke="#64748b" 
                fontSize={10} 
                domain={[2, 6]} // Aumentado rango para equilibrar visualmente con altura y Y
                ticks={[2, 3, 4, 5, 6]} // Forzar todos los enteros
                allowDecimals={false} // Evitar decimales
                label={{ value: 'Puntualidad de Pagos', position: 'insideBottom', offset: -15, fill: '#94a3b8', fontSize: 10 }}
              />
              {/* UX FIX: Eje Y Discreto (Likert) */}
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Confianza" 
                stroke="#64748b" 
                fontSize={10} 
                domain={[2.5, 5.5]} // Mantener rango de datos focalizado
                ticks={[3, 4, 5]} // Forzar solo enteros relevantes
                allowDecimals={false} // Evitar decimales
                label={{ value: 'Confianza Institucional', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, dy: 60 }}
                interval={0}
              />
              {/* UX FIX: Rango Z equilibrado */}
              <ZAxis type="number" dataKey="z" range={[40, 300]} name="Cant. Familias" />
              
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              
              {/* UX FIX: Leyenda con margen superior para separar del Eje X */}
              <Legend 
                wrapperStyle={{ fontSize: '11px', paddingTop: '30px' }} 
                verticalAlign="bottom" 
                align="center"
                height={36}
              />
              
              {/* Regresión Lineal */}
              <Line 
                data={indicator.regressionPoints} 
                type="monotone" 
                dataKey="y" 
                name="Tendencia (r=0.54)" 
                stroke={THEME.colors.secondary} 
                strokeWidth={3} 
                dot={false} 
                activeDot={false}
                strokeDasharray="5 5" 
              />
              
              {/* Datos Dispersos (Burbujas) - Nombre limpio */}
              <Scatter 
                data={data} 
                name="Confianza institucional familias" 
                fill={THEME.colors.primary} 
                shape="circle"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={THEME.colors.primary} fillOpacity={0.6} />
                ))}
              </Scatter>
            </ComposedChart>
          ) : type === 'chart_funnel' ? (
            <FunnelChart>
              <Tooltip content={<CustomTooltip unit={indicator.tooltipUnit || '%'} />} cursor={{fill: 'transparent'}} />
              <Funnel
                dataKey="value"
                data={data}
                isAnimationActive
                stroke="#0f172a" 
                strokeWidth={4} 
              >
                {/* UX FIX: Etiquetas externas claras y valor interno destacado */}
                <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="name" fontSize={11} />
                <LabelList position="center" fill="#ffffff" stroke="none" dataKey="value" fontSize={14} fontWeight="bold" formatter={(val: number) => `${val}%`} />
              </Funnel>
            </FunnelChart>
          ) : type === 'chart_radar' ? (
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Impacto" dataKey="A" stroke={THEME.colors.primary} fill={THEME.colors.primary} fillOpacity={0.4} />
              <Tooltip content={<CustomTooltip unit={indicator.tooltipUnit || '%'} />} cursor={{fill: 'transparent'}} />
            </RadarChart>
          ) : type === 'chart_scatter' ? (
            <ScatterChart margin={{ top: 20, right: 30, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name={indicator.xLabel} 
                stroke="#64748b" 
                fontSize={10} 
                unit=" Ha" 
                padding={{ left: 10, right: 30 }} // UX FIX: Padding para evitar corte burbuja
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name={indicator.yLabel} 
                stroke="#64748b" 
                fontSize={10} 
                unit=" Ha" 
                padding={{ top: 20, bottom: 10 }} // UX FIX: Padding vertical
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip unit={indicator.tooltipUnit || ''} />} />
              <Scatter name={indicator.title} data={data} fill="#8884d8">
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          ) : type === 'chart_bar_stacked' ? (
             <BarChart data={data} layout="vertical" margin={{left: 0, right: 20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748b" hide />
                <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#334155', opacity: 0.1}} content={<CustomTooltip unit={indicator.tooltipUnit || '%'} />} />
                {indicator.bars && indicator.bars.map((bar, i) => (
                  <Bar key={bar.key} dataKey={bar.key} stackId="a" fill={bar.color} radius={i === (indicator.bars?.length || 0) -1 ? [0, 4, 4, 0] : [0,0,0,0]} barSize={20} />
                ))}
                <Legend iconSize={8} wrapperStyle={{fontSize: '10px', color: '#94a3b8'}} />
             </BarChart>
          ) : type === 'chart_bar_vertical' ? (
             <BarChart data={data} layout="vertical" margin={{left: 0, right: 10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#334155', opacity: 0.1}} content={<CustomTooltip unit={indicator.tooltipUnit || '%'} />} />
                <Bar dataKey="value" fill={THEME.colors.secondary} radius={[0, 4, 4, 0]} barSize={12}>
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
             </BarChart>
          ) : type === 'chart_pie' ? (
             <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value" stroke="none">
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip unit={indicator.tooltipUnit || '%'} />} />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{fontSize: '10px', color: '#94a3b8'}} />
             </PieChart>
          ) : type === 'chart_bar_horizontal' ? (
             <BarChart data={data} layout="vertical" margin={{left: 0, right: 20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#64748b" hide />
                {/* AUMENTADO EL WIDTH A 150 PARA QUE QUEPAN LAS ETIQUETAS LARGAS */}
                <YAxis dataKey="name" type="category" width={150} stroke="#94a3b8" tick={{fontSize: 10}} />
                <Tooltip cursor={{fill: '#334155', opacity: 0.1}} content={<CustomTooltip unit={indicator.tooltipUnit || '%'} />} />
                {/* Agregado minPointSize y LabelList para destacar valores pequeños como el de Mujeres */}
                <Bar dataKey="value" fill={THEME.colors.primary} radius={[0, 4, 4, 0]} barSize={20} minPointSize={3}>
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || entry.fill || COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="right" fill="#94a3b8" fontSize={10} formatter={(val: number | string) => typeof val === 'number' ? (val < 1000 ? val : `$${(val).toLocaleString()}`) : val} />
                </Bar>
             </BarChart>
          ) : (
             // Default Bar
             <BarChart data={data} margin={{top: 10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 10}} interval={0} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip cursor={{fill: '#334155', opacity: 0.1}} content={<CustomTooltip unit={indicator.tooltipUnit || '%'} />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={25}>
                   {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                   ))}
                </Bar>
             </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  }
  return null;
};

export default IndicatorRenderer;