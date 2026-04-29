import { BookOpen, Flame } from 'lucide-react';
import { THEME } from '../theme';
import type { Section } from '../types';

export const social: Section = {
  id: 'SOC',
  title: '4. Social',
  subtitle: 'La Vida en el Hogar',
  description: 'Cambios en la vida cotidiana de las familias asociados al programa: acceso a tecnologías como estufas eficientes, condiciones de vivienda, organización del tiempo de cuidado y percepciones de tejido social, para identificar mejoras en bienestar y brechas que aún persisten.',
  indicators: [
    {
      id: 'S1',
      title: 'Desacople del Incentivo',
      type: 'chart_line_multi',
      tooltipUnit: '%',
      data: [
        { name: 'Fase A (2017)', bienestar: 71.4, compromiso: 100 },
        { name: 'Fase B (2019)', bienestar: 43.8, compromiso: 100 },
        { name: 'Fase C (2021)', bienestar: 26.7, compromiso: 100 },
        { name: 'Fase D (2023)', bienestar: 14.8, compromiso: 100 },
      ],
      story: {
        title: 'Fenómeno de Desacople',
        text: 'Mientras la percepción de mejora económica se desploma del 71.4% (Pioneros) al 14.8% (Recientes), la voluntad de conservar sin pago se mantiene intacta en el 100%. Esto sugiere que el éxito del programa no es meramente económico; depende de una cultura de conservación preexistente en los campesinos, que ahora es reconocida por el incentivo.',
      },
    },
    {
      id: 'S2',
      title: 'Destino de la Inversión PSA',
      type: 'chart_bar_horizontal',
      tooltipUnit: '%',
      data: [
        { name: 'Solo Alimentación', value: 35.0, fill: THEME.colors.tertiary },
        { name: 'Alim + Prod', value: 23.8, fill: THEME.colors.primary },
        { name: 'Alim + Educ', value: 16.3, fill: THEME.colors.secondary },
        { name: 'Otros Mixtos', value: 24.9, fill: THEME.colors.neutral },
      ],
      story: {
        title: 'Seguridad Alimentaria',
        text: 'El uso del PSA se orienta prioritariamente a alimentación: 35% lo dedica solo a comida y buena parte del resto combina alimentos con otros usos (productivos, educación, vivienda).',
      },
    },
    {
      id: 'S3',
      title: 'Capacidad de Ahorro',
      type: 'chart_bar_vertical',
      tooltipUnit: '%',
      data: [
        { name: 'No Mejoró', value: 51.25, fill: THEME.colors.critical },
        { name: 'Sí Mejoró', value: 35.00, fill: THEME.colors.primary },
        { name: 'Igual/NS', value: 13.75, fill: THEME.colors.neutral },
      ],
      story: {
        title: 'Mejora Progresiva',
        text: 'Aunque la fragilidad persiste en la mitad de los hogares (51.25%), el porcentaje de familias que logra ahorrar ha crecido al 35%, absorbiendo gran parte de la incertidumbre anterior.',
      },
    },
    {
      id: 'S4',
      title: 'Acceso a Educación',
      type: 'kpi_card',
      kpiValue: '6.3%',
      kpiUnit: 'Reportan Acceso',
      icon: BookOpen,
      trend: 'Brecha',
      story: {
        title: 'Oportunidad Educativa',
        text: 'Solo alrededor de 6,3% de los hogares reporta un cambio positivo en acceso a educación gracias al PSA (por ejemplo, pago de matrículas, útiles o transporte).',
      },
    },
    {
      id: 'S5',
      title: 'Salud (Estufas)',
      type: 'kpi_card',
      kpiValue: '100%',
      kpiUnit: 'Mejora Salud',
      icon: Flame,
      trend: 'Alto Impacto',
      story: {
        title: 'Impacto en Salud',
        text: 'Cerca del 18,8% de las familias reporta contar con estufas eficientes, lo que reduce exposición a humo y consumo de leña. El análisis de tiempo liberado muestra ahorros promedio de 3,7 horas/semana de recolección de leña en las familias con datos completos.',
      },
    },
    {
      id: 'S6',
      title: 'Participación Comunitaria',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'Activos en Grupos', value: 28.7, color: THEME.colors.secondary },
        { name: 'No Participan', value: 71.3, color: THEME.colors.neutral },
      ],
      story: {
        title: 'Reto de Asociatividad',
        text: 'Solo alrededor de 28,7% de las personas participa de forma activa en organizaciones comunitarias (JAC, asociaciones, grupos productivos).',
      },
    },
    {
      id: 'S7',
      title: 'Relaciones Vecinales',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'No hubo mejora', value: 68.75, color: THEME.colors.neutral },
        { name: 'Hubo mejora', value: 31.25, color: THEME.colors.primary },
      ],
      story: {
        title: 'Beneficio Social',
        text: 'Un segmento significativo de las familias (31.25%) reporta que el programa ha tenido un impacto positivo en el fortalecimiento de la relación con sus vecinos, lo que demuestra un beneficio social y comunitario. Sin embargo, la mayoría (68.75%) no percibió un cambio en la convivencia.',
      },
    },
    {
      id: 'S8',
      title: 'El Valor del Tiempo',
      type: 'chart_bar_horizontal',
      tooltipUnit: '%',
      data: [
        { name: '> 4 Hrs/Semana', value: 83.3, fill: THEME.colors.primary },
        { name: '1-3 Hrs/Semana', value: 8.3, fill: THEME.colors.secondary },
        { name: 'Sin Cambio', value: 8.3, fill: THEME.colors.neutral },
      ],
      story: {
        title: 'Tiempo Liberado',
        text: 'El análisis de la base muestra que las familias con estufa eficiente ahorran, en promedio, 3,7 horas semanales en recolección y manejo de leña, con 83,3% de los casos reportando ahorros de más de 4 horas.',
      },
    },
    {
      id: 'S9',
      title: 'Liderazgo Femenino',
      type: 'chart_bar_stacked',
      tooltipUnit: '%',
      data: [
        { name: 'Mujeres', participa: 36.36, no_participa: 63.64 },
        { name: 'Hombres', participa: 23.91, no_participa: 76.09 },
      ],
      bars: [
        { key: 'participa', name: 'Lidera/Participa', color: THEME.colors.secondary },
        { key: 'no_participa', name: 'No Participa', color: THEME.colors.neutral },
      ],
      story: {
        title: 'Protagonismo de la Mujer',
        text: 'En las encuestas, alrededor del 35% de las mujeres participa en espacios comunitarios de liderazgo, una proporción mayor que la observada en hombres.',
      },
    },
  ],
};
