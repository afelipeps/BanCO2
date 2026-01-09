import { 
  Map, Users, Leaf, Heart, DollarSign, 
  Scale, Infinity as InfinityIcon, Calculator, 
  PawPrint, Wind, Info, Activity, BookOpen, Flame, Briefcase, 
  TrendingUp, Shield, Lightbulb, HeartHandshake, Droplets, Home
} from 'lucide-react';
import { THEME } from './theme';
import { DataSource } from './types';

export const DATA_SOURCE_OF_TRUTH: DataSource = {
  geografia: {
    id: "GEO",
    title: "1. Geografía",
    subtitle: "El Territorio",
    description: "Radiografía territorial del proyecto BancO2 Oriente: cómo se distribuyen los predios y las 22.512 hectáreas bajo acuerdo de conservación en los 15 municipios de la jurisdicción de CORNARE, qué tan fragmentado está el bosque y qué tan profundo llega la intervención a nivel vereda.",
    indicators: [
      {
        id: "G1",
        title: "Distribución Regional",
        type: "chart_bar_horizontal",
        tooltipUnit: "%",
        story: {
          title: "Corredores Biológicos",
          text: "La concentración en Puerto Triunfo y San Rafael (37% combinados) responde a la estrategia de conectar parches de bosque fragmentados en el Magdalena Medio."
        },
        data: [
          { name: 'Puerto Triunfo', value: 18.8, fill: THEME.colors.primary },
          { name: 'San Rafael', value: 18.8, fill: THEME.colors.primary },
          { name: 'San Carlos', value: 13.8, fill: THEME.colors.primary },
          { name: 'La Ceja', value: 12.5, fill: THEME.colors.primary },
          { name: 'Otros (7)', value: 36.1, fill: THEME.colors.secondary },
        ]
      },
      {
        id: "G2",
        title: "Índice de Conservación (ICE)",
        type: "chart_scatter",
        tooltipUnit: "Ha", 
        data: [
          { x: 5, y: 4, z: 10, name: 'Minifundios' },
          { x: 10, y: 8, z: 20, name: 'Pequeños' },
          { x: 50, y: 40, z: 50, name: 'Medianos' },
          { x: 150, y: 120, z: 100, name: 'Latifundios' },
          { x: 300, y: 250, z: 200, name: 'Grandes Reservas' },
        ],
        xLabel: "Área Total (Ha)",
        yLabel: "Área Conservada (Ha)",
        story: {
          title: "Compromiso Escalonable",
          text: "La relación entre área total del predio y área efectivamente conservada muestra una tendencia clara: tanto minifundistas como medianos y grandes propietarios mantienen una proporción elevada del predio bajo conservación (alrededor del 70–80%)."
        }
      },
      {
        id: "G3",
        title: "Perfil de Tenencia",
        type: "chart_bar_horizontal",
        tooltipUnit: "%",
        data: [
          { name: 'Minifundio (<10Ha)', value: 59.42, fill: THEME.colors.tertiary },
          { name: 'Mediano (10-50Ha)', value: 34.78, fill: THEME.colors.secondary },
          { name: 'Latifundio (>50Ha)', value: 5.80, fill: THEME.colors.primary },
        ],
        story: {
          title: "Desafío del Minifundio",
          text: "El 59.4% de los socios son minifundistas. Esto limita la capacidad de escala productiva y aumenta la dependencia del incentivo monetario, aunque se observa una participación importante de predios medianos (34.8%)."
        }
      },
      {
        id: "G4",
        title: "Madurez en el Proyecto",
        type: "chart_bar_horizontal",
        tooltipUnit: "%",
        data: [
          { name: 'Fase A (2017)', value: 8.75, fill: THEME.colors.primary },
          { name: 'Fase A + B (2019)', value: 20.00, fill: THEME.colors.secondary },
          { name: 'Fase A + B + C (2021)', value: 37.50, fill: THEME.colors.tertiary },
          { name: 'Fase A + B + C + D (2023-2024)', value: 33.75, fill: THEME.colors.neutral },
        ],
        story: {
          title: "Renovación Generacional",
          text: "El 71.25% de las familias se vinculó en las fases más recientes (2021-2024), el reto es transferir la cultura de conservación de los 'Pioneros' a esta nueva ola."
        }
      },
      {
        id: "G5",
        title: "Pisos Térmicos",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'Templado (Bosques)', value: 45.00, color: THEME.colors.primary },
          { name: 'Frío (Altiplano)', value: 36.25, color: THEME.colors.secondary },
          { name: 'Cálido (Magdalena)', value: 18.75, color: THEME.colors.tertiary },
        ],
        story: {
          title: "Diversidad Ecosistémica",
          text: "La intervención se enfoca principalmente en bosques andinos y subandinos de clima templado, con menor presencia en zonas cálidas y frías, lo cual coincide con los objetivos climáticos e hídricos del proyecto. Además, se destaca que la mayor importancia del proyecto radica en la protección de fuentes de agua para áreas metropolitanas, más allá de la captura de carbono."
        }
      },
      {
        id: "G6",
        title: "Cobertura Veredal",
        type: "kpi_card",
        kpiValue: "52",
        kpiUnit: "Veredas Únicas",
        icon: Map,
        trend: "Alta Capilaridad",
        story: {
          title: "Profundidad Territorial",
          text: "El programa tiene presencia en 52 veredas con familias encuestadas, lo que revela una dispersión territorial significativa. BancO₂ no es un proyecto concentrado en una sola cuenca, sino una red fina de puntos de conservación."
        }
      }
    ]
  },
  poblacion: {
    id: "POB",
    title: "2. Población",
    subtitle: "Los Guardianes",
    description: "Perfil humano de las familias guardabosques: sexo, edad, jefatura de hogar y composición familiar de las 155 familias vinculadas al programa, a partir de la muestra encuestada de 80 hogares, para entender quién sostiene en la práctica los acuerdos de conservación.",
    indicators: [
      {
        id: "P1",
        title: "Composición por Género",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'Hombres', value: 58.8, color: THEME.colors.secondary },
          { name: 'Mujeres', value: 41.2, color: THEME.colors.critical },
        ],
        story: {
          title: "Inclusión Femenina",
          text: "41.2% de mujeres titulares es una cifra alta para el sector rural, indicando un empoderamiento real en la titularidad."
        }
      },
      {
        id: "P2",
        title: "Jefatura de Hogar por Sexo",
        type: "chart_bar_stacked",
        tooltipUnit: "%",
        data: [
          { name: 'Mujeres', jefes: 78.79, no_jefes: 21.21 },
          { name: 'Hombres', jefes: 93.62, no_jefes: 6.38 },
        ],
        bars: [
          { key: 'jefes', name: 'Es Jefe de Hogar', color: THEME.colors.critical },
          { key: 'no_jefes', name: 'Otro Rol', color: THEME.colors.neutral }
        ],
        story: {
          title: "Doble Carga Femenina",
          text: "La proporción de mujeres titulares que además son jefas de hogar (78.8%) sigue siendo muy alta, confirmando la doble carga (hogar + predio). En contraste, la jefatura masculina es casi absoluta (93.6%), lo que refleja patrones tradicionales de autoridad."
        }
      },
      {
        id: "P3",
        title: "Pirámide Poblacional",
        type: "chart_bar_vertical",
        tooltipUnit: "%",
        data: [
          { name: '<18-30', value: 5.00, fill: THEME.colors.primary },
          { name: '31-45', value: 17.50, fill: THEME.colors.secondary },
          { name: '46-60', value: 28.75, fill: THEME.colors.tertiary },
          { name: '61-75', value: 35.00, fill: THEME.colors.neutral },
          { name: '>75',   value: 13.75, fill: THEME.colors.critical },
        ],
        story: {
          title: "Envejecimiento Acentuado",
          text: "El envejecimiento es más profundo de lo esperado: el grupo de >75 años (13.75%) casi triplica a la base joven de <30 años (5.00%). El grueso poblacional (63.75%) está entre 46 y 75 años, lo que hace urgente la estrategia de relevo generacional."
        }
      },
      {
        id: "P4",
        title: "Edad Promedio",
        type: "kpi_card",
        kpiValue: "57.8",
        kpiUnit: "Años",
        icon: Users,
        trend: "Tendencia Alta",
        story: {
          title: "Pasivo Pensional Ambiental",
          text: "La edad promedio de 57.8 años señala un riesgo de 'pasivo pensional' para la conservación. El modelo descansa sobre una generación envejecida, sin garantías claras de relevo, lo que constituye una fragilidad estructural para la sostenibilidad a largo plazo."
        }
      },
      {
        id: "P5",
        title: "Jefatura del Hogar",
        type: "kpi_card",
        kpiValue: "87.5%",
        kpiUnit: "Son Jefes de Hogar",
        icon: Home,
        trend: "Autonomía",
        story: {
          title: "Poder de Decisión",
          text: "El incentivo llega a quien toma las decisiones. Esto reduce el riesgo de gasto suntuario y asegura su uso en necesidades básicas."
        }
      }
    ]
  },
  ambiental: {
    id: "AMB",
    title: "3. Ambiental",
    subtitle: "El Bosque Vivo",
    description: "Comportamiento del ecosistema en los predios bajo PSA/REDD+: área efectivamente conservada, servicios ecosistémicos percibidos, presencia de fauna indicadora y cambios en prácticas como la tala, conectados con las metas de reducción de emisiones y protección de bosques.",
    indicators: [
      {
        id: "A1",
        title: "Área de Conservación",
        type: "kpi_card",
        kpiValue: "104.6",
        kpiUnit: "Ha / Familia",
        icon: Leaf,
        trend: "Alto Impacto",
        story: {
          title: "Escala de Protección",
          text: "El promedio de 104.6 hectáreas conservadas por familia muestra una escala de protección significativa: incluso considerando variaciones entre predios, se trata de extensiones grandes para un esquema de PSA campesino. Esta relación entre tamaño de predio y área conservada se traduce en un impacto relevante en captura y almacenamiento de carbono, y sobre todo en conectividad de hábitats."
        }
      },
      {
        id: "A2",
        title: "Servicios Ecosistémicos",
        type: "chart_radar",
        tooltipUnit: "%",
        data: [
          { subject: 'Densidad Bosque', A: 97.5, fullMark: 100 },
          { subject: 'Cantidad Agua', A: 97.5, fullMark: 100 },
          { subject: 'Calidad Agua', A: 97.5, fullMark: 100 },
          { subject: 'Aire Puro', A: 97.5, fullMark: 100 },
          { subject: 'Fauna', A: 97.5, fullMark: 100 },
        ],
        story: {
          title: "Consenso Absoluto",
          text: "El 97.5% de las familias percibe mejora en TODOS los indicadores ambientales (Aire, Agua, Bosque, Fauna). Es un consenso casi unánime."
        }
      },
      {
        id: "A3",
        title: "Fauna Indicadora (Word Count)",
        type: "word_count_table",
        data: [
          { category: 'Mamíferos', species: 'conejos (25), ardillas (16), armadillos (15), gurres (15), guaguas (14), titis (10), mico (10)', total: 105, icon: PawPrint, color: 'text-emerald-400' },
          { category: 'Aves', species: 'aves (33), cacatúas (15), guacharacas (15), loros (14), gallinetas (9), gurrias (5)', total: 91, icon: Wind, color: 'text-blue-500' },
          { category: 'Reptiles', species: 'serpientes (7)', total: 7, icon: Info, color: 'text-amber-400' },
          { category: 'TOTAL', species: '', total: 203, isTotal: true },
        ],
        story: {
          title: "Biodiversidad Visible",
          text: "Que los mamíferos (conejos, ardillas, armadillos, entre otros) sean el grupo más mencionado, seguidos de las aves, sugiere una recuperación de fauna visible para los campesinos. La presencia de pequeños mamíferos y diversidad de aves suele estar asociada a bosques en mejor estado, con menos perturbación y más heterogeneidad estructural."
        }
      },
      {
        id: "A4",
        title: "Prácticas de Manejo",
        type: "chart_bar_horizontal",
        tooltipUnit: "%",
        data: [
          { name: 'Limpieza Fuentes', value: 63.7, fill: THEME.colors.primary },
          { name: 'Siembra/Reforestación', value: 45, fill: THEME.colors.secondary },
          { name: 'Cercas Vivas', value: 1.2, fill: THEME.colors.tertiary },
        ],
        story: {
          title: "Cuidado del Agua",
          text: "Las prácticas dominantes son la limpieza de fuentes de agua (alrededor de dos tercios) y la siembra/reforestación (cerca de la mitad). Esto muestra que las familias no solo dejan de talar, sino que actúan activamente para restaurar y cuidar el bosque, con énfasis en el recurso hídrico. El punto débil es la baja frecuencia de prácticas como cercas vivas y mantenimiento estructural del bosque, que son clave para la conectividad ecológica y la resiliencia a largo plazo."
        }
      },
      {
        id: "A5",
        title: "Patrón de Tala",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'Cultura Previa (Nunca)', value: 78.75, color: THEME.colors.primary },
          { name: 'Eliminó (Impacto PSA)', value: 12.50, color: THEME.colors.secondary },
          { name: 'Redujo (Impacto PSA)', value: 8.75, color: THEME.colors.tertiary },
        ],
        story: {
          title: "Impacto Real Focalizado",
          text: "Auditoría: El 78.8% de las familias (63/80) ya tenía una cultura de no-tala previa. El impacto del PSA se focalizó en el grupo crítico que sí talaba (17 familias): de este segmento, el 59% eliminó la práctica por completo y el 41% la redujo significativamente."
        }
      },
      {
        id: "A6",
        title: "Mitigación Cambio Climático",
        type: "kpi_card",
        kpiValue: "98%",
        kpiUnit: "Conscientes",
        icon: Activity,
        trend: "Educación",
        story: {
          title: "Conciencia Global",
          text: "El 98% de las familias declara entender que su trabajo local contribuye a mitigar el cambio climático. Más allá del número, esto habla de una internalización cultural del discurso climático: los campesinos no se ven solo como receptores de subsidios, sino como actores de una agenda ambiental."
        }
      }
    ]
  },
  social: {
    id: "SOC",
    title: "4. Social",
    subtitle: "La Vida en el Hogar",
    description: "Cambios en la vida cotidiana de las familias asociados al programa: acceso a tecnologías como estufas eficientes, condiciones de vivienda, organización del tiempo de cuidado y percepciones de tejido social, para identificar mejoras en bienestar y brechas que aún persisten.",
    indicators: [
      {
        id: "S1",
        title: "Desacople del Incentivo",
        type: "chart_line_multi", 
        tooltipUnit: "%",
        data: [
          { name: 'Fase A (2017)', bienestar: 71.4, compromiso: 100 },
          { name: 'Fase B (2019)', bienestar: 43.8, compromiso: 100 },
          { name: 'Fase C (2021)', bienestar: 26.7, compromiso: 100 },
          { name: 'Fase D (2023)', bienestar: 14.8, compromiso: 100 },
        ],
        story: {
          title: "Fenómeno de Desacople",
          text: "Mientras la percepción de mejora económica se desploma del 71.4% (Pioneros) al 14.8% (Recientes), la voluntad de conservar sin pago se mantiene intacta en el 100%. Esto sugiere que el éxito del programa no es meramente económico; depende de una cultura de conservación preexistente en los campesinos, que ahora es reconocida por el incentivo."
        }
      },
      {
        id: "S2",
        title: "Destino de la Inversión PSA",
        type: "chart_bar_horizontal",
        tooltipUnit: "%",
        data: [
          { name: 'Solo Alimentación', value: 35.0, fill: THEME.colors.tertiary },
          { name: 'Alim + Prod', value: 23.8, fill: THEME.colors.primary },
          { name: 'Alim + Educ', value: 16.3, fill: THEME.colors.secondary },
          { name: 'Otros Mixtos', value: 24.9, fill: THEME.colors.neutral },
        ],
        story: {
          title: "Seguridad Alimentaria",
          text: "El uso del PSA se orienta prioritariamente a alimentación: 35% lo dedica solo a comida y buena parte del resto combina alimentos con otros usos (productivos, educación, vivienda)."
        }
      },
      {
        id: "S3",
        title: "Capacidad de Ahorro",
        type: "chart_bar_vertical",
        tooltipUnit: "%",
        data: [
          { name: 'No Mejoró', value: 51.25, fill: THEME.colors.critical },
          { name: 'Sí Mejoró', value: 35.00, fill: THEME.colors.primary },
          { name: 'Igual/NS', value: 13.75, fill: THEME.colors.neutral },
        ],
        story: {
          title: "Mejora Progresiva",
          text: "Aunque la fragilidad persiste en la mitad de los hogares (51.25%), el porcentaje de familias que logra ahorrar ha crecido al 35%, absorbiendo gran parte de la incertidumbre anterior."
        }
      },
      {
        id: "S4",
        title: "Acceso a Educación",
        type: "kpi_card",
        kpiValue: "6.3%",
        kpiUnit: "Reportan Acceso",
        icon: BookOpen,
        trend: "Brecha",
        story: {
          title: "Oportunidad Educativa",
          text: "Solo alrededor de 6,3% de los hogares reporta un cambio positivo en acceso a educación gracias al PSA (por ejemplo, pago de matrículas, útiles o transporte)."
        }
      },
      {
        id: "S5",
        title: "Salud (Estufas)",
        type: "kpi_card",
        kpiValue: "100%",
        kpiUnit: "Mejora Salud",
        icon: Flame,
        trend: "Alto Impacto",
        story: {
          title: "Impacto en Salud",
          text: "Cerca del 18,8% de las familias reporta contar con estufas eficientes, lo que reduce exposición a humo y consumo de leña. El análisis de tiempo liberado muestra ahorros promedio de 3,7 horas/semana de recolección de leña en las familias con datos completos."
        }
      },
      {
        id: "S6",
        title: "Participación Comunitaria",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'Activos en Grupos', value: 28.7, color: THEME.colors.secondary },
          { name: 'No Participan', value: 71.3, color: THEME.colors.neutral },
        ],
        story: {
          title: "Reto de Asociatividad",
          text: "Solo alrededor de 28,7% de las personas participa de forma activa en organizaciones comunitarias (JAC, asociaciones, grupos productivos)."
        }
      },
      {
        id: "S7",
        title: "Relaciones Vecinales",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'No hubo mejora', value: 68.75, color: THEME.colors.neutral },
          { name: 'Hubo mejora', value: 31.25, color: THEME.colors.primary },
        ],
        story: {
          title: "Beneficio Social",
          text: "Un segmento significativo de las familias (31.25%) reporta que el programa ha tenido un impacto positivo en el fortalecimiento de la relación con sus vecinos, lo que demuestra un beneficio social y comunitario. Sin embargo, la mayoría (68.75%) no percibió un cambio en la convivencia."
        }
      },
      {
        id: "S8",
        title: "El Valor del Tiempo",
        type: "chart_bar_horizontal",
        tooltipUnit: "%",
        data: [
          { name: '> 4 Hrs/Semana', value: 83.3, fill: THEME.colors.primary },
          { name: '1-3 Hrs/Semana', value: 8.3, fill: THEME.colors.secondary },
          { name: 'Sin Cambio', value: 8.3, fill: THEME.colors.neutral },
        ],
        story: {
          title: "Tiempo Liberado",
          text: "El análisis de la base muestra que las familias con estufa eficiente ahorran, en promedio, 3,7 horas semanales en recolección y manejo de leña, con 83,3% de los casos reportando ahorros de más de 4 horas."
        }
      },
      {
        id: "S9",
        title: "Liderazgo Femenino",
        type: "chart_bar_stacked",
        tooltipUnit: "%",
        data: [
          { name: 'Mujeres', participa: 36.36, no_participa: 63.64 },
          { name: 'Hombres', participa: 23.91, no_participa: 76.09 },
        ],
        bars: [
          { key: 'participa', name: 'Lidera/Participa', color: THEME.colors.secondary },
          { key: 'no_participa', name: 'No Participa', color: THEME.colors.neutral }
        ],
        story: {
          title: "Protagonismo de la Mujer",
          text: "En las encuestas, alrededor del 35% de las mujeres participa en espacios comunitarios de liderazgo, una proporción mayor que la observada en hombres."
        }
      }
    ]
  },
  economica: {
    id: "ECO",
    title: "5. Economía",
    subtitle: "Ingresos y Producción",
    description: "Evidencia de cómo el PSA y los proyectos productivos se traducen (o no) en estabilidad económica: uso del incentivo, diversificación de ingresos, dinamismo de los emprendimientos rurales y brechas de ingresos por género, destacando tanto los avances como los cuellos de botella para la autonomía financiera.",
    indicators: [
      {
        id: "E1",
        title: "Tenencia Proyecto",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'No Tiene', value: 60.0, color: THEME.colors.critical },
          { name: 'Sí Tiene', value: 40.0, color: THEME.colors.primary },
        ],
        story: {
          title: "Riesgo Estructural",
          text: "El 40% de las familias reporta tener un proyecto productivo activo; sin embargo, el 60% aún depende casi exclusivamente del PSA y actividades de subsistencia."
        }
      },
      {
        id: "E2",
        title: "Vocación Productiva",
        type: "chart_bar_horizontal",
        tooltipUnit: "%",
        data: [
          { name: 'Enfoque Comercial Activo', value: 78.3, fill: THEME.colors.primary },
          { name: 'Subsistencia (Pancoger)', value: 21.7, fill: THEME.colors.neutral },
        ],
        story: {
          title: "Enfoque Comercial",
          text: "Entre las familias que tienen proyectos productivos activos, la mayoría se inclina hacia negocios con enfoque comercial (78.3%), en contraste con la minoría que se dedica a la subsistencia."
        }
      },
      {
        id: "E3",
        title: "Erosión del Incentivo",
        type: "chart_erosion",
        tooltipUnit: "$",
        data: [
          { name: '2018', smlv: 781242, incentivo: 202467, deficit: -578775, cobertura: 25.9 },
          { name: '2019', smlv: 828116, incentivo: 210320, deficit: -617796, cobertura: 25.4 },
          { name: '2020', smlv: 877803, incentivo: 225000, deficit: -652803, cobertura: 25.6 },
          { name: '2021', smlv: 908526, incentivo: 225000, deficit: -683526, cobertura: 24.7 },
          { name: '2022', smlv: 1000000, incentivo: 246522, deficit: -753478, cobertura: 24.7 },
          { name: '2023', smlv: 1160000, incentivo: 261659, deficit: -898341, cobertura: 22.6 },
        ],
        story: {
          title: "Eficiencia Subsidiada",
          text: "Este gráfico documenta la 'Eficiencia Subsidiada': el valor real del incentivo cae (línea violeta vs inflación), pero la conservación se mantiene. El déficit económico es cubierto implícitamente por las familias, quienes absorben la pérdida de poder adquisitivo para sostener el acuerdo de conservación."
        }
      },
      {
        id: "E4",
        title: "Brecha Ingresos (Género)",
        type: "chart_bar_vertical",
        tooltipUnit: "$",
        data: [
          { name: 'Hombres', value: 850000, fill: THEME.colors.secondary },
          { name: 'Mujeres', value: 100000, fill: THEME.colors.critical },
        ],
        story: {
          title: "Vulnerabilidad Femenina",
          text: "El dashboard muestra una brecha extrema: Hombres $850.000 COP vs $100.000 en mujeres, es decir, una relación de 8.5 a 1."
        }
      },
      {
        id: "E5",
        title: "Destino Producción",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'Venta', value: 56, color: THEME.colors.primary },
          { name: 'Autoconsumo', value: 10, color: THEME.colors.tertiary },
          { name: 'Pérdida/Mixto', value: 34, color: THEME.colors.neutral },
        ],
        story: {
          title: "Integración al Mercado",
          text: "Entre quienes producen, 56% logra vender más de la mitad de su cosecha, mientras el restante se queda entre autoconsumo, venta parcial y pérdida."
        }
      },
      {
        id: "E6",
        title: "Generación de Empleo",
        type: "kpi_card",
        kpiValue: "16.7%",
        kpiUnit: "Genera Empleo",
        icon: Briefcase,
        trend: "Marginal",
        story: {
          title: "Auto-Empleo Familiar",
          text: "Solo 16,7% de las familias genera empleo adicional (jornales) a partir de sus actividades productivas, y en la mayoría de casos es empleo ocasional."
        }
      },
      {
        id: "E7",
        title: "Emprendimiento (Origen)",
        type: "chart_combo",
        tooltipUnit: "%",
        data: [
          { name: 'Inició con PSA', percentage: 37.50, income: 100000 },
          { name: 'Ya lo Tenía', percentage: 34.38, income: 100000 },
          { name: 'Fortalecido', percentage: 28.12, income: 6733350 },
        ],
        story: {
          title: "Salto Exponencial",
          text: "El contraste es dramático: aunque el 71% de los proyectos son nuevos o de subsistencia con ingresos de $100k, el grupo que 'Fortaleció' su negocio previo (28%) logra ingresos 67 veces superiores ($6.7M), demostrando el poder del PSA como acelerador de capital."
        }
      },
      {
        id: "E8",
        title: "Empleo Rural",
        type: "chart_bar_horizontal",
        tooltipUnit: "%",
        data: [
          { name: 'No Genera', value: 83.3, fill: THEME.colors.critical },
          { name: '1-2 Jornales', value: 12.5, fill: THEME.colors.secondary },
          { name: '3+ Jornales', value: 4.2, fill: THEME.colors.primary },
        ],
        story: {
          title: "Impacto Indirecto",
          text: "El detalle muestra que 83,3% de los emprendimientos no genera empleo adicional; 12,5% contrata 1–2 jornales/mes y solo 4,2% genera más de 3 jornales mensuales."
        }
      },
      {
        id: "E9",
        title: "Nivel Comercialización",
        type: "chart_funnel",
        tooltipUnit: "%",
        data: [
          { name: 'Producción total', value: 100, fill: THEME.colors.neutral },
          { name: 'Autoconsumo', value: 44, fill: THEME.colors.tertiary },
          { name: 'Venta parcial', value: 30, fill: THEME.colors.secondary },
          { name: 'Venta consolidada', value: 26, fill: THEME.colors.primary },
        ],
        story: {
          title: "Ruta de Madurez",
          text: "De la Producción Total (100%), el 44% se queda en Autoconsumo (subsistencia). El reto comercial está en el siguiente escalón: un 30% logra Venta Parcial, y solo el 26% alcanza la Venta Consolidada, convirtiéndose en negocios sostenibles."
        }
      }
    ]
  },
  gobernanza: {
    id: "GOB",
    title: "6. Gobernanza",
    subtitle: "Operación y Confianza",
    description: "Desempeño institucional del esquema BancO2: calidad y cumplimiento de los acuerdos de conservación, relación con CORNARE y Masbosques, fluidez de los pagos y niveles de confianza de las familias en la regla de juego, clave para la permanencia del proyecto.",
    indicators: [
      {
        id: "GO1",
        title: "Índice de Confianza",
        type: "kpi_rating",
        value: 4.72,
        max: 5,
        story: {
          title: "Capital Intangible",
          text: "La calificación de 4.72/5 indica una confianza muy alta en Masbosques/CORNARE. Este es quizás el activo intangible más valioso del programa: incluso con fricciones operativas, las familias siguen creyendo en la intención y en la legitimidad de la institución."
        }
      },
      {
        id: "GO2",
        title: "Cobertura Técnica",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'Sí Recibe', value: 48.8, color: THEME.colors.secondary },
          { name: 'No Recibe', value: 51.2, color: THEME.colors.critical },
        ],
        story: {
          title: "Brecha Operativa",
          text: "La mitad de las familias reporta no recibir acompañamiento técnico constante."
        }
      },
      {
        id: "GO3",
        title: "Frecuencia de Visitas",
        type: "chart_bar_vertical",
        tooltipUnit: "%",
        data: [
          { name: 'Anual', value: 40.5, fill: THEME.colors.tertiary },
          { name: 'Semestral', value: 35.2, fill: THEME.colors.primary },
          { name: 'Cada 10-12 Meses', value: 24.3, fill: THEME.colors.secondary },
        ],
        story: {
          title: "Intensidad Baja",
          text: "Entre quienes sí reciben visitas, la frecuencia predominante es anual, seguida de semestral. Para un programa que combina conservación y restauración, este nivel de contacto es insuficiente para procesos complejos."
        }
      },
      {
        id: "GO4",
        title: "Calidad Visita",
        type: "kpi_rating",
        value: 5.0,
        max: 5,
        story: {
          title: "Calidad vs Cobertura",
          text: "Cuando la visita ocurre, las familias califican la calidad con el máximo puntaje (5.0/5). Es decir, el problema no es de capacidades técnicas, sino de logística, cobertura y frecuencia."
        }
      },
      {
        id: "GO5",
        title: "Convivencia Vecinal",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'No hubo mejora', value: 68.75, color: THEME.colors.neutral },
          { name: 'Hubo mejora', value: 31.25, color: THEME.colors.primary },
        ],
        story: {
          title: "Gobernanza Territorial",
          text: "Aunque la mayoría reporta estabilidad (68.75%), el 31.25% percibe una mejora explícita en la convivencia. Esto confirma que el programa actúa como un mediador silencioso: al clarificar linderos y reglas de uso del bosque, reduce estructuralmente los conflictos vecinales."
        }
      },
      {
        id: "GO6",
        title: "Puntualidad Pagos",
        type: "kpi_rating",
        value: 3.77,
        max: 5,
        isAlert: true,
        story: {
          title: "PUNTO DE DOLOR",
          text: "Con una calificación de 3.77/5, la puntualidad de pagos es claramente el principal punto de dolor. Para hogares que dependen del PSA para alimentación y servicios básicos, los retrasos no son un detalle administrativo: son crisis de caja. Si no se corrige, este factor puede erosionar la confianza y empujar a algunas familias a buscar fuentes de ingreso alternativas incluso a costa de la conservación."
        }
      },
      {
        id: "GO7",
        title: "Transparencia",
        type: "kpi_rating",
        value: 5.0,
        max: 5,
        story: {
          title: "Honestidad",
          text: "La percepción de transparencia es 5,0/5: las familias no reportan dudas sobre el manejo de recursos ni sobre la 'honestidad' del programa."
        }
      },
      {
        id: "GO8",
        title: "Participación",
        type: "chart_bar_vertical",
        tooltipUnit: "%",
        data: [
          { name: 'A Veces', value: 87.5, fill: THEME.colors.tertiary },
          { name: 'Siempre', value: 12.5, fill: THEME.colors.primary },
        ],
        story: {
          title: "Déficit Democrático",
          text: "El 87,5% de las personas declara participar 'a veces' en espacios de decisión y solo 12,5% 'siempre'; la mayoría siente que su rol es más de receptor de instrucciones que de co-diseñador de soluciones."
        }
      }
    ]
  },
  sostenibilidad: {
    id: "SOST",
    title: "7. Sostenibilidad",
    subtitle: "Futuro y Riesgos",
    description: "Grado de sostenibilidad de los impactos en el tiempo: motivaciones para conservar, disposición a continuar aún sin pagos y percepción de riesgos",
    indicators: [
      {
        id: "ST1",
        title: "Índice de Orgullo",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'Orgulloso', value: 98, color: THEME.colors.secondary },
          { name: 'Indiferente', value: 2, color: THEME.colors.neutral },
        ],
        story: {
          title: "Salario Emocional",
          text: "El 98% de las personas declara sentirse orgullosa de ser guardabosques; es un verdadero salario emocional asociado al rol que cumple el programa en la identidad campesina."
        }
      },
      {
        id: "ST2",
        title: "Continuidad (Sin Pago)",
        type: "kpi_card",
        kpiValue: "100%",
        kpiUnit: "Seguiría Conservando",
        icon: InfinityIcon,
        trend: "Victoria Cultural",
        story: {
          title: "Ética Instalada",
          text: "El 100% de las familias manifestó que protegería el bosque incluso sin recibir el incentivo económico."
        }
      },
      {
        id: "ST3",
        title: "Matriz Estratégica",
        type: "text_matrix",
        data: {
          q1: { title: "Fortaleza", text: "Convicción cultural sólida (100%)" },
          q2: { title: "Oportunidad", text: "Proyectos productivos (Cacao/Turismo)" },
          q3: { title: "Debilidad", text: "Fricción operativa en pagos" },
          q4: { title: "Amenaza", text: "Relevo generacional fallido" }
        },
        story: {
          title: "Conclusión",
          text: "La combinación de fortalezas (convicción cultural), oportunidades (proyectos productivos), debilidades (fricción operativa, baja diversificación) y amenazas (relevo generacional fallido) sintetiza muy bien la situación del programa: culturalmente exitoso, financieramente frágil. Es un mensaje honesto para decisores: si se invierte solo en mantener los pagos pero no en resolver la debilidad productiva y el relevo generacional, el modelo seguirá siendo vulnerable."
        }
      },
      {
        id: "ST4",
        title: "Fricción Operativa",
        type: "chart_bar_horizontal",
        tooltipUnit: "%",
        data: [
          { name: 'Pagos', value: 48.57, fill: THEME.colors.critical },
          { name: 'Trámites', value: 33.57, fill: THEME.colors.tertiary },
          { name: 'Visitas', value: 17.86, fill: THEME.colors.neutral },
        ],
        story: {
          title: "Riesgo Operativo",
          text: "La sostenibilidad no es solo ecológica y financiera, sino también operacional. Retrasos, trámites y fallas de comunicación erosionan la capacidad del programa para sostener en el tiempo la confianza y el compromiso. Si este problema se intensifica, puede desencadenar un efecto bola de nieve: menor confianza, menor participación, menos disposición a mantener prácticas de conservación cuando hay dificultades."
        }
      },
      {
        id: "ST5",
        title: "Motivación Principal",
        type: "chart_pie",
        tooltipUnit: "%",
        data: [
          { name: 'Convicción Ambiental', value: 64.9, color: THEME.colors.secondary },
          { name: 'Necesidad Económica', value: 26.0, color: THEME.colors.tertiary },
          { name: 'Otros', value: 9.1, color: THEME.colors.neutral },
        ],
        story: {
          title: "Profundidad del Cambio",
          text: "El análisis confirma que la motivación intrínseca domina: la 'Convicción Ambiental' (64.9%) supera por amplio margen a la 'Necesidad Económica' (26.0%). Esto indica que el programa ha logrado instalar una ética de conservación que ya no depende exclusivamente del incentivo monetario."
        }
      },
      {
        id: "ST6",
        title: "La impuntualidad erosiona la confianza",
        type: "chart_correlation",
        tooltipUnit: "",
        data: [
          { x: 5, y: 5, z: 13 }, { x: 4, y: 5, z: 23 }, { x: 3, y: 5, z: 10 },
          { x: 3, y: 4, z: 13 }, { x: 4, y: 4, z: 3 }, { x: 5, y: 4, z: 0 }, 
          // Datos agregados representativos de la distribución
        ],
        regressionPoints: [
          { x: 2.8, y: 4.38 }, // 3.46 + 0.33 * 2.8
          { x: 5.2, y: 5.17 }  // 3.46 + 0.33 * 5.2
        ],
        story: {
          title: "Correlación Significativa",
          text: "Para determinar si las fricciones operativas erosionan el capital relacional, se aplicó un análisis de sensibilidad mediante una regresión lineal simple. Los hallazgos evidencian una correlación de Pearson positiva moderada entre la puntualidad percibida y la confianza institucional (r = 0.54). El coeficiente de determinación (R² = 0.29) revela que cerca del 30% de la variabilidad en la confianza se explica explícitamente por la eficiencia en los pagos. La ecuación resultante (Confianza = 3.46 + 0.33 × Puntualidad) ofrece una lectura política de fondo: el intercepto de 3,46 sugiere la existencia de un piso de legitimidad institucional fuerte que amortigua las fallas logísticas; sin embargo, la pendiente (β = 0.33) confirma que la impuntualidad no es indiferente, pues tiene un costo reputacional acumulativo que penaliza la valoración final del esquema."
        }
      }
    ]
  },
  sroi: {
    id: "SROI",
    title: "8. SROI",
    subtitle: "Eficiencia Subsidiada",
    description: "Evaluación del Retorno Social de la Inversión: Valor Público vs. Fragilidad Privada (2017-2024). Este panel revela cómo el éxito financiero del programa se sustenta en un subsidio invisible aportado por la comunidad.",
    indicators: [
      {
        id: "SR1",
        title: "Asimetría de Beneficios",
        type: "sroi_balance_chart",
        tooltipUnit: "COP",
        data: [
            { 
                name: 'Inversión (Inputs)', 
                totalFormatted: '1.766 MM',
                total: 1765929034,
                Masbosques: 1389456598, 
                Municipios: 347972436, // San Rafael + Granada + Guatape
                CORNARE: 28500000 
            },
            { 
                name: 'Impacto (Outcomes)', 
                totalFormatted: '3.926 MM',
                total: 3926103128,
                Familias: 948200400, // PSA + Emprendimiento
                Medioambiente: 1851776000, 
                Estado: 1119600000, // Deforestacion + Salud
                Mujeres: 6526728 
            }
        ],
        story: {
          title: "Asimetría de Beneficios",
          text: "El ratio SROI de 2.22 revela una tensión distributiva estructural. Mientras el 75% del valor generado (ambiental y estatal) es capturado externamente, las familias que producen este valor reciben una fracción menor. Esta asimetría evidencia que la rentabilidad social del proyecto se apoya, paradójicamente, en el trabajo de cuidado ambiental de una población población campesina envejecida"
        }
      },
      {
        id: "SR2",
        title: "Matriz de Evidencia (Auditoría SROI)",
        type: "sroi_evidence_table",
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
                netValue: '859.842.000'
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
                netValue: '1.851.776.000'
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
                netValue: '1.111.500.000'
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
                netValue: '6.526.728'
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
                netValue: '88.358.400'
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
                netValue: '8.100.000'
            }
        ],
        story: {
          title: "Rigor Metodológico",
          text: "Esta matriz detalla la conversión de indicadores físicos a valores monetarios. Los descuentos por 'Atribución' (qué tanto se debe al proyecto) y 'Desplazamiento' (efectos negativos laterales), aseguran que la cifra final de $3.926 MM sea conservadora y auditable."
        }
      },
      {
        id: "SR3",
        title: "Diagnóstico de Estancamiento", // More academic/critical title
        type: "text_matrix",
        // Updated data with Thesis concepts
        data: {
             q1: { title: "Diagnóstico", text: "Eficiencia Subsidiada: Éxito financiero a costa de bienestar campesino." },
             q2: { title: "Riesgo", text: "Reversión por erosión del valor real del incentivo (inflación)." },
             q3: { title: "Imperativo", text: "Justicia Distributiva: Indexación de pagos y cierre de brechas." },
             q4: { title: "Futuro", text: "Sostenibilidad 2.0: Relevo generacional y tecnología." }
        },
        story: {
          title: "Fragilidad Estructural",
          text: "El diagnóstico confirma la hipótesis de 'Eficiencia Subsidiada': el sistema se sostiene gracias a los campesinos, quienes mantienen la conservación a pesar de la erosión del incentivo, la falta de relevo generacional y la desigualdad de género. Sin una reforma estructural hacia la justicia distributiva, el modelo enfrenta un estancamiento inminente."
        }
      },
      {
        id: "SR5",
        title: "Potencial SROI Futuro (No Monetizado)",
        type: "sroi_future_impact_table",
        data: [
          {
            outcome: "Biodiversidad y servicios ecosistémicos de hábitat",
            methodology: "Transferencia de beneficios (ESVD/TEEB) o Costos de Reposición para servicios más allá del carbono.",
            impact: "Muy alto (Aumenta brecha)",
            icon: Leaf,
            color: "text-primary"
          },
          {
            outcome: "Servicios hídricos y gobernanza hídrica",
            methodology: "Costos evitados (tratamiento, dragado) y modelación InVEST de retención de sedimentos.",
            impact: "Muy alto (Aumenta brecha)",
            icon: Droplets,
            color: "text-primary"
          },
          {
            outcome: "Cohesión social, capital social y paz territorial",
            methodology: "Índices validados de confianza y cooperación; costos evitados de conflictividad local.",
            impact: "Medio (Reduce brecha)",
            icon: HeartHandshake,
            color: "text-secondary"
          },
          {
            outcome: "Fortalecimiento institucional y gobernanza ambiental",
            methodology: "Costos evitados de operación/monitoreo y eficiencias por articulación interinstitucional.",
            impact: "Medio (Neutro)",
            icon: Shield,
            color: "text-neutral"
          },
          {
            outcome: "Reputación corporativa y beneficios ESG",
            methodology: "Impact accounting y valoración de marca atribuible al portafolio de créditos (frontera ampliada).",
            impact: "Condicional (Aumenta brecha)",
            icon: Briefcase,
            color: "text-tertiary"
          },
          {
            outcome: "Capital humano y capacidades técnicas",
            methodology: "Costo de reposición de asistencia técnica o retornos a la formación (Mincer) por adopción de prácticas.",
            impact: "Medio-alto (Reduce brecha)",
            icon: Lightbulb,
            color: "text-secondary"
          }
        ],
        story: {
          title: "Riesgo de Brecha",
          text: "La hoja de ruta metodológica identifica seis activos latentes susceptibles de valoración. Sin embargo, la jerarquía de impacto proyectada confirma la asimetría del modelo: mientras Biodiversidad y Agua ostentan un potencial financiero 'Muy Alto', los indicadores de Capital Humano y Cohesión Social se proyectan con impacto 'Medio'. En consecuencia, avanzar en esta medición integral no corregiría la brecha distributiva, sino que validaría técnicamente el desbalance estructural: un SROI dominado por retornos ecosistémicos masivos frente a beneficios sociales comparativamente modestos."
        }
      }
    ]
  }
};