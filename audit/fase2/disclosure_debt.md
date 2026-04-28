# Disclosure debt — F2 → F4/F5

Fecha: 2026-04-28
Branch: refactor/v2

## Contexto

`Indicator` post-F2 expone `disclosure?: Disclosure` (opcional). El plan original proponía promoverlo a obligatorio en F2 con TODO markers inline en cada indicador sin auditoría F1. **Desviación pragmática aplicada en commit 6**: NO se agregaron 49 × ~5 líneas (~245 líneas) de placeholder noise. La deuda queda enumerada acá; F4/F5 fillá con datos reales y endurecerá el campo a obligatorio.

## Conteo

- 53 indicadores en `src/data/`
- − 4 indicadores con disclosure F1 trazable: ST4 (q010), E2 (q011), E5 (q012), E9 (q012)
- − 1 sección con disclosure trazable a section-level: SROI (q013) — cubre SR1, SR2, SR3, SR5 vía herencia documental, pero NO via type-system
- = **49 indicadores sin disclosure individual** (45 no-SROI + 4 SROI)

## Lista enumerada

### Sección SROI (4 indicadores) — herencia section-level [VERSION-LOCK-OVERRIDE q013]
- [ ] SR1 Asimetría de Beneficios
- [ ] SR2 Matriz de Evidencia
- [ ] SR3 Diagnóstico de Estancamiento
- [ ] SR5 Potencial SROI Futuro

**Acción F4/F5**: o (a) duplicar la disclosure section-level inline en cada uno con `note: "Hereda de section. Ver sroi.disclosure. [VERSION-LOCK-OVERRIDE q013]"`, o (b) tipar `Indicator` con `disclosureRef?: 'section'` para indicar herencia explícita.

### Sección Geografía (6 indicadores)
- [ ] G1 Distribución Regional — `chart_bar_horizontal`. Auditoría F1: `audit/fase1/territorial_REPORT.md` G1
- [ ] G2 Índice de Conservación (ICE) — `chart_scatter`. F1: G2
- [ ] G3 Perfil de Tenencia — `chart_bar_horizontal`. F1: G3
- [ ] G4 Madurez en el Proyecto — `chart_bar_horizontal`. F1: G4
- [ ] G5 Pisos Térmicos — `chart_pie`. F1: G5
- [ ] G6 Cobertura Veredal — `kpi_card`. F1: G6

### Sección Población (5 indicadores)
- [ ] P1 Composición por Género — `chart_pie`. F1: P1
- [ ] P2 Jefatura de Hogar por Sexo — `chart_bar_stacked`. F1: P2
- [ ] P3 Pirámide Poblacional — `chart_bar_vertical`. F1: P3
- [ ] P4 Edad Promedio — `kpi_card`. F1: P4
- [ ] P5 Jefatura del Hogar — `kpi_card`. F1: P5

### Sección Ambiental (6 indicadores)
- [ ] A1 Área de Conservación — `kpi_card`. F1: A1
- [ ] A2 Servicios Ecosistémicos — `chart_radar`. F1: A2
- [ ] A3 Fauna Indicadora — `word_count_table`. F1: A3
- [ ] A4 Prácticas de Manejo — `chart_bar_horizontal`. F1: A4
- [ ] A5 Patrón de Tala — `chart_pie`. F1: A5
- [ ] A6 Mitigación Cambio Climático — `kpi_card`. F1: A6

### Sección Social (9 indicadores)
- [ ] S1 Desacople del Incentivo — `chart_line_multi`. F1: S1 (se documentó V-L-O en q008 pero la disclosure no se agregó al code; verificar con coautor si aplica)
- [ ] S2 Destino de la Inversión PSA — `chart_bar_horizontal`. F1: S2
- [ ] S3 Capacidad de Ahorro — `chart_bar_vertical`. F1: S3
- [ ] S4 Acceso a Educación — `kpi_card`. F1: S4
- [ ] S5 Salud (Estufas) — `kpi_card`. F1: S5
- [ ] S6 Participación Comunitaria — `chart_pie`. F1: S6
- [ ] S7 Relaciones Vecinales — `chart_pie`. F1: S7
- [ ] S8 El Valor del Tiempo — `chart_bar_horizontal`. F1: S8
- [ ] S9 Liderazgo Femenino — `chart_bar_stacked`. F1: S9

### Sección Económica (6 indicadores sin disclosure; 3 ya documentados)
- [ ] E1 Tenencia Proyecto — `chart_pie`. F1: E1
- [ ] E3 Erosión del Incentivo — `chart_erosion`. F1: E3
- [ ] E4 Brecha Ingresos (Género) — `chart_bar_vertical`. F1: E4 (E_ANCLA cubre ratio 8,5:1)
- [ ] E6 Generación de Empleo — `kpi_card`. F1: E6
- [ ] E7 Emprendimiento (Origen) — `chart_combo`. F1: E7
- [ ] E8 Empleo Rural — `chart_bar_horizontal`. F1: E8

### Sección Gobernanza (8 indicadores)
- [ ] GO1 Índice de Confianza — `kpi_rating`. F1: GO1
- [ ] GO2 Cobertura Técnica — `chart_pie`. F1: GO2
- [ ] GO3 Frecuencia de Visitas — `chart_bar_vertical`. F1: GO3
- [ ] GO4 Calidad Visita — `kpi_rating`. F1: GO4
- [ ] GO5 Convivencia Vecinal — `chart_pie`. F1: GO5
- [ ] GO6 Puntualidad Pagos — `kpi_rating`. F1: GO6 (PUNTO DE DOLOR)
- [ ] GO7 Transparencia — `kpi_rating`. F1: GO7
- [ ] GO8 Participación — `chart_bar_vertical`. F1: GO8

### Sección Sostenibilidad (5 indicadores sin disclosure; ST4 ya documentado)
- [ ] ST1 Índice de Orgullo — `chart_pie`. F1: ST1
- [ ] ST2 Continuidad (Sin Pago) — `kpi_card`. F1: ST2
- [ ] ST3 Matriz Estratégica — `text_matrix`. F1: ST3
- [ ] ST5 Motivación Principal — `chart_pie`. F1: ST5
- [ ] ST6 La impuntualidad erosiona la confianza — `chart_correlation`. F1: ST6 (correlación r=0.54)

## Plan F4/F5

1. **F4 (visual)**: cuando se agreguen visuales nuevos (boxplot, heatmap, pirámide real), aprovechar para revisar disclosure de los indicadores tocados.
2. **F5 (copys narrativos)**: cada copy revisado debe verificar que el indicador tenga disclosure trazable. Si la fórmula reproduce sobre microdatos, agregar `source` + `transformation` exactos. Si es V-L-O, agregar nota con qNNN.
3. **Cierre F5**: una vez los 49 tengan disclosure, endurecer `IndicatorBase.disclosure: Disclosure` (sin `?`) en `src/types/indicator.ts`. tsc detectará cualquier indicator faltante en compile-time.

## Endurecimiento del tipo

```ts
// Cambio post-F5 en src/types/indicator.ts:
export interface IndicatorBase {
  id: string;
  title: string;
  story: Story;
  disclosure: Disclosure; // sin `?` — obligatorio
  tooltipUnit?: string;
  isAlert?: boolean;
}
```
