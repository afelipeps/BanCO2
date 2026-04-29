import { Leaf, PawPrint, Wind, Info, Activity } from 'lucide-react';
import { THEME } from '../theme';
import type { Section } from '../types';

export const ambiental: Section = {
  id: 'AMB',
  title: '3. Ambiental',
  subtitle: 'El Bosque Vivo',
  description: 'Comportamiento del ecosistema en los predios bajo PSA/REDD+: área efectivamente conservada, servicios ecosistémicos percibidos, presencia de fauna indicadora y cambios en prácticas como la tala, conectados con las metas de reducción de emisiones y protección de bosques.',
  indicators: [
    {
      id: 'A1',
      title: 'Área de Conservación',
      type: 'kpi_card',
      kpiValue: '104.6',
      kpiUnit: 'Ha / Familia',
      icon: Leaf,
      trend: 'Alto Impacto',
      story: {
        title: 'Escala de Protección',
        text: 'El promedio de 104.6 hectáreas conservadas por familia muestra una escala de protección significativa: incluso considerando variaciones entre predios, se trata de extensiones grandes para un esquema de PSA campesino. Esta relación entre tamaño de predio y área conservada se traduce en un impacto relevante en captura y almacenamiento de carbono, y sobre todo en conectividad de hábitats.',
      },
    },
    {
      id: 'A2',
      title: 'Servicios Ecosistémicos',
      type: 'chart_radar',
      tooltipUnit: '%',
      data: [
        { subject: 'Densidad Bosque', A: 97.5, fullMark: 100 },
        { subject: 'Cantidad Agua', A: 97.5, fullMark: 100 },
        { subject: 'Calidad Agua', A: 97.5, fullMark: 100 },
        { subject: 'Aire Puro', A: 97.5, fullMark: 100 },
        { subject: 'Fauna', A: 97.5, fullMark: 100 },
      ],
      story: {
        title: 'Consenso Absoluto',
        text: 'El 97.5% de las familias percibe mejora en TODOS los indicadores ambientales (Aire, Agua, Bosque, Fauna). Es un consenso casi unánime.',
      },
    },
    {
      id: 'A3',
      title: 'Fauna Indicadora (Word Count)',
      type: 'word_count_table',
      data: [
        { category: 'Mamíferos', species: 'conejos (25), ardillas (16), armadillos (15), gurres (15), guaguas (14), titis (10), mico (10)', total: 105, icon: PawPrint, color: 'text-emerald-400' },
        { category: 'Aves', species: 'aves (33), cacatúas (15), guacharacas (15), loros (14), gallinetas (9), gurrias (5)', total: 91, icon: Wind, color: 'text-blue-500' },
        { category: 'Reptiles', species: 'serpientes (7)', total: 7, icon: Info, color: 'text-amber-400' },
        { category: 'TOTAL', species: '', total: 203, isTotal: true },
      ],
      story: {
        title: 'Biodiversidad Visible',
        text: 'Que los mamíferos (conejos, ardillas, armadillos, entre otros) sean el grupo más mencionado, seguidos de las aves, sugiere una recuperación de fauna visible para los campesinos. La presencia de pequeños mamíferos y diversidad de aves suele estar asociada a bosques en mejor estado, con menos perturbación y más heterogeneidad estructural.',
      },
    },
    {
      id: 'A4',
      title: 'Prácticas de Manejo',
      type: 'chart_bar_horizontal',
      tooltipUnit: '%',
      data: [
        { name: 'Limpieza Fuentes', value: 63.7, fill: THEME.colors.primary },
        { name: 'Siembra/Reforestación', value: 45, fill: THEME.colors.secondary },
        { name: 'Cercas Vivas', value: 1.2, fill: THEME.colors.tertiary },
      ],
      story: {
        title: 'Cuidado del Agua',
        text: 'Las prácticas dominantes son la limpieza de fuentes de agua (alrededor de dos tercios) y la siembra/reforestación (cerca de la mitad). Esto muestra que las familias no solo dejan de talar, sino que actúan activamente para restaurar y cuidar el bosque, con énfasis en el recurso hídrico. El punto débil es la baja frecuencia de prácticas como cercas vivas y mantenimiento estructural del bosque, que son clave para la conectividad ecológica y la resiliencia a largo plazo.',
      },
    },
    {
      id: 'A5',
      title: 'Patrón de Tala',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'Cultura Previa (Nunca)', value: 78.75, color: THEME.colors.primary },
        { name: 'Eliminó (Impacto PSA)', value: 12.50, color: THEME.colors.secondary },
        { name: 'Redujo (Impacto PSA)', value: 8.75, color: THEME.colors.tertiary },
      ],
      story: {
        title: 'Impacto Real Focalizado',
        text: 'Auditoría: El 78.8% de las familias (63/80) ya tenía una cultura de no-tala previa. El impacto del PSA se focalizó en el grupo crítico que sí talaba (17 familias): de este segmento, el 59% eliminó la práctica por completo y el 41% la redujo significativamente.',
      },
    },
    {
      id: 'A6',
      title: 'Mitigación Cambio Climático',
      type: 'kpi_card',
      kpiValue: '98%',
      kpiUnit: 'Conscientes',
      icon: Activity,
      trend: 'Educación',
      story: {
        title: 'Conciencia Global',
        text: 'El 98% de las familias declara entender que su trabajo local contribuye a mitigar el cambio climático. Más allá del número, esto habla de una internalización cultural del discurso climático: los campesinos no se ven solo como receptores de subsidios, sino como actores de una agenda ambiental.',
      },
    },
  ],
};
