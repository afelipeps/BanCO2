import {
  Users, Leaf, Shield, Heart, TrendingUp, Activity,
  Droplets, HeartHandshake, Briefcase, Lightbulb,
} from 'lucide-react';
import type { Section } from '../types';

export const sroi: Section = {
  id: 'SROI',
  title: '8. SROI',
  subtitle: 'Eficiencia Subsidiada',
  description: 'Evaluación del Retorno Social de la Inversión: Valor Público vs. Fragilidad Privada (2017-2024). Este panel revela cómo el éxito financiero del programa se sustenta en un subsidio invisible aportado por la comunidad.',
  disclosure: {
    source: 'Tesis Velásquez, Palacio, Álvarez 2025, Apéndice 1 SROI',
    transformation: 'calculo_sroi_metodologia_social_value_international',
    timeWindow: '2022-2023',
    n: null,
    note: 'Cálculo SROI conforme metodología Social Value International (shadow wages, deadweight, attribution, displacement, drop-off rate). Inputs $1.765.929.034 (Masbosques + 3 municipios + CORNARE). Outputs $3.926.103.128 (3 dimensiones monetizadas). Outcomes no monetizados documentados como deuda metodológica para iteración futura. Fuente primaria: Apéndice 1, tesis Velásquez et al. 2025. [VERSION-LOCK-OVERRIDE q013]',
  },
  indicators: [
    {
      id: 'SR1',
      title: 'Asimetría de Beneficios',
      type: 'sroi_balance_chart',
      tooltipUnit: 'COP',
      data: [
        {
          name: 'Inversión (Inputs)',
          totalFormatted: '1.766 MM',
          total: 1765929034,
          Masbosques: 1389456598,
          Municipios: 347972436, // San Rafael + Granada + Guatape
          CORNARE: 28500000,
        },
        {
          name: 'Impacto (Outcomes)',
          totalFormatted: '3.926 MM',
          total: 3926103128,
          Familias: 948200400, // PSA + Emprendimiento
          Medioambiente: 1851776000,
          Estado: 1119600000, // Deforestacion + Salud
          Mujeres: 6526728,
        },
      ],
      story: {
        title: 'Asimetría de Beneficios',
        text: 'El ratio SROI de 2.22 revela una tensión distributiva estructural. Mientras el 75% del valor generado (ambiental y estatal) es capturado externamente, las familias que producen este valor reciben una fracción menor. Esta asimetría evidencia que la rentabilidad social del proyecto se apoya, paradójicamente, en el trabajo de cuidado ambiental de una población población campesina envejecida',
      },
    },
    {
      id: 'SR2',
      title: 'Matriz de Evidencia (Auditoría SROI)',
      type: 'sroi_evidence_table',
      data: [
        {
          group: 'Familias Guardabosques',
          icon: Users,
          color: 'text-tertiary',
          indicator: 'Ingreso PSA (80 familias)',
          source: 'DNP / Guía SROI',
          grossValue: '859.842.000',
          attribution: '100% (No existía sin proyecto)',
          displacement: '0%',
          netValue: '859.842.000',
        },
        {
          group: 'Medioambiente',
          icon: Leaf,
          color: 'text-primary',
          indicator: 'tCO2e evitadas (80.512t)',
          source: 'Mercado Carbono ($23k/t)',
          grossValue: '1.851.776.000',
          attribution: '100% (Certificado)',
          displacement: '0%',
          netValue: '1.851.776.000',
        },
        {
          group: 'Estado / Sociedad',
          icon: Shield,
          color: 'text-secondary',
          indicator: 'Deforestación Evitada (150ha)',
          source: 'MinAmbiente (Costo Restauración)',
          grossValue: '2.280.000.000',
          attribution: '63% (Otros actores contribuyen)',
          displacement: '15% (Fuga)',
          netValue: '1.111.500.000',
        },
        {
          group: 'Mujeres Cuidadoras',
          icon: Heart,
          color: 'text-critical',
          indicator: 'Tiempo Ahorrado (Leña)',
          source: 'Banco Mundial (Salario Sombra)',
          grossValue: '8.587.800',
          attribution: '80% (Estufas eficientes)',
          displacement: null,
          netValue: '6.526.728',
        },
        {
          group: 'Familias Emprendedoras',
          icon: TrendingUp,
          color: 'text-secondary',
          indicator: 'Ventas Proyectos Productivos',
          source: 'Precios de Mercado Local',
          grossValue: '184.080.000',
          attribution: '60% (Esfuerzo propio + PSA)',
          displacement: '20% (Peso muerto)',
          netValue: '88.358.400',
        },
        {
          group: 'Sistema de Salud',
          icon: Activity,
          color: 'text-primary',
          indicator: 'Enfermedades Respiratorias Evitadas',
          source: 'OMS / Costos EPS',
          grossValue: '20.250.000',
          attribution: '40% (Otros factores)',
          displacement: '0%',
          netValue: '8.100.000',
        },
      ],
      story: {
        title: 'Rigor Metodológico',
        text: "Esta matriz detalla la conversión de indicadores físicos a valores monetarios. Los descuentos por 'Atribución' (qué tanto se debe al proyecto) y 'Desplazamiento' (efectos negativos laterales), aseguran que la cifra final de $3.926 MM sea conservadora y auditable.",
      },
    },
    {
      id: 'SR3',
      title: 'Diagnóstico de Estancamiento', // More academic/critical title
      type: 'text_matrix',
      // Updated data with Thesis concepts
      data: {
        q1: { title: 'Diagnóstico', text: 'Eficiencia Subsidiada: Éxito financiero a costa de bienestar campesino.' },
        q2: { title: 'Riesgo', text: 'Reversión por erosión del valor real del incentivo (inflación).' },
        q3: { title: 'Imperativo', text: 'Justicia Distributiva: Indexación de pagos y cierre de brechas.' },
        q4: { title: 'Futuro', text: 'Sostenibilidad 2.0: Relevo generacional y tecnología.' },
      },
      story: {
        title: 'Fragilidad Estructural',
        text: "El diagnóstico confirma la hipótesis de 'Eficiencia Subsidiada': el sistema se sostiene gracias a los campesinos, quienes mantienen la conservación a pesar de la erosión del incentivo, la falta de relevo generacional y la desigualdad de género. Sin una reforma estructural hacia la justicia distributiva, el modelo enfrenta un estancamiento inminente.",
      },
    },
    {
      id: 'SR5',
      title: 'Potencial SROI Futuro (No Monetizado)',
      type: 'sroi_future_impact_table',
      data: [
        {
          outcome: 'Biodiversidad y servicios ecosistémicos de hábitat',
          methodology: 'Transferencia de beneficios (ESVD/TEEB) o Costos de Reposición para servicios más allá del carbono.',
          impact: 'Muy alto (Aumenta brecha)',
          icon: Leaf,
          color: 'text-primary',
        },
        {
          outcome: 'Servicios hídricos y gobernanza hídrica',
          methodology: 'Costos evitados (tratamiento, dragado) y modelación InVEST de retención de sedimentos.',
          impact: 'Muy alto (Aumenta brecha)',
          icon: Droplets,
          color: 'text-primary',
        },
        {
          outcome: 'Cohesión social, capital social y paz territorial',
          methodology: 'Índices validados de confianza y cooperación; costos evitados de conflictividad local.',
          impact: 'Medio (Reduce brecha)',
          icon: HeartHandshake,
          color: 'text-secondary',
        },
        {
          outcome: 'Fortalecimiento institucional y gobernanza ambiental',
          methodology: 'Costos evitados de operación/monitoreo y eficiencias por articulación interinstitucional.',
          impact: 'Medio (Neutro)',
          icon: Shield,
          color: 'text-neutral',
        },
        {
          outcome: 'Reputación corporativa y beneficios ESG',
          methodology: 'Impact accounting y valoración de marca atribuible al portafolio de créditos (frontera ampliada).',
          impact: 'Condicional (Aumenta brecha)',
          icon: Briefcase,
          color: 'text-tertiary',
        },
        {
          outcome: 'Capital humano y capacidades técnicas',
          methodology: 'Costo de reposición de asistencia técnica o retornos a la formación (Mincer) por adopción de prácticas.',
          impact: 'Medio-alto (Reduce brecha)',
          icon: Lightbulb,
          color: 'text-secondary',
        },
      ],
      story: {
        title: 'Riesgo de Brecha',
        text: "La hoja de ruta metodológica identifica seis activos latentes susceptibles de valoración. Sin embargo, la jerarquía de impacto proyectada confirma la asimetría del modelo: mientras Biodiversidad y Agua ostentan un potencial financiero 'Muy Alto', los indicadores de Capital Humano y Cohesión Social se proyectan con impacto 'Medio'. En consecuencia, avanzar en esta medición integral no corregiría la brecha distributiva, sino que validaría técnicamente el desbalance estructural: un SROI dominado por retornos ecosistémicos masivos frente a beneficios sociales comparativamente modestos.",
      },
    },
  ],
};
