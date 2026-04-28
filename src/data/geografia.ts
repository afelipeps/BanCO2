import { Map } from 'lucide-react';
import { THEME } from '../theme';
import type { Section } from '../types';

export const geografia: Section = {
  id: 'GEO',
  title: '1. Geografía',
  subtitle: 'El Territorio',
  description: 'Radiografía territorial del proyecto BancO2 Oriente: cómo se distribuyen los predios y las 22.512 hectáreas bajo acuerdo de conservación en los 15 municipios de la jurisdicción de CORNARE, qué tan fragmentado está el bosque y qué tan profundo llega la intervención a nivel vereda.',
  indicators: [
    {
      id: 'G1',
      title: 'Distribución Regional',
      type: 'chart_bar_horizontal',
      tooltipUnit: '%',
      story: {
        title: 'Corredores Biológicos',
        text: 'La concentración en Puerto Triunfo y San Rafael (37% combinados) responde a la estrategia de conectar parches de bosque fragmentados en el Magdalena Medio.',
      },
      data: [
        { name: 'Puerto Triunfo', value: 18.8, fill: THEME.colors.primary },
        { name: 'San Rafael', value: 18.8, fill: THEME.colors.primary },
        { name: 'San Carlos', value: 13.8, fill: THEME.colors.primary },
        { name: 'La Ceja', value: 12.5, fill: THEME.colors.primary },
        { name: 'Otros (7)', value: 36.1, fill: THEME.colors.secondary },
      ],
    },
    {
      id: 'G2',
      title: 'Índice de Conservación (ICE)',
      type: 'chart_scatter',
      tooltipUnit: 'Ha',
      data: [
        { x: 5, y: 4, z: 10, name: 'Minifundios' },
        { x: 10, y: 8, z: 20, name: 'Pequeños' },
        { x: 50, y: 40, z: 50, name: 'Medianos' },
        { x: 150, y: 120, z: 100, name: 'Latifundios' },
        { x: 300, y: 250, z: 200, name: 'Grandes Reservas' },
      ],
      xLabel: 'Área Total (Ha)',
      yLabel: 'Área Conservada (Ha)',
      story: {
        title: 'Compromiso Escalonable',
        text: 'La relación entre área total del predio y área efectivamente conservada muestra una tendencia clara: tanto minifundistas como medianos y grandes propietarios mantienen una proporción elevada del predio bajo conservación (alrededor del 70–80%).',
      },
    },
    {
      id: 'G3',
      title: 'Perfil de Tenencia',
      type: 'chart_bar_horizontal',
      tooltipUnit: '%',
      data: [
        { name: 'Minifundio (<10Ha)', value: 59.42, fill: THEME.colors.tertiary },
        { name: 'Mediano (10-50Ha)', value: 34.78, fill: THEME.colors.secondary },
        { name: 'Latifundio (>50Ha)', value: 5.80, fill: THEME.colors.primary },
      ],
      story: {
        title: 'Desafío del Minifundio',
        text: 'El 59.4% de los socios son minifundistas. Esto limita la capacidad de escala productiva y aumenta la dependencia del incentivo monetario, aunque se observa una participación importante de predios medianos (34.8%).',
      },
    },
    {
      id: 'G4',
      title: 'Madurez en el Proyecto',
      type: 'chart_bar_horizontal',
      tooltipUnit: '%',
      data: [
        { name: 'Fase A (2017)', value: 8.75, fill: THEME.colors.primary },
        { name: 'Fase A + B (2019)', value: 20.00, fill: THEME.colors.secondary },
        { name: 'Fase A + B + C (2021)', value: 37.50, fill: THEME.colors.tertiary },
        { name: 'Fase A + B + C + D (2023-2024)', value: 33.75, fill: THEME.colors.neutral },
      ],
      story: {
        title: 'Renovación Generacional',
        text: "El 71.25% de las familias se vinculó en las fases más recientes (2021-2024), el reto es transferir la cultura de conservación de los 'Pioneros' a esta nueva ola.",
      },
    },
    {
      id: 'G5',
      title: 'Pisos Térmicos',
      type: 'chart_pie',
      tooltipUnit: '%',
      data: [
        { name: 'Templado (Bosques)', value: 45.00, color: THEME.colors.primary },
        { name: 'Frío (Altiplano)', value: 36.25, color: THEME.colors.secondary },
        { name: 'Cálido (Magdalena)', value: 18.75, color: THEME.colors.tertiary },
      ],
      story: {
        title: 'Diversidad Ecosistémica',
        text: 'La intervención se enfoca principalmente en bosques andinos y subandinos de clima templado, con menor presencia en zonas cálidas y frías, lo cual coincide con los objetivos climáticos e hídricos del proyecto. Además, se destaca que la mayor importancia del proyecto radica en la protección de fuentes de agua para áreas metropolitanas, más allá de la captura de carbono.',
      },
    },
    {
      id: 'G6',
      title: 'Cobertura Veredal',
      type: 'kpi_card',
      kpiValue: '52',
      kpiUnit: 'Veredas Únicas',
      icon: Map,
      trend: 'Alta Capilaridad',
      story: {
        title: 'Profundidad Territorial',
        text: 'El programa tiene presencia en 52 veredas con familias encuestadas, lo que revela una dispersión territorial significativa. BancO₂ no es un proyecto concentrado en una sola cuenca, sino una red fina de puntos de conservación.',
      },
    },
  ],
};
