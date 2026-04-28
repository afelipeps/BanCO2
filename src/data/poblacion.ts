import { Users, Home } from 'lucide-react';
import { THEME } from '../theme';
import type { Section } from '../types';

export const poblacion: Section = {
  id: 'POB',
  title: '2. Población',
  subtitle: 'Los Guardianes',
  description: 'Perfil humano de las familias guardabosques: sexo, edad, jefatura de hogar y composición familiar de las 155 familias vinculadas al programa, a partir de la muestra encuestada de 80 hogares, para entender quién sostiene en la práctica los acuerdos de conservación.',
  indicators: [
    {
      id: 'P1',
      title: 'Composición por Género',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'Hombres', value: 58.8, color: THEME.colors.secondary },
        { name: 'Mujeres', value: 41.2, color: THEME.colors.critical },
      ],
      story: {
        title: 'Inclusión Femenina',
        text: '41.2% de mujeres titulares es una cifra alta para el sector rural, indicando un empoderamiento real en la titularidad.',
      },
    },
    {
      id: 'P2',
      title: 'Jefatura de Hogar por Sexo',
      type: 'chart_bar_stacked',
      tooltipUnit: '%',
      data: [
        { name: 'Mujeres', jefes: 78.79, no_jefes: 21.21 },
        { name: 'Hombres', jefes: 93.62, no_jefes: 6.38 },
      ],
      bars: [
        { key: 'jefes', name: 'Es Jefe de Hogar', color: THEME.colors.critical },
        { key: 'no_jefes', name: 'Otro Rol', color: THEME.colors.neutral },
      ],
      story: {
        title: 'Doble Carga Femenina',
        text: 'La proporción de mujeres titulares que además son jefas de hogar (78.8%) sigue siendo muy alta, confirmando la doble carga (hogar + predio). En contraste, la jefatura masculina es casi absoluta (93.6%), lo que refleja patrones tradicionales de autoridad.',
      },
    },
    {
      id: 'P3',
      title: 'Pirámide Poblacional',
      type: 'chart_bar_vertical',
      tooltipUnit: '%',
      data: [
        { name: '<18-30', value: 5.00, fill: THEME.colors.primary },
        { name: '31-45', value: 17.50, fill: THEME.colors.secondary },
        { name: '46-60', value: 28.75, fill: THEME.colors.tertiary },
        { name: '61-75', value: 35.00, fill: THEME.colors.neutral },
        { name: '>75', value: 13.75, fill: THEME.colors.critical },
      ],
      story: {
        title: 'Envejecimiento Acentuado',
        text: 'El envejecimiento es más profundo de lo esperado: el grupo de >75 años (13.75%) casi triplica a la base joven de <30 años (5.00%). El grueso poblacional (63.75%) está entre 46 y 75 años, lo que hace urgente la estrategia de relevo generacional.',
      },
    },
    {
      id: 'P4',
      title: 'Edad Promedio',
      type: 'kpi_card',
      kpiValue: '57.8',
      kpiUnit: 'Años',
      icon: Users,
      trend: 'Tendencia Alta',
      story: {
        title: 'Pasivo Pensional Ambiental',
        text: "La edad promedio de 57.8 años señala un riesgo de 'pasivo pensional' para la conservación. El modelo descansa sobre una generación envejecida, sin garantías claras de relevo, lo que constituye una fragilidad estructural para la sostenibilidad a largo plazo.",
      },
    },
    {
      id: 'P5',
      title: 'Jefatura del Hogar',
      type: 'kpi_card',
      kpiValue: '87.5%',
      kpiUnit: 'Son Jefes de Hogar',
      icon: Home,
      trend: 'Autonomía',
      story: {
        title: 'Poder de Decisión',
        text: 'El incentivo llega a quien toma las decisiones. Esto reduce el riesgo de gasto suntuario y asegura su uso en necesidades básicas.',
      },
    },
  ],
};
