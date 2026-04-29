import { Briefcase } from 'lucide-react';
import { THEME } from '../theme';
import type { Section } from '../types';

export const economica: Section = {
  id: 'ECO',
  title: '5. Economía',
  subtitle: 'Ingresos y Producción',
  description: 'Evidencia de cómo el PSA y los proyectos productivos se traducen (o no) en estabilidad económica: uso del incentivo, diversificación de ingresos, dinamismo de los emprendimientos rurales y brechas de ingresos por género, destacando tanto los avances como los cuellos de botella para la autonomía financiera.',
  indicators: [
    {
      id: 'E1',
      title: 'Tenencia Proyecto',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'No Tiene', value: 60.0, color: THEME.colors.critical },
        { name: 'Sí Tiene', value: 40.0, color: THEME.colors.primary },
      ],
      story: {
        title: 'Riesgo Estructural',
        text: 'El 40% de las familias reporta tener un proyecto productivo activo; sin embargo, el 60% aún depende casi exclusivamente del PSA y actividades de subsistencia.',
      },
    },
    {
      id: 'E2',
      title: 'Vocación Productiva',
      type: 'chart_bar_horizontal',
      tooltipUnit: '%',
      data: [
        { name: 'Enfoque Comercial Activo', value: 78.3, fill: THEME.colors.primary },
        { name: 'Subsistencia (Pancoger)', value: 21.7, fill: THEME.colors.neutral },
      ],
      story: {
        title: 'Enfoque Comercial',
        text: 'Entre las familias que tienen proyectos productivos activos, la mayoría se inclina hacia negocios con enfoque comercial (78.3%), en contraste con la minoría que se dedica a la subsistencia.',
      },
      disclosure: {
        source: 'BASE_DATOS_BANCO2_NORMALIZADA hoja Gráficas rows 159-162',
        transformation: 'venta>25_pct_sobre_distribucion_medible_filtro_tesis_no_documentado',
        timeWindow: 'tesis-2025',
        n: 23,
        note: "Cut declarado: Venta > 25% sobre n=23 'Distribución Medible' (filtro tesis-time aplicado sobre proyectos con dato medible de distribución venta/autoconsumo/pérdida). Lógica del filtro no documentada en Diccionario_Datos; valores publicados conforme tesis Velásquez, Palacio, Álvarez 2025. [VERSION-LOCK-OVERRIDE q011]",
      },
    },
    {
      id: 'E3',
      title: 'Erosión del Incentivo',
      type: 'chart_erosion',
      tooltipUnit: '$',
      data: [
        { name: '2018', smlv: 781242, incentivo: 202467, deficit: -578775, cobertura: 25.9 },
        { name: '2019', smlv: 828116, incentivo: 210320, deficit: -617796, cobertura: 25.4 },
        { name: '2020', smlv: 877803, incentivo: 225000, deficit: -652803, cobertura: 25.6 },
        { name: '2021', smlv: 908526, incentivo: 225000, deficit: -683526, cobertura: 24.7 },
        { name: '2022', smlv: 1000000, incentivo: 246522, deficit: -753478, cobertura: 24.7 },
        { name: '2023', smlv: 1160000, incentivo: 261659, deficit: -898341, cobertura: 22.6 },
      ],
      story: {
        title: 'Eficiencia Subsidiada',
        text: "Este gráfico documenta la 'Eficiencia Subsidiada': el valor real del incentivo cae (línea violeta vs inflación), pero la conservación se mantiene. El déficit económico es cubierto implícitamente por las familias, quienes absorben la pérdida de poder adquisitivo para sostener el acuerdo de conservación.",
      },
    },
    {
      id: 'E4',
      title: 'Brecha Ingresos (Género)',
      type: 'chart_bar_vertical',
      tooltipUnit: '$',
      data: [
        { name: 'Hombres', value: 850000, fill: THEME.colors.secondary },
        { name: 'Mujeres', value: 100000, fill: THEME.colors.critical },
      ],
      story: {
        title: 'Vulnerabilidad Femenina',
        text: 'El dashboard muestra una brecha extrema: Hombres $850.000 COP vs $100.000 en mujeres, es decir, una relación de 8.5 a 1.',
      },
    },
    {
      id: 'E5',
      title: 'Destino Producción',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'Venta', value: 56, color: THEME.colors.primary },
        { name: 'Autoconsumo', value: 10, color: THEME.colors.tertiary },
        { name: 'Pérdida/Mixto', value: 34, color: THEME.colors.neutral },
      ],
      story: {
        title: 'Integración al Mercado',
        text: 'Entre quienes producen, 56% logra vender más de la mitad de su cosecha, mientras el restante se queda entre autoconsumo, venta parcial y pérdida.',
      },
      disclosure: {
        source: 'Tesis Velásquez, Palacio, Álvarez 2025 (recodificación tesis-time)',
        transformation: 'clasificacion_destino_tesis_no_reproducible_microdatos',
        timeWindow: 'tesis-2025',
        n: null,
        note: 'Clasificación basada en recodificación tesis-time sobre subset de proyectos con distribución medible de producción. Fórmula específica no documentada en Diccionario_Datos; cifras publicadas conforme tesis Velásquez, Palacio, Álvarez 2025. [VERSION-LOCK-OVERRIDE q012]',
      },
    },
    {
      id: 'E6',
      title: 'Generación de Empleo',
      type: 'kpi_card',
      kpiValue: '16.7%',
      kpiUnit: 'Genera Empleo',
      icon: Briefcase,
      trend: 'Marginal',
      story: {
        title: 'Auto-Empleo Familiar',
        text: 'Solo 16,7% de las familias genera empleo adicional (jornales) a partir de sus actividades productivas, y en la mayoría de casos es empleo ocasional.',
      },
    },
    {
      id: 'E7',
      title: 'Emprendimiento (Origen)',
      type: 'chart_combo',
      tooltipUnit: '%',
      data: [
        { name: 'Inició con PSA', percentage: 37.50, income: 100000 },
        { name: 'Ya lo Tenía', percentage: 34.38, income: 100000 },
        { name: 'Fortalecido', percentage: 28.12, income: 6733350 },
      ],
      story: {
        title: 'Salto Exponencial',
        text: "El contraste es dramático: aunque el 71% de los proyectos son nuevos o de subsistencia con ingresos de $100k, el grupo que 'Fortaleció' su negocio previo (28%) logra ingresos 67 veces superiores ($6.7M), demostrando el poder del PSA como acelerador de capital.",
      },
    },
    {
      id: 'E8',
      title: 'Empleo Rural',
      type: 'chart_bar_horizontal',
      tooltipUnit: '%',
      data: [
        { name: 'No Genera', value: 83.3, fill: THEME.colors.critical },
        { name: '1-2 Jornales', value: 12.5, fill: THEME.colors.secondary },
        { name: '3+ Jornales', value: 4.2, fill: THEME.colors.primary },
      ],
      story: {
        title: 'Impacto Indirecto',
        text: 'El detalle muestra que 83,3% de los emprendimientos no genera empleo adicional; 12,5% contrata 1–2 jornales/mes y solo 4,2% genera más de 3 jornales mensuales.',
      },
    },
    {
      id: 'E9',
      title: 'Nivel Comercialización',
      type: 'chart_funnel',
      tooltipUnit: '%',
      data: [
        { name: 'Producción total', value: 100, fill: THEME.colors.neutral },
        { name: 'Autoconsumo', value: 44, fill: THEME.colors.tertiary },
        { name: 'Venta parcial', value: 30, fill: THEME.colors.secondary },
        { name: 'Venta consolidada', value: 26, fill: THEME.colors.primary },
      ],
      story: {
        title: 'Ruta de Madurez',
        text: 'De la Producción Total (100%), el 44% se queda en Autoconsumo (subsistencia). El reto comercial está en el siguiente escalón: un 30% logra Venta Parcial, y solo el 26% alcanza la Venta Consolidada, convirtiéndose en negocios sostenibles.',
      },
      disclosure: {
        source: 'Tesis Velásquez, Palacio, Álvarez 2025 (recodificación tesis-time)',
        transformation: 'clasificacion_madurez_comercial_tesis_no_reproducible_microdatos',
        timeWindow: 'tesis-2025',
        n: null,
        note: 'Clasificación basada en recodificación tesis-time sobre subset de proyectos con distribución medible de producción. Fórmula específica no documentada en Diccionario_Datos; cifras publicadas conforme tesis Velásquez, Palacio, Álvarez 2025. [VERSION-LOCK-OVERRIDE q012]',
      },
    },
  ],
};
