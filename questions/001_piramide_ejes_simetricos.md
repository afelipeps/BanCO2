# 001 — Pirámide poblacional con ejes simétricos (P3)

**Estado:** **resuelta — Opción A** (Andrés, 2026-04-18) · **Contexto:** auditoría Fase 1 piloto Población · **Afecta:** indicador P3 en `data.tsx:152-168`.

## Contexto

El indicador **P3 "Pirámide Poblacional"** está implementado como `chart_bar_vertical` (recharts), es decir, una barra horizontal simple con los 5 rangos etarios como categorías y un único valor de porcentaje por rango:

```ts
{ name: '<18-30', value: 5.00 },
{ name: '31-45', value: 17.50 },
{ name: '46-60', value: 28.75 },
{ name: '61-75', value: 35.00 },
{ name: '>75',   value: 13.75 },
```

El `visual_rules` del `CLAUDE.md` exige:

> Distribución etaria: pirámide real con eje simétrico por sexo.

La viz actual **viola la regla**: (1) no cruza por sexo; (2) no es simétrica; (3) pierde la señal clave de la narrativa (diferencia por género en cada cohorte etaria, especialmente útil para discutir "estancamiento demográfico" y "doble carga femenina" de forma conjunta).

La sección P3 **no es un ancla**, pero las narrativas "Envejecimiento Acentuado" e "Inclusión Femenina" dependen de que la distribución etaria sea interpretable con granularidad de género.

## Pregunta

¿Qué opción adoptar para Fase 3 (refactor de componentes)?

## Opciones

### A — Pirámide real con ECharts (recomendada)

Reemplazar `chart_bar_vertical` por `chart_pyramid` (ECharts), con:
- Eje Y categorías etarias (5 rangos).
- Eje X simétrico: H con valor negativo (izquierda), M con valor positivo (derecha).
- Etiquetas numéricas absolutas en cada barra.
- Totales marginales (toda la población) disponibles en tooltip.

**Pros:** cumple `visual_rules` textual; ECharts ya está permitido en el stack (`CLAUDE.md` explícita "ECharts para boxplots, heatmaps, scatter, pirámides"); granularidad de género habilita discusión de múltiples narrativas.
**Contras:** agrega dependencia ECharts (~1 MB gzipped) si aún no estaba en bundle; refactor de `IndicatorRenderer` para añadir el tipo `chart_pyramid`.

### B — Dual-bar espejo con recharts

Mantener recharts, componer dos `<BarChart>` horizontales lado a lado (uno mirando a la izquierda con sexo H, otro a la derecha con sexo M).

**Pros:** sin nueva dependencia.
**Contras:** es un hack; la simetría depende de estilos CSS y no del dominio; el usuario final ve dos charts, no uno.

### C — Mantener como está

Dejar `chart_bar_vertical` y documentar la violación en el report.

**Pros:** cero cambio.
**Contras:** viola `visual_rules` explícitamente. Deja deuda técnica visible hasta Fase 4.

## Recomendación tentativa

**Opción A.** La regla es textual y explícita; ECharts está autorizado en `CLAUDE.md`; el costo de bundle se amortiza si otros indicadores migran (boxplots de ingreso, heatmaps Likert). Además: la pirámide real habilita leer "estancamiento demográfico" y "doble carga femenina" en una sola viz, densidad narrativa alta.

## Decisión

**Opción A aprobada** por Andrés el 2026-04-18. Se implementa en Fase 4 (migración visual), no en Fase 3 (decisiones de stack). La Fase 1 es diagnóstico; la Fase 3 sólo decide tecnología y la Fase 4 ejecuta la migración.
