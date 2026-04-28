import { THEME } from '../theme';
import type { Section } from '../types';

export const gobernanza: Section = {
  id: 'GOB',
  title: '6. Gobernanza',
  subtitle: 'Operación y Confianza',
  description: 'Desempeño institucional del esquema BancO2: calidad y cumplimiento de los acuerdos de conservación, relación con CORNARE y Masbosques, fluidez de los pagos y niveles de confianza de las familias en la regla de juego, clave para la permanencia del proyecto.',
  indicators: [
    {
      id: 'GO1',
      title: 'Índice de Confianza',
      type: 'kpi_rating',
      value: 4.72,
      max: 5,
      story: {
        title: 'Capital Intangible',
        text: 'La calificación de 4.72/5 indica una confianza muy alta en Masbosques/CORNARE. Este es quizás el activo intangible más valioso del programa: incluso con fricciones operativas, las familias siguen creyendo en la intención y en la legitimidad de la institución.',
      },
    },
    {
      id: 'GO2',
      title: 'Cobertura Técnica',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'Sí Recibe', value: 48.8, color: THEME.colors.secondary },
        { name: 'No Recibe', value: 51.2, color: THEME.colors.critical },
      ],
      story: {
        title: 'Brecha Operativa',
        text: 'La mitad de las familias reporta no recibir acompañamiento técnico constante.',
      },
    },
    {
      id: 'GO3',
      title: 'Frecuencia de Visitas',
      type: 'chart_bar_vertical',
      tooltipUnit: '%',
      data: [
        { name: 'Anual', value: 40.5, fill: THEME.colors.tertiary },
        { name: 'Semestral', value: 35.2, fill: THEME.colors.primary },
        { name: 'Cada 10-12 Meses', value: 24.3, fill: THEME.colors.secondary },
      ],
      story: {
        title: 'Intensidad Baja',
        text: 'Entre quienes sí reciben visitas, la frecuencia predominante es anual, seguida de semestral. Para un programa que combina conservación y restauración, este nivel de contacto es insuficiente para procesos complejos.',
      },
    },
    {
      id: 'GO4',
      title: 'Calidad Visita',
      type: 'kpi_rating',
      value: 5.0,
      max: 5,
      story: {
        title: 'Calidad vs Cobertura',
        text: 'Cuando la visita ocurre, las familias califican la calidad con el máximo puntaje (5.0/5). Es decir, el problema no es de capacidades técnicas, sino de logística, cobertura y frecuencia.',
      },
    },
    {
      id: 'GO5',
      title: 'Convivencia Vecinal',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'No hubo mejora', value: 68.75, color: THEME.colors.neutral },
        { name: 'Hubo mejora', value: 31.25, color: THEME.colors.primary },
      ],
      story: {
        title: 'Gobernanza Territorial',
        text: 'Aunque la mayoría reporta estabilidad (68.75%), el 31.25% percibe una mejora explícita en la convivencia. Esto confirma que el programa actúa como un mediador silencioso: al clarificar linderos y reglas de uso del bosque, reduce estructuralmente los conflictos vecinales.',
      },
    },
    {
      id: 'GO6',
      title: 'Puntualidad Pagos',
      type: 'kpi_rating',
      value: 3.77,
      max: 5,
      isAlert: true,
      story: {
        title: 'PUNTO DE DOLOR',
        text: 'Con una calificación de 3.77/5, la puntualidad de pagos es claramente el principal punto de dolor. Para hogares que dependen del PSA para alimentación y servicios básicos, los retrasos no son un detalle administrativo: son crisis de caja. Si no se corrige, este factor puede erosionar la confianza y empujar a algunas familias a buscar fuentes de ingreso alternativas incluso a costa de la conservación.',
      },
    },
    {
      id: 'GO7',
      title: 'Transparencia',
      type: 'kpi_rating',
      value: 5.0,
      max: 5,
      story: {
        title: 'Honestidad',
        text: "La percepción de transparencia es 5,0/5: las familias no reportan dudas sobre el manejo de recursos ni sobre la 'honestidad' del programa.",
      },
    },
    {
      id: 'GO8',
      title: 'Participación',
      type: 'chart_bar_vertical',
      tooltipUnit: '%',
      data: [
        { name: 'A Veces', value: 87.5, fill: THEME.colors.tertiary },
        { name: 'Siempre', value: 12.5, fill: THEME.colors.primary },
      ],
      story: {
        title: 'Déficit Democrático',
        text: "El 87,5% de las personas declara participar 'a veces' en espacios de decisión y solo 12,5% 'siempre'; la mayoría siente que su rol es más de receptor de instrucciones que de co-diseñador de soluciones.",
      },
    },
  ],
};
