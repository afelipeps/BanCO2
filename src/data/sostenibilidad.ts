import { Infinity as InfinityIcon } from 'lucide-react';
import { THEME } from '../theme';
import type { Section } from '../types';

export const sostenibilidad: Section = {
  id: 'SOST',
  title: '7. Sostenibilidad',
  subtitle: 'Futuro y Riesgos',
  description: 'Grado de sostenibilidad de los impactos en el tiempo: motivaciones para conservar, disposición a continuar aún sin pagos y percepción de riesgos',
  indicators: [
    {
      id: 'ST1',
      title: 'Índice de Orgullo',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'Orgulloso', value: 98, color: THEME.colors.secondary },
        { name: 'Indiferente', value: 2, color: THEME.colors.neutral },
      ],
      story: {
        title: 'Salario Emocional',
        text: 'El 98% de las personas declara sentirse orgullosa de ser guardabosques; es un verdadero salario emocional asociado al rol que cumple el programa en la identidad campesina.',
      },
    },
    {
      id: 'ST2',
      title: 'Continuidad (Sin Pago)',
      type: 'kpi_card',
      kpiValue: '100%',
      kpiUnit: 'Seguiría Conservando',
      icon: InfinityIcon,
      trend: 'Victoria Cultural',
      story: {
        title: 'Ética Instalada',
        text: 'El 100% de las familias manifestó que protegería el bosque incluso sin recibir el incentivo económico.',
      },
    },
    {
      id: 'ST3',
      title: 'Matriz Estratégica',
      type: 'text_matrix',
      data: {
        q1: { title: 'Fortaleza', text: 'Convicción cultural sólida (100%)' },
        q2: { title: 'Oportunidad', text: 'Proyectos productivos (Cacao/Turismo)' },
        q3: { title: 'Debilidad', text: 'Fricción operativa en pagos' },
        q4: { title: 'Amenaza', text: 'Relevo generacional fallido' },
      },
      story: {
        title: 'Conclusión',
        text: 'La combinación de fortalezas (convicción cultural), oportunidades (proyectos productivos), debilidades (fricción operativa, baja diversificación) y amenazas (relevo generacional fallido) sintetiza muy bien la situación del programa: culturalmente exitoso, financieramente frágil. Es un mensaje honesto para decisores: si se invierte solo en mantener los pagos pero no en resolver la debilidad productiva y el relevo generacional, el modelo seguirá siendo vulnerable.',
      },
    },
    {
      id: 'ST4',
      title: 'Fricción Operativa',
      type: 'chart_bar_horizontal',
      tooltipUnit: '%',
      data: [
        { name: 'Pagos', value: 48.57, fill: THEME.colors.critical },
        { name: 'Trámites', value: 33.57, fill: THEME.colors.tertiary },
        { name: 'Visitas', value: 17.86, fill: THEME.colors.neutral },
      ],
      story: {
        title: 'Riesgo Operativo',
        text: 'La sostenibilidad no es solo ecológica y financiera, sino también operacional. Retrasos, trámites y fallas de comunicación erosionan la capacidad del programa para sostener en el tiempo la confianza y el compromiso. Si este problema se intensifica, puede desencadenar un efecto bola de nieve: menor confianza, menor participación, menos disposición a mantener prácticas de conservación cuando hay dificultades.',
      },
      disclosure: {
        source: 'BASE_DATOS_BANCO2_NORMALIZADA hoja Gráficas rows 230-234',
        transformation: 'conteo_keywords_manual_open_text_tesis_time',
        timeWindow: 'tesis-2025',
        n: 80,
        totalMenciones: 140,
        note: 'Categorías derivadas de codificación manual de menciones por palabras clave sobre respuestas abiertas (n=140 menciones, multi-select sobre n=80 familias = 1,75 menciones/familia). Fuente: BASE_DATOS_BANCO2_NORMALIZADA hoja Gráficas rows 230-234. [VERSION-LOCK-OVERRIDE q010]',
      },
    },
    {
      id: 'ST5',
      title: 'Motivación Principal',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'Convicción Ambiental', value: 64.9, color: THEME.colors.secondary },
        { name: 'Necesidad Económica', value: 26.0, color: THEME.colors.tertiary },
        { name: 'Otros', value: 9.1, color: THEME.colors.neutral },
      ],
      story: {
        title: 'Profundidad del Cambio',
        text: "El análisis confirma que la motivación intrínseca domina: la 'Convicción Ambiental' (64.9%) supera por amplio margen a la 'Necesidad Económica' (26.0%). Esto indica que el programa ha logrado instalar una ética de conservación que ya no depende exclusivamente del incentivo monetario.",
      },
    },
    {
      id: 'ST6',
      title: 'La impuntualidad erosiona la confianza',
      type: 'chart_correlation',
      tooltipUnit: '',
      data: [
        { x: 5, y: 5, z: 13 },
        { x: 4, y: 5, z: 23 },
        { x: 3, y: 5, z: 10 },
        { x: 3, y: 4, z: 13 },
        { x: 4, y: 4, z: 3 },
        { x: 5, y: 4, z: 0 },
        // Datos agregados representativos de la distribución
      ],
      regressionPoints: [
        { x: 2.8, y: 4.38 }, // 3.46 + 0.33 * 2.8
        { x: 5.2, y: 5.17 }, // 3.46 + 0.33 * 5.2
      ],
      story: {
        title: 'Correlación Significativa',
        text: 'Para determinar si las fricciones operativas erosionan el capital relacional, se aplicó un análisis de sensibilidad mediante una regresión lineal simple. Los hallazgos evidencian una correlación de Pearson positiva moderada entre la puntualidad percibida y la confianza institucional (r = 0.54). El coeficiente de determinación (R² = 0.29) revela que cerca del 30% de la variabilidad en la confianza se explica explícitamente por la eficiencia en los pagos. La ecuación resultante (Confianza = 3.46 + 0.33 × Puntualidad) ofrece una lectura política de fondo: el intercepto de 3,46 sugiere la existencia de un piso de legitimidad institucional fuerte que amortigua las fallas logísticas; sin embargo, la pendiente (β = 0.33) confirma que la impuntualidad no es indiferente, pues tiene un costo reputacional acumulativo que penaliza la valoración final del esquema.',
      },
    },
  ],
};
